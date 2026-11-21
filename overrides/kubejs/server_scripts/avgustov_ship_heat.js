// AvgustovStory 1.2.3: heat sources on Sable ships (airships, boats) warm the crew.
// Legendary Survival Overhaul looks for heat blocks in the world around the player, but the blocks of an assembled
// ship live in Sable's plot space, far from where the ship flies. So campfires, furnaces and burners on board never
// warmed anyone (user, 22.11.2026: "мёрзли на дирижабле даже у костра").
// Every 2 seconds, for each player touching a ship, this runs LSO's own block heat routine (BlockModifier, the same
// spread through air and walls it uses in the world) at the player's position in ship space, and adds the result as
// a transient heating_temperature modifier. Off the ship the modifier is removed; transient modifiers are not saved.

var AV_SH_REACH = 3;   // half-size of the box around the player that must touch the ship
var AV_SH_MAX = 20;    // cap for the added heat
var AV_SH = null;      // loaded API, or false when a mod is missing

function avShipHeatApi() {
  if (AV_SH !== null) return AV_SH;
  try {
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation');
    var BI = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries');
    var Reg = Java.loadClass('sfiomn.legendarysurvivaloverhaul.registry.TemperatureModifierRegistry');
    AV_SH = {
      sable: Java.loadClass('dev.ryanhcode.sable.Sable').HELPER,
      Box: Java.loadClass('dev.ryanhcode.sable.companion.math.BoundingBox3d'),
      Vec3: Java.loadClass('net.minecraft.world.phys.Vec3'),
      BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
      Mod: Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier'),
      Op: Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier$Operation'),
      blocks: Reg.BLOCKS.get(),
      heat: BI.ATTRIBUTE.wrapAsHolder(BI.ATTRIBUTE.get(RL.parse('legendarysurvivaloverhaul:heating_temperature'))),
      id: RL.parse('avgustov:ship_heat')
    };
  } catch (err) {
    console.warn('[avgustov] ship heat off: ' + err);
    AV_SH = false;
  }
  return AV_SH;
}

// Heat from the ship's own blocks at the player's position, 0 when not on a ship.
function avShipHeatAt(api, p) {
  var level = p.level;
  var x = p.getX(), y = p.getY() + 0.5, z = p.getZ();
  var r = AV_SH_REACH;
  var it = api.sable.getAllIntersecting(level, new api.Box(x - r, y - r, z - r, x + r, y + r, z + r)).iterator();
  var best = 0;
  while (it.hasNext()) {
    var local = it.next().logicalPose().transformPositionInverse(new api.Vec3(x, y, z));
    var t = api.blocks.getWorldInfluence(p, level, api.BlockPos.containing(local.x(), local.y(), local.z()));
    if (t > best) best = t;
  }
  return Math.min(best, AV_SH_MAX);
}

// Returns the heat applied, for tests.
function avShipHeatUpdate(p) {
  var api = avShipHeatApi();
  if (!api) return 0;
  var inst = p.getAttribute(api.heat);
  if (!inst) return 0;
  var t = avShipHeatAt(api, p);
  // Off the ship the modifier stays at 0: both removeModifier overloads are ambiguous for KubeJS's Rhino.
  var v = t > 0.05 ? Math.round(t * 100) / 100 : 0;
  var old = inst.getModifier(api.id);
  if (old && old.amount() === v) return t;
  if (!old && v === 0) return t;
  inst.addOrUpdateTransientModifier(new api.Mod(api.id, v, api.Op.ADD_VALUE));
  return t;
}

ServerEvents.tick(function (e) {
  var s = e.server;
  if (s.tickCount % 40 !== 7) return;
  s.players.forEach(function (p) {
    if (p.isSpectator()) return;
    try {
      avShipHeatUpdate(p);
    } catch (err) {
      console.warn('[avgustov] ship heat off after an error for ' + p.username + ': ' + err);
      AV_SH = false; // one warning instead of one every 2 seconds
    }
  });
});
