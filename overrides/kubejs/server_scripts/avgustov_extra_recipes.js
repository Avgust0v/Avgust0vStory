// AvgustovStory 1.1-dev.11: small crafting recipes the players asked for (not fixes of broken mod recipes, those live in
// avgustovmc_fixes.js; expensive items made through Create machines live in avgustov_create_recipes.js).
ServerEvents.recipes(event => {
  // Saddle: Minecraft 1.21.1 has no recipe for it (only loot, fishing and the master leatherworker). Five leather, a string
  // to tie it and two iron ingots for the stirrups.
  event.shaped('minecraft:saddle', ['LLL', 'LSL', 'I I'], { L: 'minecraft:leather', S: 'minecraft:string', I: 'minecraft:iron_ingot' })
    .id('avgustov:saddle')
})

// Immersive Armors heavy armour (18 armour, 16 toughness, 50% knockback resistance: tougher than netherite) was made from
// iron blocks on day one. It now needs TFMG steel and becomes the armour of the steel era (user decision, dev.11).
ServerEvents.recipes(event => {
  event.replaceInput({ output: /^immersive_armors:heavy_(helmet|chestplate|leggings|boots)$/ }, 'minecraft:iron_block', 'tfmg:steel_block')
  event.replaceInput({ output: /^immersive_armors:heavy_(helmet|chestplate|leggings|boots)$/ }, 'minecraft:iron_ingot', 'tfmg:steel_ingot')
})

// 1.1-dev.11i: Epic Knights balance (agent audit, 2026-11-18).
// - EK blasts an iron ingot into EK steel in 2 s; that steel is in c:ingots/steel and would bypass the "steel comes only
//   from TFMG" rule (avgustovmc_progression.js). Removed; smelting EK steel gear back into steel nuggets stays.
// - Every EK shield needed a steel ingot, even wooden ones, so shields weaker than a vanilla shield sat in the steel era.
//   Shields of wood, stone, iron, gold, diamond and copper now take iron; steel shields keep steel.
// - Maximilian armour (22 armour, 7.2 toughness, no knockback) was a netherite template + knight plate + blaze powder,
//   i.e. netherite tier without netherite. The blaze powder becomes a netherite ingot.
ServerEvents.recipes(event => {
  event.remove({ id: 'magistuarmory:furnace/steel_ingot_blasting' })
  event.replaceInput({ output: /^magistuarmory:(wood|stone|iron|gold|diamond|copper)_(buckler|target|heatershield|kiteshield|roundshield|rondache|tartsche|ellipticalshield|pavese)$/ }, '#c:ingots/steel', '#c:ingots/iron')
  event.replaceInput({ output: /^magistuarmory:maximilian_(helmet|chestplate|leggings|boots)$/ }, 'minecraft:blaze_powder', 'minecraft:netherite_ingot')
})

// 19.11 recipe audit (tools/recipe_audit.js, request of the owner):
// - Epic Knights tin and silver weapons ask for #c:ingots/tin / #c:ingots/silver, which no mod in the pack fills. An empty
//   tag matches an EMPTY slot, so these 45 recipes crafted metal weapons from a bare hilt or pole and collided with each
//   other (tin = silver, hammers = morgensterns). No tin or silver exists here: the recipes go, the items are hidden in JEI.
// - Basic Weapons wooden/stone/iron/golden/diamond spears had the exact recipes of the Backported Spears ones
//   (minecraft:*_spear), which quests and loot use. The Basic Weapons copies go; its netherite spear stays.
ServerEvents.recipes(event => {
  event.remove({ output: /^magistuarmory:(tin|silver)_/ })
  event.remove({ output: /^basicweapons:(wooden|stone|iron|golden|diamond)_spear$/ })
})

// Long fall boots (grapple mod) are smithed from diamond OR netherite boots but come out as one item: from netherite it
// was a downgrade. Only diamond boots stay as the base; the boots now carry the T3 diamond stats (tools/balance).
ServerEvents.tags('item', event => {
  event.remove('grapplemod:eligible_long_fall_boots_base', 'minecraft:netherite_boots')
})

// 25.11.2026 (night, quest chapter «Фермы и линии»): clean water could only be made by hand at a boiling cauldron
// (avgustov_boiling.js), so a Create "water station" was impossible although LSO thirst is the daily chore. A heated
// mixer boils water into bottles: glass bottle + 250 mB water over a lit blaze burner -> purified water bottle.
ServerEvents.recipes(event => {
  event.recipes.create.mixing('legendarysurvivaloverhaul:purified_water_bottle',
    ['minecraft:glass_bottle', Fluid.of('minecraft:water', 250)]).heated().id('avgustov:purified_water_mixing')
})
