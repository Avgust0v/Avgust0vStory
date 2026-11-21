// AvgustovStory 1.1-dev.11j: mob zones (mob audit 2026-11-19, tested on boottest-1.1).
// Overworld monsters get harder with distance from 0 0 (same rings as tools/distance_loot.js) and with the world era:
//   zone: core < 800 | home < 2000 | far < 3500 | remote (max(|x|,|z|), like the loot rings)
//   era bonus: scoreboard av_era for the holder #world (set by a command reward in each era-gate quest, it only goes up):
//              era < 2 -> +0, brass quest (sets 2) -> +1, steel quest (sets 6) and later -> +2 (VERSIONS.md; audit 19.11)
//   level = min(4, zone + era bonus)
// 1. Gate: listed mini-bosses do not spawn NATURALLY below their level (structures, spawners, eggs untouched).
// 2. Scaling: once, at spawn, permanent attribute modifiers (survive reloads); bosses in AVBS (avgustov_bosses.js) are skipped,
//    they have the B1-B6 ladder and party scaling. Normal mobs get no party scaling: every player already has own mob cap.
// 3. Elites: a small share gets x2 health and Speed I; persistentData.avElite for a later loot/xp hook.
// Every hook is wrapped (Neruina stops the server after repeated entity-tick exceptions).
const AVMZ_Finalize = Java.loadClass('net.neoforged.neoforge.event.entity.living.FinalizeSpawnEvent');
const AVMZ_Enemy = Java.loadClass('net.minecraft.world.entity.monster.Enemy');
const AVMZ_EntityType = Java.loadClass('net.minecraft.world.entity.EntityType');
const AVMZ_Attributes = Java.loadClass('net.minecraft.world.entity.ai.attributes.Attributes');
const AVMZ_Modifier = Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier');
const AVMZ_Op = Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier$Operation');
const AVMZ_RL = Java.loadClass('net.minecraft.resources.ResourceLocation');
const AVMZ_Effect = Java.loadClass('net.minecraft.world.effect.MobEffectInstance');
const AVMZ_Effects = Java.loadClass('net.minecraft.world.effect.MobEffects');
const AVMZ_ScoreHolder = Java.loadClass('net.minecraft.world.scores.ScoreHolder');

const AVMZ_RINGS = [800, 2000, 3500];                 // zone 0..3
const AVMZ_HP = [0, 0.2, 0.5, 1.0, 1.5];               // ADD_MULTIPLIED_BASE on max health, by level
const AVMZ_ATK = [0, 0, 1, 2, 3];                      // + attack damage
const AVMZ_ARMOR = [0, 0, 2, 4, 6];                    // + armor
const AVMZ_ELITE = [0, 0.02, 0.04, 0.07, 0.10];        // elite chance
// minimum level for a NATURAL / CHUNK_GENERATION spawn
const AVMZ_GATE = {
  'mutantmonsters:mutant_zombie': 1, 'mutantmonsters:mutant_skeleton': 1, 'mutantmonsters:mutant_creeper': 1,
  'mutantmonsters:mutant_enderman': 4,                 // safety net; config weight should be 0
  'enderzoology:fallen_knight': 1, 'rottencreatures:dead_beard': 1,
  'minecraft:illusioner': 1, 'friendsandfoes:illusioner': 1
};
// spawn reasons that get scaled (eggs, commands, buckets, breeding, conversions, trial spawners are left alone)
const AVMZ_SCALE = { NATURAL: 1, CHUNK_GENERATION: 1, SPAWNER: 1, STRUCTURE: 1, PATROL: 1, REINFORCEMENT: 1, JOCKEY: 1 };
const AVMZ_ID = function (s) { return AVMZ_RL.fromNamespaceAndPath('avgustov', s); };

var AVMZ_ERA = 0, AVMZ_OOPS = false;
const avmzOops = function (err) { if (!AVMZ_OOPS) { AVMZ_OOPS = true; console.error('[avgustov] mob zones failed: ' + err); } };

ServerEvents.loaded(function (e) { e.server.runCommandSilent('scoreboard objectives add av_era dummy'); });
ServerEvents.tick(function (e) {
  if (e.server.tickCount % 200 !== 0) return;
  try {
    var sb = e.server.getScoreboard(), obj = sb.getObjective('av_era');
    var info = obj ? sb.getPlayerScoreInfo(AVMZ_ScoreHolder.forNameOnly('#world'), obj) : null;
    AVMZ_ERA = info ? info.value() : 0;
  } catch (err) { avmzOops(err); }
});

const avmzAdd = function (m, attr, key, amount, op) {
  var a = m.getAttribute(attr); if (!a || !amount) return;
  // 1.2.3: removeModifier(id) is ambiguous for Rhino and threw here since 19.11, so no mob was ever scaled
  a.addOrReplacePermanentModifier(new AVMZ_Modifier(AVMZ_ID(key), amount, op));
};

NativeEvents.onEvent(AVMZ_Finalize, function (e) {
  try {
    var m = e.getEntity(); if (!(m instanceof AVMZ_Enemy)) return;
    var lv = m.level; if (typeof lv === 'function') lv = m.level();   // KubeJS: level is a property
    var dm = lv.dimension; if (typeof dm === 'function') dm = lv.dimension();
    if (String(dm).indexOf('minecraft:overworld') < 0) return;
    var tt = m.getType(), ts = String(tt), id = (ts.indexOf(':') > 0 && ts.indexOf(' ') < 0) ? ts : String(AVMZ_EntityType.getKey(tt)), why = String(e.getSpawnType());
    var d = Math.max(Math.abs(e.getX()), Math.abs(e.getZ())), zone = 0;
    while (zone < AVMZ_RINGS.length && d >= AVMZ_RINGS[zone]) zone++;
    var lvl = Math.min(4, zone + (AVMZ_ERA >= 6 ? 2 : AVMZ_ERA >= 2 ? 1 : 0));
    var gate = AVMZ_GATE[id];
    if (gate !== undefined && lvl < gate && (why === 'NATURAL' || why === 'CHUNK_GENERATION')) { e.setSpawnCancelled(true); return; }
    if (typeof AVBS !== 'undefined' && AVBS[id]) return;
    if (!lvl || !AVMZ_SCALE[why]) return;
    avmzAdd(m, AVMZ_Attributes.MAX_HEALTH, 'zone_hp', AVMZ_HP[lvl], AVMZ_Op.ADD_MULTIPLIED_BASE);
    avmzAdd(m, AVMZ_Attributes.ATTACK_DAMAGE, 'zone_atk', AVMZ_ATK[lvl], AVMZ_Op.ADD_VALUE);
    avmzAdd(m, AVMZ_Attributes.ARMOR, 'zone_armor', AVMZ_ARMOR[lvl], AVMZ_Op.ADD_VALUE);
    if (Math.random() < AVMZ_ELITE[lvl]) {
      avmzAdd(m, AVMZ_Attributes.MAX_HEALTH, 'zone_elite', 1.0, AVMZ_Op.ADD_MULTIPLIED_BASE);
      m.addEffect(new AVMZ_Effect(AVMZ_Effects.MOVEMENT_SPEED, -1, 0));
      m.persistentData.putBoolean('avElite', true);   // reward: see the death hook below
    }
    m.persistentData.putInt('avZone', lvl);
    m.setHealth(m.getMaxHealth());
  } catch (err) { avmzOops(err); }
});
// Era-gate quests (first quest of era_2_brass, era_6_steel, ...): command reward, elevated permissions:
//   execute unless score #world av_era matches 2.. run scoreboard players set #world av_era 2

// dev.11j: elite reward. When a player kills an elite (x2 health, Speed I) it drops 8 xp per zone level and, with a
// 35-65% chance, 2 Numismatics spurs per level (spur = the smallest coin, so the contract economy is not touched).
EntityEvents.death(function (e) {
  try {
    var m = e.entity; if (!m || !m.persistentData || !m.persistentData.getBoolean('avElite')) return;
    var killer = null; try { killer = e.source.getPlayer(); } catch (x) {}
    if (!killer) return;
    var lvl = Math.max(1, Math.min(4, m.persistentData.getInt('avZone')));
    var pos = m.getX().toFixed(2) + ' ' + (m.getY() + 0.5).toFixed(2) + ' ' + m.getZ().toFixed(2);
    e.server.runCommandSilent('execute in minecraft:overworld run summon minecraft:experience_orb ' + pos + ' {Value:' + (8 * lvl) + '}');
    if (Math.random() < 0.25 + 0.1 * lvl) e.server.runCommandSilent('execute in minecraft:overworld run summon minecraft:item ' + pos + ' {Item:{id:"numismatics:spur",count:' + (2 * lvl) + '}}');
  } catch (err) { avmzOops(err); }
});
