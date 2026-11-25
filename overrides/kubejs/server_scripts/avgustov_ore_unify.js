// AvgustovStory (19.11.2026): one ore per material. Worldgen and drops live in kubejs/data:
//  - lead: TFMG only; Create Gunsmithing lead ore no longer generates, old veins drop TFMG raw lead;
//  - nickel: TFMG only in the Overworld; Creating Space Overworld nickel off (Moon nickel stays), old veins drop TFMG raw nickel;
//  - sulfur: Create Gunsmithing ore in the Nether; Create MF basalt sulfur off, Create MF ores drop Gunsmithing sulfur;
//  - platinum (Propulsion) about a third of before, thorium (New Age) half.
// Create MF recipes asked for its own sulfur item only: they now take any #c:dusts/sulfur, and old Create MF sulfur stays usable.
//
// 25.11.2026 (user: "при плавке руд выпадает то один, то другой вид одной руды, а мы как бы приходили к одному виду"):
// the ores were unified, the OUTPUTS were not. Audit on boottest (temporary script: every non-crafting recipe output in a
// c:ingots / nuggets / dusts / plates / raw_materials / gems / storage_blocks tag, grouped by tag) found 13 tags made as two
// or three different items. Now every recipe makes the chosen item (replaceOutput), and every recipe that asked for one of
// the other items takes the whole tag (replaceInput), so items already in chests keep working everywhere.
// Choice: the mod whose ore stays (TFMG lead/nickel/aluminium, Gunsmithing sulfur/saltpeter), TFMG for industrial metals,
// Create Deco / Create Crafts & Additions for the sheets Create players know.
var AVU_UNIFY = [
  ['c:ingots/lead', 'tfmg:lead_ingot', ['cgs:lead_ingot']],
  ['c:ingots/nickel', 'tfmg:nickel_ingot', ['creatingspace:nickel_ingot']],
  ['c:plates/nickel', 'tfmg:nickel_sheet', ['creatingspace:nickel_sheet']],
  ['c:ingots/aluminum', 'tfmg:aluminum_ingot', ['creatingspace:aluminum_ingot']],
  ['c:nuggets/aluminum', 'tfmg:aluminum_nugget', ['creatingspace:aluminum_nugget']],
  ['c:plates/aluminum', 'tfmg:aluminum_sheet', ['creatingspace:aluminum_sheet']],
  ['c:ingots/cast_iron', 'tfmg:cast_iron_ingot', ['createbigcannons:cast_iron_ingot']],
  ['c:plates/steel', 'tfmg:heavy_plate', ['cgs:steel_sheet']],
  ['c:plates/zinc', 'createaddition:zinc_sheet', ['createcasing:zinc_sheet', 'createdeco:zinc_sheet']],
  ['c:plates/andesite_alloy', 'createdeco:andesite_sheet', ['createcasing:andesite_sheet']],
  ['c:plates/industrial_iron', 'createdeco:industrial_iron_sheet', ['createcasing:industrial_iron_sheet']],
  ['c:dusts/sulfur', 'cgs:sulfur', ['create_mf:sulfur', 'tfmg:sulfur_dust']],
  ['c:dusts/saltpeter', 'cgs:niter', ['tfmg:nitrate_dust']],
];

ServerEvents.tags('item', event => {
  event.add('c:dusts/sulfur', 'create_mf:sulfur')
})

ServerEvents.recipes(event => {
  event.replaceInput({ mod: 'create_mf' }, 'create_mf:sulfur', '#c:dusts/sulfur')
  // TFMG casting is a recipe type KubeJS cannot rewrite: Create Metalwork's copy that casts molten cast iron into the Big
  // Cannons ingot goes; TFMG's own casting (tfmg:casting/cast_iron) makes the TFMG ingot from the same molten iron.
  event.remove({ id: 'createmetalwork:tfmg/casting/cast_iron_from_createbigcannons' })
  AVU_UNIFY.forEach(function (u) {
    u[2].forEach(function (other) {
      event.replaceInput({}, other, '#' + u[0])
      event.replaceOutput({}, other, u[1])
    })
  })
})
