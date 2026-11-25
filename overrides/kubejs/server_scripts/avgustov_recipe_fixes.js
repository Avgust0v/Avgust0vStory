// AvgustovStory 1.3.0 (23.11.2026): mod recipes that fail to load on 1.21.1 ("Parsing error loading recipe" in the
// server log, user: "Да, почини"). They are written in the 1.20 format; here they are re-added with the same ids in the
// format the current mods read (checked against Farmer's Delight 1.3.4's own recipes):
//  - Farmer's Delight cooking: container is an item stack {"id": ...}, not {"item": ...};
//  - Farmer's Delight cutting: each result is {"item": {"id", "count"}, "chance"}, knives are the tag c:tools/knife,
//    axe stripping is {"type": "farmersdelight:item_ability", "action": "axe_strip"} plus the tag minecraft:axes,
//    the sound is {"sound_id": ...};
//  - Create Deco: the white placard (re-dye) recipe named its dye with "id" instead of "item".
// Not fixed: create_mf:tt_1 (diamond from graphite) uses compacting inside sequenced assembly, which Create 6 does not
// allow at all; mods referring to items of mods the pack does not have (spears, dragon loot, sails, Mekanism gauge).

ServerEvents.recipes(function (event) {
  var bowl = { id: 'minecraft:bowl', count: 1 };
  var bottle = { id: 'minecraft:glass_bottle', count: 1 };
  function cook(id, tab, ingredients, result, container) {
    event.custom({
      type: 'farmersdelight:cooking', recipe_book_tab: tab, ingredients: ingredients,
      result: { id: result, count: 1 }, container: container, experience: 1.0, cookingtime: 200
    }).id(id);
  }
  function item(i) { return { item: i }; }
  cook('unusualend:blob_stew_farmer_delight', 'meals', [item('unusualend:end_blob'), item('unusualend:end_blob')], 'unusualend:blob_stew', bowl);
  cook('unusualend:ender_stew_farming_delight', 'meals', [item('unusualend:end_blob'), item('unusualend:chorus_roots'), item('unusualend:chorus_fungus'), item('minecraft:chorus_fruit')], 'unusualend:ender_stew', bowl);
  cook('unusualend:warped_stew_farming_delight', 'meals', [{ tag: 'unusualend:cooked_warped_meat' }, item('unusualend:warped_berries'), { tag: 'unusualend:warped_item' }], 'unusualend:warped_stew', bowl);
  cook('unusualend:chorus_juice_farming_delight', 'drinks', [item('minecraft:chorus_fruit'), item('minecraft:chorus_fruit'), item('minecraft:chorus_fruit')], 'unusualend:chorus_juice', bottle);
  cook('unusualend:chorus_tea_farming_delight', 'drinks', [item('minecraft:chorus_fruit'), item('minecraft:chorus_fruit'), item('minecraft:chorus_fruit'), item('unusualend:chorus_petal')], 'unusualend:chorus_tea', bottle);

  var knife = [{ type: 'farmersdelight:item_ability', action: 'knife_dig' }, { tag: 'c:tools/knife' }];
  var axe = [{ type: 'farmersdelight:item_ability', action: 'axe_strip' }, { tag: 'minecraft:axes' }];
  function out(id, count, chance) { var r = { item: { id: id, count: count || 1 } }; if (chance) r.chance = chance; return r; }
  function cut(id, input, results, tool, strip) {
    var j = { type: 'farmersdelight:cutting', ingredients: [item(input)], result: results, tool: tool };
    if (strip) j.sound = { sound_id: 'minecraft:item.axe.strip' };
    event.custom(j).id(id);
  }
  cut('unusualend:small_squash_farmer_delight', 'unusualend:small_warped_squash', [out('unusualend:warped_squash_wedge', 2)], knife);
  cut('unusualend:warped_squash_farmer_delight', 'unusualend:warped_squash', [out('unusualend:warped_squash_wedge', 4)], knife);
  cut('unusualend:carved_squash_farmer_delight', 'unusualend:carved_warped_squash', [out('unusualend:warped_squash_wedge', 4)], knife);
  cut('unusualend:chorus_petals_via_cutting', 'minecraft:chorus_flower', [out('unusualend:chorus_petal', 2)], knife);
  cut('unusualend:chorus_planks_via_cutting', 'unusualend:chorus_nest_planks', [out('unusualend:stripped_chorus_nest_planks'), out('farmersdelight:straw', 1, 0.2)], axe, true);
  cut('unusualend:chorus_slab_via_cutting', 'unusualend:chorus_nest_slab', [out('unusualend:stripped_chorus_nest_slab'), out('farmersdelight:straw', 1, 0.2)], axe, true);
  cut('unusualend:chorus_stairs_via_cutting', 'unusualend:chorus_nest_stairs', [out('unusualend:stripped_chorus_nest_stairs'), out('farmersdelight:straw', 1, 0.2)], axe, true);
  cut('unusualend:stripped_chorus_cane_block_compa', 'unusualend:chorus_cane_block', [out('unusualend:stripped_chorus_cane_block'), out('farmersdelight:straw')], axe, true);

  event.custom({
    type: 'minecraft:crafting_shapeless', category: 'misc', group: 'dye_placard',
    ingredients: [{ tag: 'createdeco:placards' }, { item: 'minecraft:white_dye' }],
    result: { id: 'create:placard', count: 1 }
  }).id('createdeco:placard');

  // 25.11.2026 (user: "Возьми всё"): Create MF diamond from graphite (create_mf:tt_1) was a sequenced assembly with a
  // compacting step, which Create 6 refuses. Same inputs as its 3 loops (graphite, 6 flint, 3 coal, lava, superheated),
  // now one superheated compacting with the same id, so JEI and the mod's book point at it.
  event.recipes.create.compacting('minecraft:diamond',
    ['create_mf:graphite', '6x minecraft:flint', '3x minecraft:coal', Fluid.of('minecraft:lava', 1000)]).superheated().id('create_mf:tt_1');

  // 25.11.2026: Grappling Hook's long fall boots need a smithing template that nothing in the pack gives (no recipe, loot,
  // trade or quest reward). The template is crafted now: 4 phantom membranes, 4 diamonds and a slime block (bouncy);
  // the boots stay diamond boots + template + phantom membrane on the smithing table (T3 stats from tools/balance).
  event.shaped('grapplemod:long_fall_boots_smithing_template', ['DMD', 'MSM', 'DMD'],
    { D: 'minecraft:diamond', M: 'minecraft:phantom_membrane', S: 'minecraft:slime_block' }).id('avgustov:long_fall_boots_template');

  // 25.11.2026 (night research, balance): Create Ultimate Factory crushes coral into a heart of the sea (1%) and blackstone
  // into a wither skeleton skull (1%). A heart is a Leviathan altar offering and a «Лавка артели» purchase, skulls summon
  // the Wither (B3 boss quest): an automated crusher made both free. Removed; corals and blackstone keep their other uses.
  event.remove({ id: 'create_ultimate_factory:crushing_coral' });
  event.remove({ id: 'create_ultimate_factory:crushing_blackstone' });
});
