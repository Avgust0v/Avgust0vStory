// AvgustovStory 1.1: boss introductions (IMPROVEMENT_PLAN B6).
// The first time a player comes within 40 blocks of a boss, they see its name as a title card, hear a horn,
// and read a line from Ratibor's chronicle (or a short warning) in chat. Once per player per boss type.
const AV_BOSSES = {
  'cataclysm:ignis': ['ИГНИС', 'Рыцарь пламени из кузни Игната', 'Игнат вырастил его стеречь кузню. Он не отличит вора от наследника.'],
  'cataclysm:the_harbinger': ['ПРЕДВЕСТНИК', 'Железный страж ракетной фабрики', 'Мы собрали его из лучших механизмов. В его ядро я вложил карту неба.'],
  'cataclysm:the_leviathan': ['ЛЕВИАФАН', 'Хозяин города под волнами', 'Море пришло обратно за одну ночь. Теперь я знаю, кто его привёл.'],
  'cataclysm:netherite_monstrosity': ['НЕЗЕРИТОВОЕ ЧУДОВИЩЕ', 'Голем из жил Незера', 'Мы брали из Незера столько, что он ответил.'],
  'cataclysm:ender_guardian': ['ЭНДЕР-СТРАЖ', 'Хранитель руин Края', 'Здесь жили до нас. Их страж пережил их самих.'],
  'cataclysm:ancient_remnant': ['ДРЕВНИЙ ОСТАТОК', 'Страж проклятой пирамиды', 'Пирамида старше нашей артели. Её обсерватория смотрела на те же звёзды.'],
  'cataclysm:maledictus': ['МАЛЕДИКТУС', 'Проклятый воин ледяной темницы', null],
  'cataclysm:scylla': ['СЦИЛЛА', 'Владычица бурь', null],
  'mowziesmobs:ferrous_wroughtnaut': ['КОВАНЫЙ РЫЦАРЬ', 'Страж подземного зала', null],
  'mowziesmobs:frostmaw': ['ЛЕДОПАСТЬ', 'Зверь снежных вершин', null],
  'mowziesmobs:umvuthi': ['УМВУТИ', 'Вождь солнечного племени', null],
  'mowziesmobs:sculptor': ['СКУЛЬПТОР', 'Хозяин каменной горы', null],
  'bosses_of_mass_destruction:lich': ['НОЧНОЙ ЛИЧ', 'Хозяин башни в снегах', null],
  'bosses_of_mass_destruction:obsidilith': ['ОБСИДИЛИТ', 'Живой монолит Края', null],
  'bosses_of_mass_destruction:gauntlet': ['ПЕРЧАТКА', 'Каменная длань Незера', null],
  'bosses_of_mass_destruction:void_blossom': ['ПУСТОТНЫЙ ЦВЕТОК', 'Он пьёт свет и жизнь', null],
  'legendary_monsters:overgrown_colossus': ['ЗАРОСШИЙ КОЛОСС', 'Спящий в мшистом храме', null],
  'legendary_monsters:frostbitten_golem': ['ОБМОРОЖЕННЫЙ ГОЛЕМ', 'Страж ледяного храма', null],
  'legendary_monsters:dune_sentinel': ['СТРАЖ ДЮН', 'Пост разрушенной пирамиды', null],
  'legendary_monsters:skeletosaurus': ['СКЕЛЕТОЗАВР', 'Кости, которые помнят', null],
  'legendary_monsters:lava_eater': ['ПОЖИРАТЕЛЬ ЛАВЫ', 'Глубины Незера', null],
  'legendary_monsters:withered_abomination': ['ИССОХШАЯ МЕРЗОСТЬ', 'Крепость душ', null],
  'aquamirae:captain_cornelia': ['КАПИТАН КОРНЕЛИЯ', 'Призрак вмёрзшего корабля', 'Подмастерья бежали на этом корабле из ледяной темницы. Лёд оказался быстрее.'],
  'archaion:last_of_deepslate': ['ПОСЛЕДНИЙ ИЗ ГЛУБИН', 'Страж Древней крепости', 'Мы рыли глубже всех, пока жилы не иссякли. Последнее, что мы нашли внизу, нашло нас само.'],
  'rottencreatures:dead_beard': ['КАПИТАН МЕРТВЕЦ', 'Гроза побережья', null],
  'block_factorys_bosses:kraken': ['КРАКЕН', 'Из глубин', null],
  'block_factorys_bosses:infernal_dragon': ['АДСКИЙ ДРАКОН', 'Пламя без хозяина', null],
  'block_factorys_bosses:sandworm': ['ПЕСЧАНЫЙ ЧЕРВЬ', 'Под дюнами', null],
  'block_factorys_bosses:yeti': ['ЙЕТИ', 'Хозяин ледника', null],
  'block_factorys_bosses:underworld_knight': ['РЫЦАРЬ ПРЕИСПОДНЕЙ', 'Клятва, данная огню', null],
  'minecraft:wither': ['ИССУШИТЕЛЬ', 'Вы сами его призвали', null],
  'minecraft:warden': ['ХРАНИТЕЛЬ', 'Тише. Он слышит', null],
  'minecraft:ender_dragon': ['ЭНДЕР-ДРАКОН', 'Последний страж Края', null],
};
const AV_EntityType = Java.loadClass('net.minecraft.world.entity.EntityType');

// Guardian tokens (IMPROVEMENT_PLAN C): when a structure boss dies, every player within 64 blocks gets one token.
// Not for bosses that can be farmed or summoned at will.
const AV_NO_TOKEN = { 'minecraft:wither': 1, 'minecraft:warden': 1, 'minecraft:ender_dragon': 1 };
EntityEvents.death(function (e) {
  var ent = e.entity;
  var id = String(AV_EntityType.getKey(ent.getType()));
  if (!AV_BOSSES[id] || AV_NO_TOKEN[id]) return;
  var s = e.server;
  var dim = String(ent.level.dimension);
  s.players.forEach(function (p) {
    if (String(p.level.dimension) !== dim || p.isSpectator() || p.distanceToSqr(ent) > 64 * 64) return;
    var n = p.username;
    s.runCommandSilent('scoreboard players add ' + n + ' av_bosses 1');
    // 1.1-dev.11j (quest audit): Cataclysm guardians can be summoned again (Boss Respawner, altars), so the token comes
    // only for the FIRST kill of each boss type per player; repeat kills still count on the av_bosses board.
    var pd = p.persistentData;
    if (!pd.contains('av_tokens')) pd.put('av_tokens', new AV_CompoundTag());
    var got = pd.getCompound('av_tokens');
    if (got.contains(id)) {
      s.runCommandSilent('tellraw ' + n + ' ' + JSON.stringify([{ text: AV_BOSSES[id][0], color: 'dark_red', bold: true }, { text: ' повержен снова. ', color: 'gold' }, { text: 'Жетон за этого стража уже получен.', color: 'gray' }]));
      return;
    }
    got.putBoolean(id, true);
    s.runCommandSilent('give ' + n + ' kubejs:guardian_token 1');
    s.runCommandSilent('tellraw ' + n + ' ' + JSON.stringify([{ text: AV_BOSSES[id][0], color: 'dark_red', bold: true }, { text: ' повержен. ', color: 'gold' }, { text: '+1 жетон стража — его принимают в «Лавке артели» (книга квестов).', color: 'gray' }]));
  });
});
const AV_CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag');

const AV_GEAR_HINT = { T0: 'кожа, дерево', T1: 'железо, кольчуга', T2: 'латунь', T3: 'алмаз и подобная',
  T4: 'стальные латы', T5: 'незерит', T6: 'трофейная' };
ServerEvents.tick(function (e) {
  var s = e.server;
  if (s.tickCount % 40 !== 0) return;
  s.players.forEach(function (p) {
    if (p.isSpectator()) return;
    var near = p.level.getEntities(p, p.boundingBox.inflate(40));
    if (near.isEmpty()) return;
    var pd = p.persistentData;
    if (!pd.contains('av_boss_seen')) pd.put('av_boss_seen', new AV_CompoundTag());
    var seen = pd.getCompound('av_boss_seen');
    near.forEach(function (ent) {
      if (!ent.isAlive()) return;
      var id = String(AV_EntityType.getKey(ent.getType()));
      var b = AV_BOSSES[id];
      // 1.1-dev.11j: boss ladder from avgustov_bosses.js (AVBS, shared server-script scope)
      var tb = (typeof AVBS !== 'undefined') ? AVBS[id] : null;
      if ((!b && !tb) || seen.contains(id)) return;
      seen.putBoolean(id, true);
      var n = p.username;
      if (b) {
        s.runCommandSilent('title ' + n + ' times 10 70 25');
        s.runCommandSilent('title ' + n + ' subtitle ' + JSON.stringify({ text: b[1], color: 'gray', italic: true }));
        s.runCommandSilent('title ' + n + ' title ' + JSON.stringify({ text: b[0], color: 'dark_red', bold: true }));
        s.runCommandSilent('execute as ' + n + ' at @s run playsound minecraft:event.raid.horn hostile @s ~ ~ ~ 0.6 0.8');
        if (b[2]) s.runCommandSilent('tellraw ' + n + ' ' + JSON.stringify([{ text: 'Летопись Ратибора: ', color: 'dark_aqua' }, { text: '«' + b[2] + '»', color: 'aqua', italic: true }]));
        else s.runCommandSilent('tellraw ' + n + ' ' + JSON.stringify({ text: 'Впереди — ' + b[0] + '. Не ходите в одиночку.', color: 'red' }));
      }
      if (tb) {
        var line = [{ text: 'Ступень ' + tb.tier, color: 'gold', bold: true },
          { text: ' · броня ' + tb.gear + '+ (' + (AV_GEAR_HINT[tb.gear] || '') + ') · здоровье ' + tb.hp + (tb.party ? ' (+35% за каждого игрока рядом)' : ''), color: 'yellow' }];
        if (tb.dps) line.push({ text: ' · огнестрел и стрелы до ' + tb.dps + ' урона в секунду', color: 'gray' });
        s.runCommandSilent('tellraw ' + n + ' ' + JSON.stringify(line));
        // lair climate (Legendary Survival Overhaul temperature)
        if (tb.clim === 'hot') s.runCommandSilent('tellraw ' + n + ' ' + JSON.stringify([{ text: 'Жара: ', color: 'red', bold: true }, { text: 'пришейте к броне охлаждающую подкладку («теплоотводящая ремизная нить», стол для шитья), возьмите воду.', color: 'gold' }]));
        if (tb.clim === 'cold') s.runCommandSilent('tellraw ' + n + ' ' + JSON.stringify([{ text: 'Холод: ', color: 'aqua', bold: true }, { text: 'пришейте к броне тёплую подкладку («согревающая ремизная нить», стол для шитья), возьмите горячую еду.', color: 'gold' }]));
      }
    });
  });
});
