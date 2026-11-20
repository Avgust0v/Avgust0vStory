// AvgustovStory 1.1: pack items.
// Guardian token: dropped to every player near a structure boss when it dies (server_scripts/avgustov_boss_intros.js),
// spent in the "Лавка артели" quest chapter on things that cannot be crafted.
StartupEvents.registry('item', function (e) {
  var t = e.create('guardian_token');
  try { t.rarity('epic'); } catch (x) {}
  try { t.glow(true); } catch (x) {}
  try { t.maxStackSize(64); } catch (x) {}
});
