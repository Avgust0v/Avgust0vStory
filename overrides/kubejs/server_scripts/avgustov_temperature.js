// AvgustovStory 1.2.3: fixes for Legendary Survival Overhaul (LSO) temperature. Replaces avgustov_ship_heat.js.
//
// 1. Ships (Sable). The blocks of an assembled ship live in Sable's plot space, far from where the ship flies, and
//    LSO only looks at the world (user, 22.11.2026: "мёрзли на дирижабле даже у костра"). For a player touching a ship
//    the script runs LSO's own block heat routine (BlockModifier: spread through air and walls) at the player's
//    position in ship space. Campfires, furnaces and burners on board warm, ice and soul campfires cool.
// 2. Ship roofs. LSO decides "undercover" by the world sky only, so in a ship cabin it rained on you. Under a ship roof
//    (Sable's sky check with sub-levels) rain and snow no longer chill and the wetness LSO adds in the rain is removed.
// 3. Shade (user: "давай починим и тень"). LSO's WeatherModifier compares the absolute world time with 12000 (no
//    % 24000), so its shade (-6 * sin at noon, under a roof or in rain, in biomes rated 9+) only worked on the first day
//    of a world. The script adds the shade with the real time of day, under any roof: blocks, caves, ship roofs.
// 4. Water and rain in warm weather (user: "когда плаваешь начинаешь мерзнуть, хотя мы в тёплом биоме"). LSO's
//    wetness takes up to -10 everywhere, so a swim in the plains (22 by day, 18 at night on boottest) gave 12 and 8.
//    Now the chill depends on the dry target (what you would have dry): from 20 up wetness takes you no lower than
//    16; from 12 to 20 no lower than 6..16; below 12 it chills fully as before. In the heat it still cools fully.
//
// Everything goes to one transient modifier on LSO's heating_temperature attribute (not saved, range +-10000; LSO adds
// heating and cooling attributes as they are, so a negative value cools). It stays at 0 when nothing applies: both
// removeModifier overloads are ambiguous for KubeJS's Rhino.
// Constants mirror config/legendarysurvivaloverhaul-common.toml.

var AV_TEMP_REACH = 3;          // half-size of the box around the player that must touch a ship
var AV_TEMP_MAX = 20;           // cap for the whole correction
var AV_TEMP_WET = 10;           // "Wetness Under Rain Increase" 7 + "Wetness Decrease" 3
var AV_TEMP_SHADE = -6;         // "Shade Time Modifier"
var AV_TEMP_SHADE_MIN = 9;      // "Shade Time Modifier Threshold" (biome + season rating)
var AV_TEMP_WET_DRY = [12, 20]; // dry target: full chill below the first, warm from the second
var AV_TEMP_WET_FLOOR = [6, 16]; // lowest wet target at those two points (linear between, flat above)
var AV_TEMP = null;             // loaded API, or false when a mod is missing

function avTempApi() {
  if (AV_TEMP !== null) return AV_TEMP;
  try {
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation');
    var BI = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries');
    var Reg = Java.loadClass('sfiomn.legendarysurvivaloverhaul.registry.TemperatureModifierRegistry');
    AV_TEMP = {
      sable: Java.loadClass('dev.ryanhcode.sable.Sable').HELPER,
      sky: Java.loadClass('dev.ryanhcode.sable.mixinhelpers.entity.sublevels_block_sky.SubLevelsBlockSkyMixinHelper'),
      Box: Java.loadClass('dev.ryanhcode.sable.companion.math.BoundingBox3d'),
      Vec3: Java.loadClass('net.minecraft.world.phys.Vec3'),
      BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
      surface: Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types').MOTION_BLOCKING,
      Mod: Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier'),
      Op: Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier$Operation'),
      wet: Java.loadClass('sfiomn.legendarysurvivaloverhaul.api.wetness.WetnessUtil'),
      target: Java.loadClass('sfiomn.legendarysurvivaloverhaul.api.temperature.TemperatureUtil'),
      blocks: Reg.BLOCKS.get(),
      weather: Reg.WEATHER.get(),
      biome: Reg.BIOME.get(),
      serene: Reg.SERENE_SEASONS.get(),
      ecliptic: Reg.ECLIPTIC_SEASONS.get(),
      wetness: Reg.WETNESS.get(),
      heat: BI.ATTRIBUTE.wrapAsHolder(BI.ATTRIBUTE.get(RL.parse('legendarysurvivaloverhaul:heating_temperature'))),
      id: RL.parse('avgustov:ship_heat')
    };
  } catch (err) {
    console.warn('[avgustov] temperature fixes off: ' + err);
    AV_TEMP = false;
  }
  return AV_TEMP;
}

// 1. Heat (+) or cold (-) from the blocks of the ship the player touches, 0 when not on a ship.
function avTempShipBlocks(api, p) {
  var level = p.level;
  var x = p.getX(), y = p.getY() + 0.5, z = p.getZ();
  var r = AV_TEMP_REACH;
  var it = api.sable.getAllIntersecting(level, new api.Box(x - r, y - r, z - r, x + r, y + r, z + r)).iterator();
  var best = 0;
  while (it.hasNext()) {
    var local = it.next().logicalPose().transformPositionInverse(new api.Vec3(x, y, z));
    var t = api.blocks.getWorldInfluence(p, level, api.BlockPos.containing(local.x(), local.y(), local.z()));
    if (Math.abs(t) > Math.abs(best)) best = t;
  }
  return best;
}

// 2. True when a ship covers the player's head but the world sky is open.
function avTempShipRoof(api, p) {
  var level = p.level;
  var pos = api.BlockPos.containing(p.getX(), p.getEyeY(), p.getZ());
  if (!level.canSeeSky(pos)) return false;
  var x = p.getX(), z = p.getZ();
  var above = api.sable.getAllIntersecting(level, new api.Box(x - 0.5, p.getEyeY(), z - 0.5, x + 0.5, level.getMaxBuildHeight(), z + 0.5));
  if (!above.iterator().hasNext()) return false;
  return api.sky.checkSkyWithSublevels(level, pos); // true = a sub-level is hit on the way up
}

// Biome + season rating, as LSO's WeatherModifier sums it for the shade threshold.
function avTempRating(api, p, level, pos) {
  return api.biome.getWorldInfluence(p, level, pos) + api.serene.getWorldInfluence(p, level, pos) +
    api.ecliptic.getWorldInfluence(p, level, pos);
}

// LSO's shade term for a given time value (the real time of day, or LSO's absolute one).
function avTempShade(rating, t) {
  if (t > 12000 || rating < AV_TEMP_SHADE_MIN) return 0;
  return AV_TEMP_SHADE * Math.sin(t * Math.PI / 12000);
}

// LSO's own cover test: no sky, or blocks above in the motion-blocking heightmap.
function avTempWorldCover(api, level, pos) {
  return !level.canSeeSky(pos) || level.getHeight(api.surface, pos.getX(), pos.getZ()) > pos.getY();
}

// 2 + 3. Correction of LSO's weather modifier: real shade, and a ship roof counts as a roof.
function avTempWeather(api, p, rating, shipRoof) {
  var level = p.level, pos = p.blockPosition(), above = pos.above();
  var abs = Number(level.getLevelData().getDayTime());
  var tod = abs % 24000;
  var lsoShade = avTempShade(rating, abs), realShade = avTempShade(rating, tod);
  if (avTempWorldCover(api, level, above)) return realShade - lsoShade;
  if (shipRoof) return realShade - api.weather.getWorldInfluence(p, level, pos);
  if (level.isRaining() && String(level.getBiome(above).value().getPrecipitationAt(above)) !== 'NONE') return realShade - lsoShade;
  return 0;
}

// 4. How much of LSO's wetness chill (wet <= 0) to give back. dry = the target without wetness, with this script's
// other corrections.
function avTempWetFloor(wet, dry) {
  var d = AV_TEMP_WET_DRY, f = AV_TEMP_WET_FLOOR;
  if (wet > -0.05 || dry < d[0]) return 0;
  var floor = dry >= d[1] ? f[1] : f[0] + (dry - d[0]) * (f[1] - f[0]) / (d[1] - d[0]);
  var lowest = Math.min(dry, floor);
  return Math.max(0, lowest - (dry + wet));
}

function avTempSet(inst, api, v) {
  v = Math.round(v * 100) / 100;
  var old = inst.getModifier(api.id);
  if (old ? old.amount() === v : v === 0) return;
  inst.addOrUpdateTransientModifier(new api.Mod(api.id, v, api.Op.ADD_VALUE));
}

// Full update, every 2 s. Returns the parts, for tests.
function avTempUpdate(p) {
  var api = avTempApi();
  if (!api) return null;
  var inst = p.getAttribute(api.heat);
  if (!inst) return null;
  var level = p.level, pos = p.blockPosition();
  var rating = avTempRating(api, p, level, pos);
  var roof = avTempShipRoof(api, p);
  var parts = { ship: avTempShipBlocks(api, p), weather: avTempWeather(api, p, rating, roof), wet: 0, roof: roof, rating: rating };
  var wet = api.wetness.getPlayerInfluence(p);
  if (wet < -0.05) {
    var old = inst.getModifier(api.id);
    var lso = api.target.getPlayerTargetTemperature(p) - (old ? old.amount() : 0);
    parts.wet = avTempWetFloor(wet, lso - wet + parts.ship + parts.weather);
  }
  var t = Math.max(-AV_TEMP_MAX, Math.min(AV_TEMP_MAX, parts.ship + parts.weather + parts.wet));
  if (Math.abs(t) < 0.05) t = 0;
  avTempSet(inst, api, t);
  parts.total = t;
  return parts;
}

// 2. Wetness, every 0.5 s: under a ship roof in the rain, take back what LSO adds there plus its normal drying.
function avTempWetUpdate(p) {
  var api = avTempApi();
  if (!api || p.isInWaterOrBubble()) return false;
  // vanilla isRainingAt: raining, open sky in the world, rain (not snow) here. LSO's WorldUtil can't be used from
  // scripts on a server: Rhino fails on its client-only methods.
  if (!p.level.isRainingAt(p.blockPosition().above())) return false;
  if (!avTempShipRoof(api, p)) return false;
  api.wet.addWetness(p, -AV_TEMP_WET);
  return true;
}

ServerEvents.tick(function (e) {
  var s = e.server;
  var tick = s.tickCount;
  if (tick % 10 !== 3) return;
  s.players.forEach(function (p) {
    if (p.isSpectator() || AV_TEMP === false) return;
    try {
      avTempWetUpdate(p);
      if (tick % 40 === 3) avTempUpdate(p);
    } catch (err) {
      console.warn('[avgustov] temperature fixes off after an error for ' + p.username + ': ' + err);
      AV_TEMP = false; // one warning instead of one every half second
    }
  });
});
