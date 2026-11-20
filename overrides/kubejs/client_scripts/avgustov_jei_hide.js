// AvgustovStory (19.11.2026): items left without a recipe by the weapon recipe audit (avgustov_extra_recipes.js) are
// hidden in JEI: Epic Knights tin and silver weapons (no tin or silver in the pack) and the Basic Weapons spears that
// duplicated the Backported Spears ones.
RecipeViewerEvents.removeEntries('item', function (e) {
  e.remove(/^magistuarmory:(tin|silver)_/)
  e.remove(/^basicweapons:(wooden|stone|iron|golden|diamond)_spear$/)
})
