// AvgustovStory 1.1: expensive and powerful items are made on Create machines instead of the crafting table,
// so learning Create is the road to the good stuff. Eras follow avgustovmc_progression.js:
// 1 andesite (press, unheated mixer, spout) -> 2 brass (deployer, mechanical crafter, sequenced assembly, blaze burner)
// -> 3 factory -> 4 precision mechanism -> 5 TFMG steel -> sky (End) -> 6 Cataclysm bosses -> 7 space.
// Every block removes the old recipe by id and adds the Create one as avgustovmc:create/<name>.
// Part 2 at the bottom: recipes for items that had no way to be obtained (audit 2026-11-17).
ServerEvents.recipes(event => {
  const C = event.recipes.create
  const PM = 'create:precision_mechanism'
  const T_PM = 'create:incomplete_precision_mechanism' // generic transitional item
  const T_BOOK = 'create_sa:incomplete_book'
  const id = n => 'avgustovmc:create/' + n
  // sequenced assembly: deploy each item of `parts` in order (null = press), repeated `loops` times
  const assemble = (out, input, parts, loops, trans, name) => {
    const t = trans || T_PM
    const seq = parts.map(p => p === null ? C.pressing(t, t)
      : (typeof p === 'object' && p.fluid) ? C.filling(t, [t, Fluid.of(p.fluid, p.amount)])
      : C.deploying(t, [t, p]))
    return C.sequenced_assembly([out], input, seq).transitionalItem(t).loops(loops).id(id(name))
  }

  // ===================== Sophisticated Backpacks / Storage: stack upgrades =====================
  // Old: 8 diamond blocks / 8 netherite blocks / 9 tier-4 upgrades on a crafting table. Now an assembly line.
  // One "unit" of a tier is the same everywhere: the backpack tier costs 3 units, the storage tier 1 unit, because
  // Sophisticated Storage converts 1 backpack upgrade <-> 3 storage upgrades of the matching tier.
  const DIAMOND_UNIT = ['minecraft:diamond_block', PM, null]                                   // era 4
  const STEEL_UNIT = ['minecraft:netherite_ingot', 'tfmg:steel_mechanism', 'create:sturdy_sheet', null] // era 5
  event.remove({ id: 'sophisticatedbackpacks:stack_upgrade_tier_3' })
  assemble('sophisticatedbackpacks:stack_upgrade_tier_3', 'sophisticatedbackpacks:stack_upgrade_tier_2', DIAMOND_UNIT, 3, null, 'backpack_stack_tier_3')
  event.remove({ id: 'sophisticatedbackpacks:stack_upgrade_tier_4' })
  assemble('sophisticatedbackpacks:stack_upgrade_tier_4', 'sophisticatedbackpacks:stack_upgrade_tier_3', STEEL_UNIT, 3, null, 'backpack_stack_tier_4')
  event.remove({ id: 'sophisticatedstorage:stack_upgrade_tier_4' })
  assemble('sophisticatedstorage:stack_upgrade_tier_4', 'sophisticatedstorage:stack_upgrade_tier_3', DIAMOND_UNIT, 1, null, 'storage_stack_tier_4')
  event.remove({ id: 'sophisticatedstorage:stack_upgrade_tier_5' })
  assemble('sophisticatedstorage:stack_upgrade_tier_5', 'sophisticatedstorage:stack_upgrade_tier_4', STEEL_UNIT, 1, null, 'storage_stack_tier_5')
  // Omega (unlimited stacks) is a boss-era trophy: tier-4/5 upgrades + Ignitium on mechanical crafters (era 6)
  event.remove({ id: 'sophisticatedbackpacks:stack_upgrade_omega_tier' })
  C.mechanical_crafting('sophisticatedbackpacks:stack_upgrade_omega_tier', ['SIS', 'PNP', 'SIS'], {
    S: 'sophisticatedbackpacks:stack_upgrade_tier_4', I: 'cataclysm:ignitium_ingot', P: 'tfmg:steel_mechanism', N: 'minecraft:nether_star'
  }).id(id('backpack_stack_omega'))
  event.remove({ id: 'sophisticatedstorage:stack_upgrade_omega_tier' })
  C.mechanical_crafting('sophisticatedstorage:stack_upgrade_omega_tier', ['S S', ' I ', 'S S'], {
    S: 'sophisticatedstorage:stack_upgrade_tier_5', I: 'cataclysm:ignitium_ingot'
  }).id(id('storage_stack_omega'))
  // Conversion upgrades (turn an installed upgrade into a higher one) cost the same as the tier they reach,
  // otherwise they would skip the line. Input = what the old recipe had in the middle.
  const CONV = [
    ['sophisticatedbackpacks:stack_upgrade_tier_2_to_tier_3_conversion', 'minecraft:leather', DIAMOND_UNIT, 3],
    ['sophisticatedbackpacks:stack_upgrade_tier_1_to_tier_3_conversion', 'sophisticatedbackpacks:stack_upgrade_tier_1_to_tier_2_conversion', DIAMOND_UNIT, 3],
    ['sophisticatedbackpacks:stack_upgrade_starter_tier_to_tier_3_conversion', 'sophisticatedbackpacks:stack_upgrade_starter_tier_to_tier_2_conversion', DIAMOND_UNIT, 3],
    ['sophisticatedbackpacks:stack_upgrade_tier_3_to_tier_4_conversion', 'minecraft:leather', STEEL_UNIT, 3],
    ['sophisticatedbackpacks:stack_upgrade_tier_2_to_tier_4_conversion', 'sophisticatedbackpacks:stack_upgrade_tier_2_to_tier_3_conversion', STEEL_UNIT, 3],
    ['sophisticatedbackpacks:stack_upgrade_tier_1_to_tier_4_conversion', 'sophisticatedbackpacks:stack_upgrade_tier_1_to_tier_3_conversion', STEEL_UNIT, 3],
    ['sophisticatedbackpacks:stack_upgrade_starter_tier_to_tier_4_conversion', 'sophisticatedbackpacks:stack_upgrade_starter_tier_to_tier_3_conversion', STEEL_UNIT, 3],
    ['sophisticatedstorage:stack_upgrade_tier_3_to_tier_4_conversion', '#minecraft:planks', DIAMOND_UNIT, 1],
    ['sophisticatedstorage:stack_upgrade_tier_2_to_tier_4_conversion', 'sophisticatedstorage:stack_upgrade_tier_2_to_tier_3_conversion', DIAMOND_UNIT, 1],
    ['sophisticatedstorage:stack_upgrade_tier_1_to_tier_4_conversion', 'sophisticatedstorage:stack_upgrade_tier_1_to_tier_3_conversion', DIAMOND_UNIT, 1],
    ['sophisticatedstorage:stack_upgrade_tier_1_plus_to_tier_4_conversion', 'sophisticatedstorage:stack_upgrade_tier_1_plus_to_tier_3_conversion', DIAMOND_UNIT, 1],
    ['sophisticatedstorage:stack_upgrade_tier_4_to_tier_5_conversion', '#minecraft:planks', STEEL_UNIT, 1],
    ['sophisticatedstorage:stack_upgrade_tier_3_to_tier_5_conversion', 'sophisticatedstorage:stack_upgrade_tier_3_to_tier_4_conversion', STEEL_UNIT, 1],
    ['sophisticatedstorage:stack_upgrade_tier_2_to_tier_5_conversion', 'sophisticatedstorage:stack_upgrade_tier_2_to_tier_4_conversion', STEEL_UNIT, 1],
    ['sophisticatedstorage:stack_upgrade_tier_1_to_tier_5_conversion', 'sophisticatedstorage:stack_upgrade_tier_1_to_tier_4_conversion', STEEL_UNIT, 1],
    ['sophisticatedstorage:stack_upgrade_tier_1_plus_to_tier_5_conversion', 'sophisticatedstorage:stack_upgrade_tier_1_plus_to_tier_4_conversion', STEEL_UNIT, 1]
  ]
  CONV.forEach(([out, input, unit, loops]) => {
    event.remove({ id: out })
    assemble(out, input, unit, loops, null, 'conv/' + out.replace(':', '/'))
  })
  // Create milling "recycles" these upgrades into more diamond/netherite blocks than they now cost: removed
  event.remove({ id: 'create:milling/stack_upgrade_tier_3' })
  event.remove({ id: 'create:milling/stack_upgrade_tier_4' })
  event.remove({ id: 'create:milling/stack_upgrade_omega_tier' })

  // ===================== Sophisticated Backpacks: big upgrades =====================
  // Inception (backpacks inside backpacks): mechanical crafters + precision mechanisms (era 4)
  event.remove({ id: 'sophisticatedbackpacks:inception_upgrade' })
  C.mechanical_crafting('sophisticatedbackpacks:inception_upgrade', ['E E', 'PSP', 'DBD', 'E E'], {
    E: 'minecraft:ender_eye', P: PM, S: 'minecraft:nether_star', D: 'minecraft:diamond', B: 'sophisticatedbackpacks:upgrade_base'
  }).id(id('inception_upgrade'))
  // Everlasting (backpack never despawns or burns): End crystals + sturdy sheets, half the nether stars (sky era)
  event.remove({ id: 'sophisticatedbackpacks:everlasting_upgrade' })
  C.mechanical_crafting('sophisticatedbackpacks:everlasting_upgrade', ['C S C', ' TBT ', 'C S C'], {
    C: 'minecraft:end_crystal', S: 'minecraft:nether_star', T: 'create:sturdy_sheet', B: 'sophisticatedbackpacks:upgrade_base'
  }).id(id('everlasting_upgrade'))
  // XP pump: the advanced pump gets an ender eye, liquid experience from a spout and an electron tube (era 2)
  event.remove({ id: 'sophisticatedbackpacks:xp_pump_upgrade' })
  assemble('sophisticatedbackpacks:xp_pump_upgrade', 'sophisticatedbackpacks:advanced_pump_upgrade',
    ['minecraft:ender_eye', { fluid: 'create_enchantment_industry:experience', amount: 50 }, 'create:electron_tube'], 1, null, 'xp_pump_upgrade')

  // ===================== Storage Drawers: top capacity upgrades =====================
  // Old: 2 gems + 6 sticks around a template. Now gems are deployed onto the template (diamond era 2, emerald era 4)
  event.remove({ id: 'storagedrawers:diamond_storage_upgrade' })
  assemble('storagedrawers:diamond_storage_upgrade', 'storagedrawers:upgrade_template',
    ['minecraft:diamond', 'minecraft:diamond', 'create:brass_sheet'], 1, null, 'drawers_diamond_upgrade')
  event.remove({ id: 'storagedrawers:emerald_storage_upgrade' })
  assemble('storagedrawers:emerald_storage_upgrade', 'storagedrawers:upgrade_template',
    ['minecraft:emerald', 'minecraft:emerald', PM], 1, null, 'drawers_emerald_upgrade')

  // ===================== Magnets =====================
  // Simple Magnets: the basic magnet is bent from iron sheets on mechanical crafters (era 2),
  // the advanced one is built on top of it in sequenced assembly (era 2)
  event.remove({ id: 'simplemagnets:basicmagnet' })
  C.mechanical_crafting('simplemagnets:basicmagnet', ['SSL', 'SE ', 'SSR'], {
    S: 'create:iron_sheet', L: 'minecraft:lapis_lazuli', E: 'minecraft:ender_pearl', R: 'minecraft:redstone'
  }).id(id('basic_magnet'))
  event.remove({ id: 'simplemagnets:advancedmagnet' })
  assemble('simplemagnets:advancedmagnet', 'simplemagnets:basicmagnet',
    ['create:golden_sheet', 'create:golden_sheet', 'create:golden_sheet', 'create:golden_sheet', 'minecraft:ender_eye', 'minecraft:diamond', 'create:electron_tube'],
    1, null, 'advanced_magnet')

  // ===================== Teleport / recall =====================
  // Warp plates (automatic teleport pads) need a brass casing core on mechanical crafters (era 2).
  // The waystone and warp stone themselves stay on the crafting table: the era-0 quest asks for them.
  event.remove({ id: 'waystones:warp_plate' })
  C.mechanical_crafting('waystones:warp_plate', ['SWS', 'WFW', 'SCS'], {
    S: 'minecraft:stone_bricks', W: 'waystones:warp_dust', F: 'waystones:dormant_shard', C: 'create:brass_casing'
  }).id(id('warp_plate'))
  // Unusual End prismatic mirror (recall to spawn): pearlescent ingots pressed around a prismalite gem (sky era)
  event.remove({ id: 'unusualend:prismatic_mirror_recipe' })
  assemble('unusualend:prismatic_mirror', 'unusualend:prismalite_gem',
    ['unusualend:pearlescent_ingot', 'unusualend:pearlescent_ingot', 'create:polished_rose_quartz', null], 2, null, 'prismatic_mirror')

  // ===================== Chunk loading / mob control =====================
  // Andesite chunk loader shell: same parts, but on mechanical crafters (its quest b_loader is brass era)
  event.remove({ id: 'create_power_loader:empty_andesite_chunk_loader' })
  C.mechanical_crafting('create_power_loader:empty_andesite_chunk_loader', ['GGG', 'GRG', 'CSC'], {
    G: '#c:glass_blocks', R: 'minecraft:respawn_anchor', S: 'create:shaft', C: 'create:andesite_casing'
  }).id(id('andesite_chunk_loader'))
  // Mega Torch (no hostile spawns in a huge radius): its quest is era 1, so it is forged in a basin
  // by an unheated mixer, with lava instead of a crafting grid
  event.remove({ id: 'torchmaster:megatorch' })
  C.mixing('torchmaster:megatorch', ['3x minecraft:torch', '2x minecraft:diamond', '2x minecraft:gold_block', '2x #minecraft:logs',
    Fluid.of('minecraft:lava', 250)]).id(id('megatorch'))

  // ===================== Enchanting / beacon =====================
  // Disenchanting table: electron tube and brass casing on mechanical crafters (era 2)
  event.remove({ id: 'disenchanting_table:disenchanting_table' })
  C.mechanical_crafting('disenchanting_table:disenchanting_table', ['LTL', 'DCD', 'OOO'], {
    L: 'minecraft:lapis_lazuli', T: 'create:electron_tube', D: 'minecraft:diamond', C: 'create:brass_casing', O: 'minecraft:obsidian'
  }).id(id('disenchanting_table'))
  // Beacon: a wider framed-glass dome with brass sheets around the star (era 2: the Wither needs the Nether anyway)
  event.remove({ id: 'minecraft:beacon' })
  C.mechanical_crafting('minecraft:beacon', ['GGGGG', 'GSNSG', 'OOOOO'], {
    G: 'create:framed_glass', S: 'create:brass_sheet', N: 'minecraft:nether_star', O: 'minecraft:obsidian'
  }).id(id('beacon'))

  // ===================== Personal flight and power tools (Create Stuff 'n Additions) =====================
  // Their engines already come from sequenced assembly; the final assembly moves to mechanical crafters
  // and ingots become pressed sheets (era 2). The brass jetpack and drone were mechanical already.
  event.remove({ id: 'create_sa:copper_propeler_recipe' })
  C.mechanical_crafting('create_sa:copper_jetpack_chestplate', ['C1C', 'C2C', '343'], {
    C: 'create:copper_sheet', 1: 'create:cogwheel', 2: 'create_sa:hydraulic_engine', 3: 'create:fluid_tank', 4: 'create:andesite_alloy'
  }).id(id('copper_jetpack'))
  event.remove({ id: 'create_sa:copper_exoskeleton_recipe' })
  C.mechanical_crafting('create_sa:copper_exoskeleton_chestplate', ['C1C', '323', '545'], {
    C: 'create:copper_sheet', 1: 'create:cogwheel', 2: 'create_sa:hydraulic_engine', 3: 'create:fluid_tank', 4: 'create:andesite_alloy', 5: '#c:storage_blocks/copper'
  }).id(id('copper_exoskeleton'))
  event.remove({ id: 'create_sa:portable_drill_recipe' })
  C.mechanical_crafting('create_sa:portable_drill', [' B ', '1E1', ' D '], {
    B: 'create:brass_sheet', 1: 'create:cogwheel', E: 'create_sa:steam_engine', D: 'create_sa:brass_drill_head'
  }).id(id('portable_drill'))
  // Deeper Darker soul elytra (better elytra): the elytra rides an assembly line through sculk parts and a
  // precision mechanism (sky era; same sculk parts as before)
  event.remove({ id: 'deeperdarker:soul_elytra' })
  assemble('deeperdarker:soul_elytra', 'minecraft:elytra',
    ['deeperdarker:sculk_bone', 'deeperdarker:sculk_bone', 'deeperdarker:sculk_bone', 'deeperdarker:sculk_bone',
      'deeperdarker:soul_dust', 'deeperdarker:soul_dust', 'deeperdarker:soul_crystal', PM], 1, null, 'soul_elytra')

  // ===================== Legendary Survival Overhaul coats =====================
  // Tier 1 stays on the sewing table/crafting table (survival quests). Tier 2 gets fluid pipes on mechanical
  // crafters (era 2, blaze rods = Nether), tier 3 precision mechanisms (sky era, end rods).
  const coat = (out, pattern, keys) => { event.remove({ id: out }); C.mechanical_crafting(out, pattern, keys).id(id('lso/' + out.split(':')[1])) }
  const L = s => 'legendarysurvivaloverhaul:' + s
  coat(L('heating_coat_2'), ['Pdb', 'db#', 'b##'], { P: 'create:fluid_pipe', d: 'minecraft:diamond', b: 'minecraft:blaze_rod', '#': L('heating_coat_1') })
  coat(L('cooling_coat_2'), ['Pdb', 'db#', 'b##'], { P: 'create:fluid_pipe', d: 'minecraft:diamond', b: 'minecraft:blaze_rod', '#': L('cooling_coat_1') })
  coat(L('thermal_coat_2'), ['Pcb', 'Pbh'], { P: 'create:fluid_pipe', c: L('cooling_coat_2'), b: 'minecraft:blaze_rod', h: L('heating_coat_2') })
  coat(L('heating_coat_3'), ['Mne', 'ne#', 'e##'], { M: PM, n: 'minecraft:netherite_ingot', e: 'minecraft:end_rod', '#': L('heating_coat_2') })
  coat(L('cooling_coat_3'), ['Mne', 'ne#', 'e##'], { M: PM, n: 'minecraft:netherite_ingot', e: 'minecraft:end_rod', '#': L('cooling_coat_2') })
  coat(L('thermal_coat_3'), ['Mce', 'Meh'], { M: PM, c: L('cooling_coat_3'), e: 'minecraft:end_rod', h: L('heating_coat_3') })

  // (Iron's Spellbooks removed 17.11.2026: its spell book and upgrade orb recipes went with it)

  // =====================================================================================
  // Part 2: items that existed but could not be obtained at all (no recipe, loot or worldgen)
  // =====================================================================================
  // Create 6 ships chromatic compound, refined radiance, shadow steel and their casings without any recipe
  // (only a few in an easy-structures chest), so Create Encased's radiant/shadow casings, gearboxes and
  // Create: More Features' shadow ingot were dead ends. Classic Create 0.3 chain, late:
  // chromatic compound = superheated mix (blaze cake), refined radiance = + end rods (End), shadow steel = haunting.
  C.mixing('create:chromatic_compound', ['3x minecraft:glowstone_dust', '3x create:powdered_obsidian', 'create:polished_rose_quartz'])
    .superheated().id(id('fix/chromatic_compound'))
  C.mixing('create:refined_radiance', ['create:chromatic_compound', '2x minecraft:end_rod']).superheated().id(id('fix/refined_radiance'))
  C.haunting('create:shadow_steel', 'create:chromatic_compound').id(id('fix/shadow_steel'))
  event.custom({ type: 'create:item_application', ingredients: [{ tag: 'c:stripped_logs' }, { item: 'create:refined_radiance' }], results: [{ id: 'create:refined_radiance_casing' }] }).id(id('fix/refined_radiance_casing')) // KubeJS read the tag as a fluid here
  event.custom({ type: 'create:item_application', ingredients: [{ tag: 'c:stripped_logs' }, { item: 'create:shadow_steel' }], results: [{ id: 'create:shadow_steel_casing' }] }).id(id('fix/shadow_steel_casing')) // KubeJS read the tag as a fluid here
  // Create Encased and TFMG vertical gearboxes had no recipe (Create's own comes from the normal gearbox)
  ;['brass', 'copper', 'industrial_iron', 'railway', 'weathered_iron', 'zinc', 'refined_radiance', 'shadow_steel'].forEach(m => {
    event.shapeless('createcasing:vertical_' + m + '_gearbox', ['createcasing:' + m + '_gearbox']).id(id('fix/vertical_' + m + '_gearbox'))
  })
  event.shapeless('tfmg:steel_vertical_gearbox', ['tfmg:steel_gearbox']).id(id('fix/tfmg_steel_vertical_gearbox'))
  // Factory Blocks "Medium Fan" was left out of the stonecutter set in avgustovmc_factory_blocks.js
  event.stonecutting('factory_blocks:medium_fan', '#factory_blocks:factory').id(id('fix/factory_medium_fan'))
})
