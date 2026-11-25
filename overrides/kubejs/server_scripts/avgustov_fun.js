// AvgustovStory 1.3.0 (25.11.2026, user: "включай фантазию и юмор", "чтобы удивить меня и моих друзей"):
//  1. Летописец комментирует смерти: после обычного сообщения о смерти всем приходит короткая реплика по причине смерти
//     (тип урона из реестра, напавший босс). Серым курсивом, чтобы не спорить с ванильной строкой.
//  2. «Курьёзы летописи» — вкладка скрытых достижений (data/avgustov/advancement/fun, tools/fun_advancements.js):
//     выдаются здесь за смерть в механизме Create, падение, утопление, жару, холод, взрыв, проигрыш боссу,
//     25 смертей, жажду от грязной воды, победу над Скульптором без испытания; «Билет в один конец» выдаёт
//     avgustov_sable_guard.js.
//  3. «Первые на сервере»: первая латунь, прецизионный механизм, сталь, незерит, ракетный двигатель, жетон стража —
//     титр всем игрокам и строка в чат, один раз на мир (server.persistentData).
var AVF_QUIPS = [
  // [test(damage type id, attacker type id), lines with %s = player]
  // 25.11.2026 (user: "напиши ещё больше вариантов, для разнообразия"): 8-12 lines per cause, new causes, attacker lines
  [/^create:(crush|mechanical_saw|mechanical_drill|mechanical_roller|run_over|fan_fire|fan_lava|cuckoo_surprise|potato_cannon)$/, [
    '%s изучил устройство механизма изнутри. Отзыв — отрицательный.',
    '%s проверил, хорошо ли смазаны шестерни. Шестерни проверили его.',
    'Механизм %s работал безупречно. В отличие от техники безопасности.',
    '%s стал частью производственной цепочки. Ненадолго.',
    'Ратибор просит больше не класть руки в дробилку. Особенно %s.',
    '%s хотел посмотреть, как это работает. Теперь он знает.',
    'Пила %s не различает доски и инженеров. Записано.',
    'Летописец добавил в инструкцию к станку пункт имени %s.',
    '%s проверил защитный кожух. Кожуха не было.',
    'Стресс-тест пройден. Механизм выдержал. %s — нет.',
    'Производительность цеха выросла на одного %s.',
    '%s был переработан. Выход продукции: ноль.']],
  [/^minecraft:(fall|fly_into_wall|stalagmite)$/, [
    'Гравитация: 1, %s: 0.',
    '%s забыл, что Create так и не изобрёл парашют.',
    '%s спустился быстрее, чем планировал.',
    '%s проверил высоту на глаз. Глаз ошибся.',
    'Летописец измерил прыжок %s. Рекорд, но посмертный.',
    '%s нашёл самый короткий путь вниз.',
    'У %s был план спуска. Без второго пункта.',
    '%s доказал, что земля твёрдая. Опытным путём.',
    'Ведро воды осталось у %s в инвентаре. Целое и невредимое.',
    '%s ненадолго научился летать.',
    'Ботинки длинного падения крафтятся, %s. Теперь — крафтятся.']],
  [/^minecraft:drown$/, [
    '%s пытался договориться с рекой. Река не пошла на компромисс.',
    '%s изучал течение с самой неудобной стороны.',
    '%s задержал дыхание. Слишком надолго.',
    'Рыбы приняли %s в свою артель. Посмертно.',
    '%s проверял глубину. Глубина оказалась больше.',
    'Течение рек мы ослабили вдвое. %s нашёл ту половину, что осталась.',
    '%s забыл, что жабр у него нет.',
    'Летописец рекомендует %s плавательный пузырь. Или лодку.',
    '%s ушёл на дно. Морские обитатели передают привет.']],
  [/^(minecraft:(lava|in_fire|on_fire|hot_floor|campfire|fireball|unattributed_fireball)|legendarysurvivaloverhaul:hyperthermia|create:fan_lava|tfmg:blast_furnace|createbigcannons:molten_metal)$/, [
    '%s сварился раньше супа.',
    '%s проверил, горячо ли. Горячо.',
    'Летописец отмечает: %s был очень горяч в своих начинаниях.',
    '%s прожарен до хрустящей корочки.',
    '%s слишком близко подошёл к работе с горячими металлами.',
    'Доменная печь приняла %s за руду. Обидно, но понятно.',
    '%s сгорел на работе. В прямом смысле.',
    'Пепел %s аккуратно собран в бутылку для истории.',
    '%s выяснил, что лава — не газировка.',
    'Пожарная часть сервера выехала к %s. Опоздала.']],
  [/^(minecraft:freeze|legendarysurvivaloverhaul:hypothermia)$/, [
    '%s решил, что тёплая подкладка — это для слабаков.',
    '%s превратился в отличный экспонат ледяного музея.',
    '%s замёрз. Летописец выдаёт ему посмертный шарф.',
    '%s проверил, бывает ли холодно в куртке на голое тело.',
    '%s хорошо сохранился. Как в погребе.',
    'Снеговик рядом с %s выглядит теплее.',
    '%s забыл про костёр. Костёр не забудет про %s.',
    'Йети прислал %s открытку: «Добро пожаловать в клуб».']],
  [/^legendarysurvivaloverhaul:dehydration$/, [
    '%s так и не дождался, пока вода закипит.',
    'Летописец советует %s: в следующий раз — котёл и костёр.',
    '%s выпил последнее, что было. Это был воздух.',
    'Флягу %s нашли пустой. И очень грустной.',
    '%s ушёл в пустыню без воды. Смело.',
    'Станция чистой воды — первая ферма в книге квестов, %s.',
    '%s пересох, как русло прошлогоднего ручья.',
    'Река была в двух шагах от %s. Грязная, но была.']],
  [/^minecraft:starve$/, [
    '%s ждал, пока доварится суп. Суп победил.',
    '%s сел на очень строгую диету.',
    '%s забыл пообедать. И поужинать. И позавтракать.',
    'Глава «Кухня» в книге квестов ждёт %s. Терпеливо.',
    '%s экономил еду до последнего. Получилось.',
    'В сундуке %s нашли 64 пшеницы. Хлеб так и не испекли.',
    '%s пытался питаться энтузиазмом.',
    'Курятник был бы кстати, %s.']],
  [/^(minecraft:(explosion|player_explosion|bad_respawn_point|fireworks)|createbigcannons:.*|cataclysm:emp)$/, [
    '%s стоял слишком близко к великой идее.',
    'Идея %s оказалась буквально взрывной.',
    '%s проверил порох на качество. Порох отличный.',
    '%s испытал пушку с неправильного конца.',
    'Отдача у %s получилась впечатляющей.',
    '%s разлетелся на много маленьких кусочков.',
    'Летописец собирает %s по частям. Пока нашёл три.',
    '%s ушёл громко.',
    'Соседи жалуются на шум от %s. Посмертно.',
    'Кровать в Незере — плохая идея, %s. Классика.']],
  [/^minecraft:(out_of_world|outside_border|generic_kill)$/, [
    '%s вышел за пределы карты. И за пределы здравого смысла.',
    '%s упал так глубоко, что вышел из летописи.',
    '%s проверил, есть ли что-нибудь под бедроком. Пусто.',
    'Пустота посмотрела на %s. %s посмотрел в пустоту. Пустота выиграла.']],
  [/^minecraft:(arrow|trident|thrown|mob_projectile|wind_charge)$/, [
    '%s поймал стрелу. Не руками.',
    '%s выяснил, что снайперы тоже живут в этом мире.',
    '%s стал отличной мишенью. Десять очков.',
    'Щит, %s. Щиты крафтятся.',
    '%s проверил прицел противника. Прицел в порядке.',
    'В %s попали с первого раза. Обидно.',
    '%s превратился в подушечку для иголок.',
    'Летописец вынимает стрелы из %s и складывает в колчан. Пригодятся.']],
  [/^minecraft:(falling_anvil|falling_block|falling_stalactite)$/, [
    '%s посмотрел вверх. Поздно.',
    'На %s упало что-то тяжёлое. Наковальня, судя по звуку.',
    '%s проверил потолок на прочность. Потолок проверил %s.',
    'Сталактиты, %s, это не сосульки.',
    '%s оказался под грузом ответственности.']],
  [/^minecraft:(magic|indirect_magic|dragon_breath|wither_skull)$/, [
    '%s столкнулся с магией. Магия оказалась сильнее инженерии.',
    'Колдун показал %s фокус с исчезновением.',
    '%s выпил что-то не то.',
    'Зелье, которое пил %s, было не лечебным.',
    '%s заколдован насмерть. Расколдовывать некому.',
    'Летописец советует %s молоко. На будущее.']],
  [/^minecraft:sonic_boom$/, [
    '%s слишком громко ходил рядом с Хранителем.',
    'Хранитель услышал %s. И ответил.',
    '%s получил звуковой удар. Децибелы не прощают.',
    'Тихо, %s. Тише надо было.']],
  [/^minecraft:(sweet_berry_bush|cactus)$/, [
    '%s обнял кактус. Кактус не оценил.',
    '%s полез в кусты за ягодами. Кусты были против.',
    '%s погиб от растения. Растение не извиняется.',
    'Ботаника оказалась опаснее, чем думал %s.',
    'Летописец пишет: «%s пал жертвой флоры».']],
  [/^minecraft:(in_wall|cramming)$/, [
    '%s застрял в стене. Стена победила.',
    '%s слишком тесно общался с толпой.',
    '%s пытался пройти сквозь блок. Блок не уступил.',
    'Летописец советует %s больше личного пространства.']],
  [/^tfmg:acid$/, ['%s проверил кислоту на вкус. Кислая.', 'Кислота растворила %s. И его планы на вечер.', '%s принял кислотную ванну. Не советуем.', '%s выяснил, почему у бочек TFMG такие предупреждающие этикетки.']],
  [/^createaddition:(tesla_coil|barbed_wire)$/, ['%s подключился к сети не той стороной.', '%s проверил напряжение языком.', 'Катушка Теслы передаёт %s горячий привет.', '%s замкнул цепь. Собой.', 'Электричество нашло кратчайший путь. Через %s.']],
  [/^minecraft:lightning_bolt$/, ['%s поймал молнию. Буквально.', 'Небеса указали на %s пальцем.', '%s стоял на холме в грозу. Классическая ошибка.', 'Громоотвод был бы кстати, %s.']],
  [/^minecraft:wither$/, ['%s засох, как забытый в печи хлеб.', '%s увял. Медленно и красиво.', 'Иссушение сделало из %s отличный гербарий.']],
  [/^minecraft:(sting|thorns)$/, ['%s ужален. Пчёлы не шутят.', '%s ударил того, кто колется. Шипы ответили.', 'Летописец пишет: %s проиграл в споре с колючками.']],
];
// attacker-specific lines (checked when the cause above did not match; %k = attacker name)
var AVF_ATTACKER = [
  [/^minecraft:(zombie|husk|zombie_villager|drowned)$|zombie|lackey|mummy|frostbitten|swampy/, [
    '%s поделился мозгами с %k. Без спроса.',
    '%k пришёл к %s на ужин. В качестве гостя — ненадолго, в качестве блюда — навсегда.',
    '%s недооценил медленную походку %k.',
    '%k обнял %s. Слишком крепко.',
    '%s не успел убежать от того, кто ходит вразвалочку.']],
  [/^minecraft:(skeleton|stray|bogged)$|skeleton/, [
    '%s получил стрелу от %k. Тот хотя бы метко стреляет.',
    '%k выиграл перестрелку у %s.',
    '%s проиграл тому, у кого нет даже мышц.',
    'Кости %k оказались крепче, чем броня %s.']],
  [/^minecraft:(spider|cave_spider)$|spider/, [
    '%s запутался в паутине отношений с %k.',
    '%k пригласил %s на обед. %s был обедом.',
    '%s не любит пауков. Теперь — взаимно.',
    'Восемь ног %k против двух у %s. Математика.']],
  [/^minecraft:creeper$|creeper/, [
    '%s услышал «пшшш» и решил подойти поближе.',
    '%k обнял %s на прощание.',
    '%s узнал, что %k пришёл не просто поздороваться.',
    'Зелёный, бесшумный, разрушительный. %s запомнил на всю оставшуюся жизнь. То есть ни на сколько.',
    '%s и %k разошлись. В разные стороны. На кусочки.']],
  [/^minecraft:enderman$|enderman|enderling/, [
    '%s посмотрел %k в глаза. Зря.',
    '%k очень не любит, когда на него пялятся, %s.',
    '%s проиграл в гляделки.',
    'Совет %s: смотреть надо под ноги, а не на %k.']],
  [/^minecraft:(pillager|vindicator|evoker|illusioner|ravager|witch)$|illager|invasion/, [
    'Иллагеры передают %s, что торговаться они не собирались.',
    '%k провёл с %s короткие переговоры.',
    '%s встретил рейд. Рейд встретил %s.',
    '%s забыл, что зелье плохого предзнаменования не пьют.']],
  [/^minecraft:(piglin|piglin_brute|zombified_piglin|hoglin|zoglin)$|piglin|hoglin/, [
    '%s забыл золотую броню дома.',
    '%k не принимает %s в качестве оплаты.',
    'Незер встретил %s по-незерски.',
    '%s обидел одного свинозомби. Пришли все.']],
  [/^minecraft:(phantom)$/, ['%s слишком долго не спал. Фантомы напомнили.', 'Кровать, %s. Иногда надо спать.', '%k прилетел к %s ночью. Сон отменяется навсегда.']],
  [/^minecraft:(slime|magma_cube)$|slime/, ['%s был проглочен желе.', '%k отскочил от %s. %s не отскочил.', '%s поскользнулся на %k.']],
  [/^minecraft:(wolf|polar_bear|goat|panda|bee|llama|iron_golem)$|bear|boar|wolf/, [
    '%s обидел %k. %k обиделся в ответ.',
    '%k защищал своё. %s — не смог.',
    'Летописец пишет: «Не трогай %k». Для %s — поздно.',
    'Мирные животные не всегда мирные, %s.']],
  [/^minecraft:(guardian|pufferfish|elder_guardian)$|shark|piranha|eel|angler/, [
    '%s заплыл не туда. Там был %k.',
    '%k решил, что %s — рыба покрупнее.',
    'В море у %s нашлись враги. Например, %k.']],
];
var AVF_PVP = [
  '%s проиграл дружеский спор с %k.',
  '%k одержал убедительную победу над %s. Летописец фиксирует счёт.',
  '%s и %k выясняли отношения. Выяснили.',
  '%k помог %s быстрее вернуться на точку возрождения.',
  'Дружба %s и %k временно поставлена на паузу.',
  'Ратибор просит %k и %s мириться за общим столом.'];
var AVF_GENERIC = [
  '%s ушёл на перекур. Надолго.',
  'Летописец делает пометку на полях: «%s — вернётся».',
  '%s временно недоступен. Оставьте сообщение после гудка паровой машины.',
  '%s отправился на точку возрождения длинным путём.',
  'Летописец ставит на полях крестик. Карандашом: %s ещё вернётся.',
  '%s решил начать с чистого листа. Буквально.',
  'Вещи %s ждут на месте гибели. Говорят, скучают.',
  '%s проверил, работает ли кровать. Сейчас узнает.',
  'Ратибор вздыхает и достаёт новый лист для %s.',
  '%s сделал паузу. Не по своей воле.',
  'Летопись %s продолжится через несколько секунд.',
  'Минута молчания по %s. Можно и короче.',
  '%s ушёл, но обещал вернуться с бронёй получше.',
  'Даже великие инженеры иногда умирают. Сегодня — %s.',
  'Летописец рисует на полях маленький надгробный камень с подписью «%s».'];
var AVF_BOSS_NS = { cataclysm: 1, mowziesmobs: 1, legendary_monsters: 1, bosses_of_mass_destruction: 1, block_factorys_bosses: 1, aquamirae: 1, archaion: 1, unusualend: 1 };
var AVF_BOSS_VANILLA = { 'minecraft:wither': 1, 'minecraft:ender_dragon': 1, 'minecraft:warden': 1, 'minecraft:elder_guardian': 1, 'minecraft:ravager': 1 };
var AVF_BOSS_LINES = [
  '%s проиграл спор с %b. Реванш назначен.',
  '%b вписал %s в свою летопись. Мелким шрифтом.',
  '%s узнал, почему %b — страж, а не сторож.',
  '%b пока ведёт в счёте. %s готовит ответный визит.',
  '%s пришёл к %b без приглашения. %b не оценил.',
  'Летописец записывает: %b — 1, %s — 0. Пока.',
  '%s изучил тактику %b. На себе.',
  '%b даже не вспотел. %s — тоже: не успел.',
  'Броня %s была хорошей. Для обычных мобов. %b — не обычный.',
  '%s проверил, сколько здоровья у %b. Больше, чем у %s.',
  '%b передаёт %s: приходи с друзьями.',
  'Первая попытка %s против %b — разведка боем. Так и запишем.'];
var AVF_FIRSTS = {
  'create:brass_ingot': ['Первая латунь!', 'сплавил первую латунь на сервере', 'Летописец достаёт новую чернильницу: эпоха латуни началась.'],
  'create:precision_mechanism': ['Первый механизм!', 'собрал первый прецизионный механизм', 'Часовщики всего мира нервно протирают монокли.'],
  'tfmg:steel_ingot': ['Первая сталь!', 'выплавил первую сталь на сервере', 'Где-то вдалеке Игнис впервые почувствовал тревогу.'],
  'minecraft:netherite_ingot': ['Первый незерит!', 'получил первый незеритовый слиток', 'Пиглины собрали экстренное совещание.'],
  'creatingspace:rocket_engine': ['Первый ракетный двигатель!', 'собрал первый ракетный двигатель', 'Луна делает вид, что не заметила.'],
  'kubejs:guardian_token': ['Первый жетон стража!', 'добыл первый жетон стража', 'Стражи иных земель начинают запирать двери.'],
};
var AVF_EntityType = Java.loadClass('net.minecraft.world.entity.EntityType');
var AVF_CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag');

function avfPick(a) { return a[Math.floor(Math.random() * a.length)]; }
function avfGrant(s, n, id) { s.runCommandSilent('advancement grant ' + n + ' only avgustov:fun/' + id); }
function avfHasAdv(p, id) {
  try {
    var a = p.server.getAdvancements().get(Java.loadClass('net.minecraft.resources.ResourceLocation').parse(id));
    return a != null && p.getAdvancements().getOrStartProgress(a).isDone();
  } catch (err) { return false; }
}

PlayerEvents.loggedIn(function (e) { avfGrant(e.player.server, e.player.username, 'root'); });

EntityEvents.death(function (e) {
  var ent = e.entity, s = e.server;
  if (!ent.isPlayer()) {
    // Скульптор побеждён оружием: «Нечестная игра» тем, кто рядом и не проходил его испытание
    if (String(AVF_EntityType.getKey(ent.getType())) === 'mowziesmobs:sculptor') {
      s.players.forEach(function (p) {
        if (String(p.level.dimension) === String(ent.level.dimension) && p.distanceToSqr(ent) < 64 * 64 && !avfHasAdv(p, 'mowziesmobs:sculptor_challenge')) avfGrant(s, p.username, 'not_fair');
      });
    }
    return;
  }
  try {
    var n = ent.username, type = '', atk = null, atkId = '';
    try { type = String(e.source.typeHolder().unwrapKey().get().location()); } catch (err) {}
    try { atk = e.source.getEntity(); if (atk != null) atkId = String(AVF_EntityType.getKey(atk.getType())); } catch (err) {}
    var line = null, boss = atk != null && !atk.isPlayer() && (AVF_BOSS_NS[atkId.split(':')[0]] || AVF_BOSS_VANILLA[atkId]);
    var atkName = atk != null ? String(atk.getName().getString()) : '';
    if (boss) {
      line = avfPick(AVF_BOSS_LINES).replace(/%b/g, atkName);
      avfGrant(s, n, 'boss_argument');
    } else if (atk != null && atk.isPlayer() && atkName !== n) {
      line = avfPick(AVF_PVP);
    } else {
      // the attacker's own lines first for melee/explosion deaths by a mob, then the cause, then generic
      var byMob = atk != null && /^minecraft:(mob_attack|mob_attack_no_aggro|explosion|arrow|mob_projectile|sting)$/.test(type);
      if (byMob && Math.random() < 0.7) for (var j = 0; j < AVF_ATTACKER.length && !line; j++) if (AVF_ATTACKER[j][0].test(atkId)) line = avfPick(AVF_ATTACKER[j][1]);
      for (var i = 0; i < AVF_QUIPS.length && !line; i++) if (AVF_QUIPS[i][0].test(type)) line = avfPick(AVF_QUIPS[i][1]);
      for (var k = 0; k < AVF_ATTACKER.length && !line && atk != null; k++) if (AVF_ATTACKER[k][0].test(atkId)) line = avfPick(AVF_ATTACKER[k][1]);
      if (!line) line = avfPick(AVF_GENERIC);
    }
    line = line.replace(/%k/g, atkName);
    if (/^create:/.test(type)) avfGrant(s, n, 'engineer_thought');
    else if (/^minecraft:(fall|fly_into_wall|stalagmite)$/.test(type)) avfGrant(s, n, 'gravity');
    else if (type === 'minecraft:drown') avfGrant(s, n, 'river_wins');
    else if (/^(minecraft:(lava|in_fire|on_fire|hot_floor|campfire)|legendarysurvivaloverhaul:hyperthermia)$/.test(type)) avfGrant(s, n, 'overcooked');
    else if (/^(minecraft:freeze|legendarysurvivaloverhaul:hypothermia)$/.test(type)) avfGrant(s, n, 'undercoat');
    else if (/^(minecraft:(explosion|player_explosion|fireworks)|createbigcannons:)/.test(type)) avfGrant(s, n, 'big_idea');
    var pd = ent.persistentData, d = (pd.contains('avf_deaths') ? pd.getInt('avf_deaths') : 0) + 1;
    pd.putInt('avf_deaths', d);
    if (d >= 25) avfGrant(s, n, 'veteran');
    var msg = JSON.stringify([{ text: '✎ ', color: 'dark_gray' }, { text: line.replace(/%s/g, n), color: 'gray', italic: true }]);
    // after the vanilla death message, which is sent once this event returns
    s.scheduleInTicks(2, function () { s.runCommandSilent('tellraw @a ' + msg); });
  } catch (err) { console.warn('[fun] death quip failed: ' + err); }
});

// «Из лужи»: эффект жажды LSO (грязная вода, сырая еда)
PlayerEvents.tick(function (e) {
  var p = e.player;
  if (p.tickCount % 40 !== 7 || p.persistentData.getBoolean('avf_puddle')) return;
  var thirsty = false;
  p.getActiveEffects().forEach(function (ef) {
    try { if (String(ef.getEffect().unwrapKey().get().location()) === 'legendarysurvivaloverhaul:thirst') thirsty = true; } catch (err) {}
  });
  if (thirsty) { p.persistentData.putBoolean('avf_puddle', true); avfGrant(p.server, p.username, 'puddle'); }
});

// «Первые на сервере»
PlayerEvents.inventoryChanged(function (e) {
  var id = String(e.item.id), f = AVF_FIRSTS[id];
  if (!f) return;
  var s = e.player.server, root = s.persistentData;
  if (!root.contains('av_firsts')) root.put('av_firsts', new AVF_CompoundTag());
  var got = root.getCompound('av_firsts');
  if (got.contains(id)) return;
  var n = e.player.username;
  got.putString(id, n);
  s.runCommandSilent('title @a times 10 70 20');
  s.runCommandSilent('title @a title ' + JSON.stringify({ text: '⚙ ' + f[0], color: 'gold', bold: true }));
  s.runCommandSilent('title @a subtitle ' + JSON.stringify({ text: n + ' ' + f[1], color: 'yellow' }));
  s.runCommandSilent('tellraw @a ' + JSON.stringify([{ text: '⚙ ' + f[0] + ' ', color: 'gold', bold: true },
    { text: n + ' ' + f[1] + '. ', color: 'yellow' }, { text: f[2], color: 'gray', italic: true }]));
  console.info('[fun] first ' + id + ' by ' + n);
});
