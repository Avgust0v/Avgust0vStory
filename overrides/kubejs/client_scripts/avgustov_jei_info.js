// AvgustovStory 1.1-dev.11j: JEI "information" pages for items whose recipes this pack changed (server_scripts:
// avgustovmc_progression.js, avgustov_tier_recipes.js, avgustov_extra_recipes.js, avgustov_create_recipes.js), so a player
// who looks up a familiar item learns why the vanilla recipe is gone. Open: an item in JEI -> U -> the "i" tab.
RecipeViewerEvents.addInformation('item', function (e) {
  var info = function (ids, lines) { ids.forEach(function (id) { try { e.add(id, lines); } catch (x) { console.warn('jei info ' + id + ': ' + x); } }); };
  var pieces = function (prefix) { return ['helmet', 'chestplate', 'leggings', 'boots'].map(function (p) { return prefix + p; }); };

  info(['minecraft:netherite_ingot'], [
    'В этой сборке незерит идёт после стали.',
    'Верстачный рецепт (4 обломка + 4 золота) и сплав Create Metalwork отключены.',
    'Слиток: смешивание Create над горелкой с сильным нагревом (синее пламя) — 4 незеритовых обломка + 2 золотых слитка + 2 стальных слитка.',
    'Незерит из сундуков бастиона остаётся наградой за риск.'
  ]);
  info(['minecraft:netherite_scrap'], [
    'Добывается из древних обломков. Дробление адских кирпичей в обломки отключено.',
    'Слиток делается в смесителе Create над горелкой с сильным нагревом вместе с золотом и сталью.'
  ]);
  info(['tfmg:steel_ingot', 'createbigcannons:steel_ingot', 'cgs:steel_ingot', 'magistuarmory:steel_ingot'], [
    'Сталь с нуля делает только доменная печь TFMG.',
    'Сталь из смесителя (Create Big Cannons, Gunsmithing) и из железа в плавильной печи (Epic Knights) отключена.',
    'Слитки сталей TFMG, Big Cannons и Gunsmithing меняются 1:1 на верстаке, чтобы каждый мод мог использовать свою сталь.'
  ]);
  info(pieces('minecraft:diamond_'), [
    'Каждая деталь алмазной брони требует механизм точности Create (конец эпохи латуни).'
  ]);
  info(pieces('aquaculture:neptunium_'), [
    'Нептуниевая броня — уровень алмаза, поэтому каждая деталь тоже требует механизм точности Create.'
  ]);
  info(pieces('minecraft:netherite_'), [
    'Улучшение на кузнечном столе: шаблон + деталь + незеритовый слиток (слиток — после стали).',
    'Готические и кастенбрустовые доспехи Epic Knights тоже улучшаются до незерита, чары сохраняются.'
  ]);
  info(pieces('immersive_armors:heavy_'), [
    'Тяжёлая броня крепче незеритовой, поэтому делается из стали TFMG (слитки и блоки), а не из железа.'
  ]);
  info(pieces('immersive_armors:steampunk_'), [
    'Стимпанк-броня делается из латуни вместо золота.'
  ]);
  info(['create_jetpack:netherite_jetpack'], [
    'Незеритовый джетпак собирается на механическом крафтере: незеритовый баллон, элитры, слитки игнития (Игнис) и латунные листы.'
  ]);
  info(['createoreexcavation:netherite_drill'], [
    'Улучшение бура на кузнечном столе требует витеритовый слиток (Предвестник) вместо незерита.'
  ]);
  info(['create:chromatic_compound', 'create:refined_radiance', 'create:shadow_steel'], [
    'Классическая цепочка Create: хроматический компаунд — смешивание с сильным нагревом;',
    'сияющий сплав — компаунд + 2 стержня Края там же; теневая сталь — компаунд, обработанный веером через огонь душ.'
  ]);
  info(['kubejs:guardian_token'], [
    'Каждый игрок рядом со стражем логова получает жетон, когда страж погибает.',
    'Жетоны тратятся в главе «Лавка артели»: тотемы, «Починка», шаблон незерита, элитры. Казна выкупает жетон за 4 шестерни.'
  ]);
  info(['numismatics:spur', 'numismatics:bevel', 'numismatics:sprocket', 'numismatics:cog', 'numismatics:crown'], [
    'Монеты дают повторяемые заказы главы «Биржа контрактов», награды квестов и элитные мобы дальних зон.',
    'Тратятся в «Лавке артели» и в торговле между гильдиями (торговый автомат Numismatics).'
  ]);
  info(['legendarysurvivaloverhaul:heart_container'], [
    'ПКМ: +1 сердце навсегда, максимум 20.',
    'Сердца также дают новые блюда: чем сложнее блюдо, тем больше очков гурмана (/hearts — прогресс, /gourmet — журнал гурмана). Сердце, потерянное при смерти, возвращается новыми или уже знакомыми блюдами.'
  ]);
});
