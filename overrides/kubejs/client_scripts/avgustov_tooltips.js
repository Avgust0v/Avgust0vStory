// AvgustovStory 1.1-dev.9: Crystal Heart is handled by server_scripts/avgustov_kitchen_hearts.js (LSO health system is off).
ItemEvents.modifyTooltips(function (e) {
  e.add('legendarysurvivaloverhaul:heart_container', [Text.of('ПКМ: +1 сердце навсегда, максимум 20').lightPurple()]);
  e.add('legendarysurvivaloverhaul:heart_fragment', [Text.of('9 осколков — Кристальное сердце (+1 сердце)').gray()]);
});
