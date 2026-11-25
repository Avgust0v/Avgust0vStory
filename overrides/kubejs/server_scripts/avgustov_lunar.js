// AvgustovStory 1.3.0 (25.11.2026, user: "квесты лунных событий"): progress for the «Под луной» chapter.
// Enhanced Celestials 2 has no advancements; every 5 s this script reads the overworld's current lunar event
// (EnhancedCelestials.lunarForecastWorldData(level) -> LunarForecast.currentLunarEventHolder()) and grants
// avgustov:lunar/* (kubejs/data/avgustov/advancement/lunar, written by quest_generator/gen/lunar.js):
//   blood_hunt  20 hostile mobs killed under blood moons (counted over several moons)
//   blood_dawn  in the overworld when a blood moon rose and still there, alive, when it set
//   harvest     32 ripe crops broken by hand under harvest moons
//   blue_luck   +5 experience levels within one blue moon
//   slime_moon  8 slimes killed during super moons
// Super blood/harvest/blue moons count as the plain kind.
var LUN_EC = Java.loadClass('dev.corgitaco.enhancedcelestials2core.EnhancedCelestials');
var LUN_EntityType = Java.loadClass('net.minecraft.world.entity.EntityType');
var LUN_CropBlock = Java.loadClass('net.minecraft.world.level.block.CropBlock');
var lunKind = '', lunSurvivors = {}, lunBlueStart = {};

function lunEventId(level) {
  try {
    var o = LUN_EC.lunarForecastWorldData(level);
    if (!o.isPresent()) return '';
    return String(o.get().currentLunarEventHolder().unwrapKey().get().location());
  } catch (err) { return ''; }
}
function lunKindOf(id) {
  if (/blood_moon$/.test(id)) return 'blood';
  if (/harvest_moon$/.test(id)) return 'harvest';
  if (/blue_moon$/.test(id)) return 'blue';
  if (/super_moon$/.test(id)) return 'super';
  return '';
}
function lunGrant(s, name, id) { s.runCommandSilent('advancement grant ' + name + ' only avgustov:lunar/' + id); }
function lunCount(p, key, need, adv) {
  var pd = p.persistentData, n = (pd.contains(key) ? pd.getInt(key) : 0) + 1;
  pd.putInt(key, n);
  if (n >= need) lunGrant(p.server, p.username, adv);
}
function lunInOverworld(p) { return String(p.level.dimension) === 'minecraft:overworld'; }

ServerEvents.tick(function (e) {
  var s = e.server;
  if (s.tickCount % 100 !== 0) return;
  try {
    var id = lunEventId(s.overworld()), kind = lunKindOf(id);
    if (kind !== lunKind) {
      console.info('[lunar] event now: ' + (id || 'none') + ' (was ' + (lunKind || 'none') + ')');
      if (lunKind === 'blood') for (var n in lunSurvivors) {
        var sp = s.getPlayerList().getPlayerByName(n);
        if (sp != null && sp.isAlive() && lunInOverworld(sp)) lunGrant(s, n, 'blood_dawn');
      }
      lunSurvivors = {}; lunBlueStart = {};
      if (kind === 'blood') s.players.forEach(function (p) { if (lunInOverworld(p)) lunSurvivors[p.username] = true; });
      lunKind = kind;
    }
    if (kind === 'blue') s.players.forEach(function (p) {
      var n = p.username, lv = p.experienceLevel;
      if (lunBlueStart[n] === undefined) lunBlueStart[n] = lv;
      else if (lv - lunBlueStart[n] >= 5) lunGrant(s, n, 'blue_luck');
    });
  } catch (err) { console.warn('[lunar] tick: ' + err); }
});

EntityEvents.death(function (e) {
  var ent = e.entity;
  if (lunKind === 'blood' && ent.isPlayer()) { delete lunSurvivors[ent.username]; return; }
  if (lunKind !== 'blood' && lunKind !== 'super') return;
  try {
    var atk = e.source.getEntity();
    if (atk == null || !atk.isPlayer() || !lunInOverworld(atk)) return;
    var type = String(LUN_EntityType.getKey(ent.getType()));
    if (lunKind === 'blood' && ent.isMonster()) lunCount(atk, 'lun_blood_kills', 20, 'blood_hunt');
    if (lunKind === 'super' && /slime/.test(type) && !/magma/.test(type)) lunCount(atk, 'lun_slimes', 8, 'slime_moon');
  } catch (err) { console.warn('[lunar] death: ' + err); }
});

BlockEvents.broken(function (e) {
  if (lunKind !== 'harvest') return;
  try {
    var st = e.block.blockState, b = st.getBlock();
    if (!(b instanceof LUN_CropBlock) || !b.isMaxAge(st)) return;
    lunCount(e.player, 'lun_harvest', 32, 'harvest');
  } catch (err) { console.warn('[lunar] harvest: ' + err); }
});
