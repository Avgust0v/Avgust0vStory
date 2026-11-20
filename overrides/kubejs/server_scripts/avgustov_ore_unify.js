// AvgustovStory (19.11.2026): one ore per material. Worldgen and drops live in kubejs/data:
//  - lead: TFMG only; Create Gunsmithing lead ore no longer generates, old veins drop TFMG raw lead;
//  - nickel: TFMG only in the Overworld; Creating Space Overworld nickel off (Moon nickel stays), old veins drop TFMG raw nickel;
//  - sulfur: Create Gunsmithing ore in the Nether; Create MF basalt sulfur off, Create MF ores drop Gunsmithing sulfur;
//  - platinum (Propulsion) about a third of before, thorium (New Age) half.
// Create MF recipes asked for its own sulfur item only: they now take any #c:dusts/sulfur, and old Create MF sulfur stays usable.
ServerEvents.tags('item', event => {
  event.add('c:dusts/sulfur', 'create_mf:sulfur')
})

ServerEvents.recipes(event => {
  event.replaceInput({ mod: 'create_mf' }, 'create_mf:sulfur', '#c:dusts/sulfur')
})
