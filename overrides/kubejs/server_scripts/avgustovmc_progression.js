// AvgustovStory: staged progression. Each era's key machines need a product of the previous era. Era numbers match the quest book:
// 0 survival -> 1 andesite -> 2 brass (Nether; first physics vehicles and propeller ships) -> 3 factory & electricity
// -> 4 steam & rails (precision mechanism; stabilised ships) -> 5 steel & oil (TFMG) -> sky endgame (End: jetpacks, ion thrusters)
// -> 6 boss trophies (Cataclysm) -> 7 space (Creating Space + New Age).
// Only ingredients are swapped; no item is locked, so nothing breaks if a quest is skipped.

ServerEvents.recipes(event => {
  const swap = (output, from, to) => event.replaceInput({ output: output }, from, to)

  // ---------- exploits that skip whole eras ----------
  event.remove({ id: 'create_ultimate_factory:crushing_netherite' }) // netherite scrap from crushing nether bricks

  // ---------- one steel: only TFMG's blast furnace makes it from scratch ----------
  // CBC (2 iron + coal, heated mixer) and Gunsmithing (iron + charcoal dust) made steel trivial,
  // and all three share #c:ingots/steel, so they also unlocked every TFMG steel recipe.
  event.remove({ id: 'createbigcannons:mixing/alloy_steel' })
  event.remove({ id: 'cgs:mixing/steel_ingot' })
  // Create Metalwork (audit 19.11): 90 mB molten iron + coal in a heated mixer gave 90 mB molten TFMG steel, which TFMG
  // casts into ingots, i.e. steel in the brass era without the blast furnace.
  event.remove({ id: 'createmetalwork:mixing/alloying/molten_steel_from_molten_iron_from_tfmg' })
  // 1:1 conversions so each mod's own steel items still work in its own recipes
  event.shapeless('createbigcannons:steel_ingot', ['tfmg:steel_ingot']).id('avgustovmc:steel/tfmg_to_cbc')
  event.shapeless('tfmg:steel_ingot', ['createbigcannons:steel_ingot']).id('avgustovmc:steel/cbc_to_tfmg')
  event.shapeless('cgs:steel_ingot', ['tfmg:steel_ingot']).id('avgustovmc:steel/tfmg_to_cgs')
  event.shapeless('tfmg:steel_ingot', ['cgs:steel_ingot']).id('avgustovmc:steel/cgs_to_tfmg')

  // ---------- era 2: brass (needs a Blaze Burner -> Nether trip) ----------
  // physics vehicles (Create Aeronautics / Simulated) start with brass, not andesite
  swap('simulated:physics_assembler', 'create:andesite_casing', 'create:brass_casing')
  // New Age electricity comes after Crafts & Additions basics
  swap('create_new_age:basic_energiser', 'minecraft:lightning_rod', 'createaddition:capacitor')
  swap('create_new_age:basic_motor', 'create:andesite_casing', 'create:brass_casing')
  swap('create_new_age:generator_coil', '#c:ingots/copper', 'createaddition:copper_spool')

  // ---------- era 4: steam & rails (precision mechanism) ----------
  // Aeronautics starts with brass: the propeller bearing keeps its own recipe (brass casing + iron sheet),
  // so the first propeller ships come before trains. Stabilised ships arrive together with trains:
  swap('aeronautics:gyroscopic_propeller_bearing', 'create:brass_casing', 'create:precision_mechanism')
  swap('aeronautics:smart_propeller', 'create:brass_casing', 'create:precision_mechanism')
  swap('createpropulsion:thruster', 'create:iron_sheet', 'create:precision_mechanism')

  // ---------- era 5: steel & oil ----------
  // Diesel Generators oil and engines need TFMG steel (its pumpjack used to be andesite + zinc)
  swap('createdieselgenerators:pumpjack_bearing', '#c:ingots/zinc', 'tfmg:steel_mechanism')
  swap('createdieselgenerators:distillation_controller', '#c:plates/iron', 'tfmg:heavy_plate')
  swap('createdieselgenerators:engine_piston', 'create:andesite_alloy', 'tfmg:steel_ingot')
  // infinite ore veins are an industrial-age luxury
  swap('createoreexcavation:drilling_machine', '#c:storage_blocks/brass', 'tfmg:steel_block')
  swap('createoreexcavation:extractor', '#c:storage_blocks/brass', 'tfmg:steel_block')
  swap('createoreexcavation:drill', '#c:storage_blocks/iron', 'tfmg:steel_block')
  // nuclear fuel rods need heavy plate
  swap('create_new_age:reactor_rod', '#c:plates/gold', 'tfmg:heavy_plate')

  // ---------- sky endgame ----------
  swap('createpropulsion:ion_thruster', 'create:chute', 'tfmg:steel_mechanism')
  // Create Jetpack already needs an Elytra (End)

  // ---------- era 6: bosses ----------
  // the jetpack uses its own recipe type (copies the backtank's air), which replaceInput does not touch,
  // so the recipe is re-created with the same type and Ignitium instead of the precision mechanism
  event.remove({ id: 'create_jetpack:netherite_jetpack_upgrade' })
  event.remove({ id: 'create_jetpack:netherite_jetpack_upgrade_from_netherite' })
  event.remove({ id: 'create_jetpack:netherite_jetpack' })
  event.custom({
    type: 'create_jetpack:copy_components_mechanical_crafting',
    accept_mirrored: true,
    category: 'misc',
    pattern: [' PSP ', 'PYXYP', 'PCECP', ' C C '],
    key: {
      E: { item: 'minecraft:elytra' },
      C: { item: 'create:chute' },
      X: { item: 'create:netherite_backtank' },
      S: { item: 'create:shaft' },
      Y: { item: 'cataclysm:ignitium_ingot' },
      P: { tag: 'c:plates/brass' }
    },
    result: { id: 'create_jetpack:netherite_jetpack' }
  }).id('avgustovmc:netherite_jetpack')
  // netherite drill: smithing upgrade now takes Witherite (Harbinger) instead of a netherite ingot
  event.remove({ id: 'minecraft:netherite_drill_smithing' })
  event.smithing('createoreexcavation:netherite_drill', 'minecraft:netherite_upgrade_smithing_template',
    'createoreexcavation:diamond_drill', 'cataclysm:witherite_ingot').id('avgustovmc:netherite_drill')

  // ---------- era 7: space ----------
  swap('creatingspace:rocket_controls', 'create:sturdy_sheet', 'create_new_age:overcharged_diamond')
  swap('creatingspace:rocket_controls', 'create:electron_tube', 'tfmg:circuit_board')
})
