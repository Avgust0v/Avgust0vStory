// AvgustovStory 1.1-dev.9: bosses feed the heart system (avgustov_kitchen_hearts.js).
// The first time a player is near (64 blocks, same dimension) when a boss falls, they get a reward once per boss kind:
// a big boss gives a whole Crystal Heart (+1 heart on right click), a smaller one 3 Crystal Heart fragments (9 = one heart).
// Kept in server persistent data: av_hearts/<uuid>/bosses/<entity id>.
const AV_BH_HEART = ['cataclysm:ignis', 'cataclysm:the_harbinger', 'cataclysm:the_leviathan', 'cataclysm:netherite_monstrosity',
  'cataclysm:ender_guardian', 'cataclysm:ancient_remnant', 'cataclysm:maledictus', 'cataclysm:scylla',
  'minecraft:ender_dragon', 'minecraft:wither', 'minecraft:warden',
  'bosses_of_mass_destruction:lich', 'bosses_of_mass_destruction:gauntlet', 'bosses_of_mass_destruction:obsidilith', 'bosses_of_mass_destruction:void_blossom',
  'block_factorys_bosses:infernal_dragon', 'archaion:last_of_deepslate'];
const AV_BH_FRAGMENTS = ['cataclysm:ender_golem', 'minecraft:elder_guardian',
  'mowziesmobs:ferrous_wroughtnaut', 'mowziesmobs:frostmaw', 'mowziesmobs:umvuthi', 'mowziesmobs:sculptor',
  'mutantmonsters:mutant_zombie', 'mutantmonsters:mutant_skeleton', 'illagerinvasion:invoker',
  'legendary_monsters:overgrown_colossus', 'legendary_monsters:frostbitten_golem', 'legendary_monsters:dune_sentinel',
  'aquamirae:captain_cornelia', 'block_factorys_bosses:yeti', 'block_factorys_bosses:sandworm', 'block_factorys_bosses:pirate_captain',
  'block_factorys_bosses:kraken', 'block_factorys_bosses:underworld_knight'];
const AV_BH_EntityType = Java.loadClass('net.minecraft.world.entity.EntityType');
const AV_BH_CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag');

EntityEvents.death(function (e) {
  var ent = e.entity;
  if (ent.isPlayer() || !e.server) return;
  var id = String(AV_BH_EntityType.getKey(ent.getType()));
  var heart = AV_BH_HEART.indexOf(id) >= 0;
  if (!heart && AV_BH_FRAGMENTS.indexOf(id) < 0) return;
  var s = e.server, dim = String(ent.level.dimension);
  var root = s.persistentData;
  if (!root.contains('av_hearts')) root.put('av_hearts', new AV_BH_CompoundTag());
  var store = root.getCompound('av_hearts');
  s.players.forEach(function (p) {
    if (String(p.level.dimension) !== dim || p.isSpectator() || p.distanceToSqr(ent) > 64 * 64) return;
    var u = String(p.uuid);
    if (!store.contains(u)) store.put(u, new AV_BH_CompoundTag());
    var me = store.getCompound(u);
    if (!me.contains('bosses')) me.put('bosses', new AV_BH_CompoundTag());
    var done = me.getCompound('bosses');
    if (done.contains(id)) return;
    done.putBoolean(id, true);
    var n = p.username;
    s.runCommandSilent('give ' + n + (heart ? ' legendarysurvivaloverhaul:heart_container 1' : ' legendarysurvivaloverhaul:heart_fragment 3'));
    s.runCommandSilent('tellraw ' + n + ' ' + JSON.stringify([{ text: 'Первая победа над ', color: 'light_purple' }, { text: (function () { try { return String(ent.getDisplayName().getString()); } catch (x) { return id; } })(), color: 'yellow' },
      { text: heart ? ': Кристальное сердце (ПКМ — +1 сердце).' : ': 3 осколка Кристального сердца (9 осколков — сердце).', color: 'light_purple' }]));
  });
});
