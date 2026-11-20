// AvgustovStory 1.1: hall of fame scoreboards (IMPROVEMENT_PLAN E), shown on Create display boards via
// Display Link -> source "Scoreboard". Filled by the pack's own systems:
//   av_dishes  - different dishes tasted (avgustov_kitchen_hearts.js)
//   av_hearts  - current hearts: 8 at start, up to 20 (avgustov_kitchen_hearts.js)
//   av_bosses  - structure guardians defeated nearby (avgustov_boss_intros.js)
//   av_hours   - hours played (from the vanilla play_time stat, updated every minute)
//   av_deaths  - deaths
ServerEvents.loaded(function (e) {
  var s = e.server;
  var add = function (id, crit, name) { s.runCommandSilent('scoreboard objectives add ' + id + ' ' + crit + ' ' + JSON.stringify({ text: name })); };
  add('av_dishes', 'dummy', 'Гурманы: разных блюд');
  add('av_hearts', 'dummy', 'Сердца');
  add('av_bosses', 'dummy', 'Охотники на стражей');
  add('av_hours', 'dummy', 'Часов в игре');
  add('av_deaths', 'deathCount', 'Смерти');
  add('av_playtime', 'minecraft.custom:minecraft.play_time', 'play time (ticks)');
  add('av_const', 'dummy', 'const');
  s.runCommandSilent('scoreboard players set #hour av_const 72000');
});

ServerEvents.tick(function (e) {
  var s = e.server;
  if (s.tickCount % 1200 !== 0) return;
  s.runCommandSilent('execute as @a run scoreboard players operation @s av_hours = @s av_playtime');
  s.runCommandSilent('execute as @a run scoreboard players operation @s av_hours /= #hour av_const');
});
