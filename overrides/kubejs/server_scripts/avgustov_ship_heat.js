// AvgustovStory 1.2.3: Legendary Survival Overhaul (LSO) temperature on Sable ships (airships, boats).
// The blocks of an assembled ship live in Sable's plot space, far from where the ship flies, and LSO only looks at
// the world. So on board (user, 22.11.2026: "мёрзли на дирижабле даже у костра"):
//   - campfires, furnaces, burners and ice on the ship did nothing;
//   - a ship roof was not a roof: rain soaked players in the cabin (wetness -10, rain -2, snow -6) and gave no shade.
// What this script does:
//   1. Every 2 s, for a player touching a ship: runs LSO's own block heat routine (BlockModifier, the spread through
//      air and walls it uses in the world) at the player's position in ship space.
//   2. Every 2 s, for a player under a ship roof while the sky is open in the world (Sable's sky check with
//      sub-levels): adds the difference between LSO's weather modifier undercover and in the open, so rain and snow
//      stop chilling and the shade works.
//   3. Every 0.5 s under a ship roof in the rain: removes the wetness LSO adds there (+7 per 10 ticks) plus its normal
//      drying (-3), the values from legendarysurvivaloverhaul-common.toml.
// 1 + 2 go to one transient modifier on LSO's heating_temperature attribute (not saved). LSO adds heating and
// cooling attributes as they are (range -10000..10000), so a negative value cools.
// It is kept at 0 off the ship: both removeModifier overloads are ambiguous for KubeJS's Rhino.

var AV_SH_REACH = 3;   // half-size of the box around the player that must touch the ship
var AV_SH_MAX = 20;    // cap for the added heat or cold
var AV_SH_WET = 10;    // LSO "Wetness Under Rain Increase" 7 + "Wetness Decrease" 3
var AV_SH = null;      // loaded API, or false when a mod is missing

function avShipHeatApi() {
  if (AV_SH !== null) return AV_SH;
  try {
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation');
    var BI = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries');
    var Reg = Java.loadClass('sfiomn.legendarysurvivaloverhaul.registry.TemperatureModifierRegistry');
    var attr = function (id) { return BI.ATTRIBUTE.wrapAsHolder(BI.ATTRIBUTE.get(RL.parse(id))); };
    AV_SH = {
      sable: Java.loadClass('dev.ryanhcode.sable.Sable').HELPER,
      sky: Java.loadClass('dev.ryanhcode.sable.mixinhelpers.entity.sublevels_block_sky.SubLevelsBlockSkyMixinHelper'),
      Box: Java.loadClass('dev.ryanhcode.sable.companion.math.BoundingBox3d'),
      Vec3: Java.loadClass('net.minecraft.world.phys.Vec3'),
      BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
      surface: Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types').MOTION_BLOCKING,
      Mod: Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier'),
      Op: Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier$Operation'),
      wet: Java.loadClass('sfiomn.legendarysurvivaloverhaul.api.wetness.WetnessUtil'),
      blocks: Reg.BLOCKS.get(),
      weather: Reg.WEATHER.get(),
      heat: attr('legendarysurvivaloverhaul:heating_temperature'),
      heatId: RL.parse('avgustov:ship_heat')
    };
  } catch (err) {
    console.warn('[avgustov] ship heat off: ' + err);
    AV_SH = false;
  }
  return AV_SH;
}

// Heat (+) or cold (-) from the blocks of the ship the player touches, 0 when not on a ship.
function avShipBlocksAt(api, p) {
  var level = p.level;
  var x = p.getX(), y = p.getY() + 0.5, z = p.getZ();
  var r = AV_SH_REACH;
  var it = api.sable.getAllIntersecting(level, new api.Box(x - r, y - r, z - r, x + r, y + r, z + r)).iterator();
  var best = 0;
  while (it.hasNext()) {
    var local = it.next().logicalPose().transformPositionInverse(new api.Vec3(x, y, z));
    var t = api.blocks.getWorldInfluence(p, level, api.BlockPos.containing(local.x(), local.y(), local.z()));
    if (Math.abs(t) > Math.abs(best)) best = t;
  }
  return best;
}

// True when a ship covers the player's head but LSO sees open sky.
function avShipRoof(api, p) {
  var level = p.level;
  var pos = api.BlockPos.containing(p.getX(), p.getEyeY(), p.getZ());
  if (!level.canSeeSky(pos)) return false;
  var x = p.getX(), z = p.getZ();
  var above = api.sable.getAllIntersecting(level, new api.Box(x - 0.5, p.getEyeY(), z - 0.5, x + 0.5, level.getMaxBuildHeight(), z + 0.5));
  if (!above.iterator().hasNext()) return false;
  return api.sky.checkSkyWithSublevels(level, pos); // true = a sub-level is hit on the way up
}

// LSO weather modifier undercover minus in the open, at the player's column. Undercover is read just under the
// ground surface: same biome, time and season, but no sky for LSO.
function avShipRoofWeather(api, p) {
  var level = p.level;
  var bx = Math.floor(p.getX()), bz = Math.floor(p.getZ());
  var open = api.weather.getWorldInfluence(p, level, p.blockPosition());
  // LSO checks the cover at pos.above() by canSeeSky, so 2 blocks under the surface counts as a roof
  var under = new api.BlockPos(bx, level.getHeight(api.surface, bx, bz) - 2, bz);
  var covered = api.weather.getWorldInfluence(p, level, under);
  return covered - open;
}

function avShipSet(inst, api, id, v) {
  v = Math.round(v * 100) / 100;
  var old = inst.getModifier(id);
  if (old ? old.amount() === v : v === 0) return;
  inst.addOrUpdateTransientModifier(new api.Mod(id, v, api.Op.ADD_VALUE));
}

// Full update, every 2 s. Returns the total applied, for tests.
function avShipHeatUpdate(p) {
  var api = avShipHeatApi();
  if (!api) return 0;
  var heat = p.getAttribute(api.heat);
  if (!heat) return 0;
  var t = avShipBlocksAt(api, p);
  if (avShipRoof(api, p)) t += avShipRoofWeather(api, p);
  t = Math.max(-AV_SH_MAX, Math.min(AV_SH_MAX, t));
  if (Math.abs(t) < 0.05) t = 0;
  avShipSet(heat, api, api.heatId, t);
  return t;
}

// Wetness, every 0.5 s. Returns true when it dried the player, for tests.
function avShipWetUpdate(p) {
  var api = avShipHeatApi();
  if (!api || p.isInWaterOrBubble()) return false;
  // vanilla isRainingAt: raining, open sky in the world, rain (not snow) at this height. LSO's WorldUtil can't be
  // used from scripts on a server: Rhino fails on its client-only methods.
  if (!p.level.isRainingAt(p.blockPosition().above())) return false;
  if (!avShipRoof(api, p)) return false;
  api.wet.addWetness(p, -AV_SH_WET);
  return true;
}

ServerEvents.tick(function (e) {
  var s = e.server;
  var tick = s.tickCount;
  if (tick % 10 !== 3) return;
  s.players.forEach(function (p) {
    if (p.isSpectator() || AV_SH === false) return;
    try {
      avShipWetUpdate(p);
      if (tick % 40 === 3) avShipHeatUpdate(p);
    } catch (err) {
      console.warn('[avgustov] ship heat off after an error for ' + p.username + ': ' + err);
      AV_SH = false; // one warning instead of one every half second
    }
  });
});
