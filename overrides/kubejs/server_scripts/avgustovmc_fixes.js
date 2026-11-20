// AvgustovStory: fixes for recipes that ship broken in their own mods (checked at runtime on 2026-11-13).
// Of 495 recipes KubeJS warned about, only these are really missing in game and have a reachable item;
// the rest load fine through the vanilla path, need absent mods (Mekanism sails/chemicals) or were deleted by their authors.
ServerEvents.recipes(event => {
  // Create Deco: the white-dye ingredient used "id" instead of "item", so placards could not be dyed back to white
  event.shapeless('create:placard', ['#createdeco:placards', 'minecraft:white_dye']).id('avgustovmc:fix/placard_white')
  // Create Horse Power 1.1.0 ships its only recipe in the pre-1.21 "recipes/" folder, so 1.21.1 never loads it
  // (its block loot table has the same problem: fixed in kubejs/data/createhorsepower/loot_table/blocks/horse_crank.json)
  event.shaped('createhorsepower:horse_crank', [' F ', ' C ', 'SSS'], { F: 'minecraft:oak_fence', C: 'create:cogwheel', S: 'minecraft:stone' }).id('avgustovmc:fix/horse_crank')

  // Charta 1.2.5 ships no recipes at all (checked 2026-11-17). Decks come from the Dealer villager, whose job block is the
  // dealer table, so without these the whole card corner was unreachable.
  const CHARTA_WOODS = ['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak', 'mangrove', 'cherry', 'bamboo', 'crimson', 'warped']
  CHARTA_WOODS.forEach(w => {
    const P = 'minecraft:' + w + '_planks'
    event.shaped('charta:' + w + '_card_table', ['CCC', 'PPP', 'S S'], { C: 'minecraft:green_carpet', P: P, S: 'minecraft:stick' }).id('avgustovmc:fix/charta/' + w + '_card_table')
    event.shaped('2x charta:' + w + '_game_chair', ['P  ', 'PPP', 'S S'], { P: P, S: 'minecraft:stick' }).id('avgustovmc:fix/charta/' + w + '_game_chair')
    event.shaped('2x charta:' + w + '_bar_stool', [' C ', ' P ', 'S S'], { C: 'minecraft:red_carpet', P: P, S: 'minecraft:stick' }).id('avgustovmc:fix/charta/' + w + '_bar_stool')
    event.shaped('2x charta:' + w + '_bar_shelf', ['PPP', ' G ', 'PPP'], { P: P, G: 'minecraft:glass_bottle' }).id('avgustovmc:fix/charta/' + w + '_bar_shelf')
  })
  event.shapeless('charta:dealer_table', ['charta:oak_card_table', 'minecraft:emerald', 'minecraft:book']).id('avgustovmc:fix/charta/dealer_table')

  // Create: Villager Labor 1.5.3.1 has no recipes for its two upgrades (the permanent worker quest needs one)
  event.shaped('create_labor:gloves_upgrade', ['L L', 'LAL'], { L: 'minecraft:leather', A: 'create:andesite_alloy' }).id('avgustovmc:fix/labor/gloves_upgrade')
  event.shaped('create_labor:performance_upgrade', [' E ', 'BCB', ' E '], { E: 'minecraft:emerald', B: 'minecraft:bread', C: 'create:cogwheel' }).id('avgustovmc:fix/labor/performance_upgrade')

  // Legendary Survival Overhaul: the water purifier is a head curio that removes thirst and has no recipe. Made a
  // precision-era goal: copper filters, a precision mechanism and a canteen.
  event.shaped('legendarysurvivaloverhaul:water_purifier', ['SCS', 'BMB', 'SNS'], {
    S: 'create:copper_sheet', C: 'minecraft:charcoal', B: 'create:brass_sheet', M: 'create:precision_mechanism', N: 'legendarysurvivaloverhaul:canteen'
  }).id('avgustovmc:fix/lso/water_purifier')
})
