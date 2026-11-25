// AvgustovStory 1.3.0 (25.11.2026, user: «в очках показывается вес, пусть показывает вес всех блоков, даже если это 1»).
// Simulated (Create Aeronautics) prints a block's physics mass in its tooltip while the player wears Engineer's Goggles
// (config simulated-client.toml displayProperties = GOGGLES), but only as a category: Weightless, Super Light (<= 0.25),
// Light (<= 0.5), Heavy (>= 4), Super Heavy (>= 50), Absurdly Heavy (>= 100) — thresholds read from its
// BlockPropertiesTooltip class. Blocks between 0.5 and 4 kpg, i.e. every ordinary block of mass 1, get no line.
// This adds the same kind of line for exactly those blocks: «Обычный 1 kpg», only with goggles on.
// Mass: Sable's BlockStateExtension.sable$getProperty(PhysicsBlockPropertyTypes.MASS) on the block's default state.
var AVM_Types = Java.loadClass('dev.ryanhcode.sable.physics.config.block_properties.PhysicsBlockPropertyTypes');
var AVM_Goggles = Java.loadClass('com.simibubi.create.content.equipment.goggles.GogglesItem');
var AVM_BlockItem = Java.loadClass('net.minecraft.world.item.BlockItem');

function avmMassType() {
  var t = AVM_Types.MASS;
  return (t != null && typeof t.get === 'function') ? t.get() : t;
}

ItemEvents.modifyTooltips(function (e) {
  e.modifyAll(function (tooltip) { tooltip.dynamic('avgustov_mass'); });
});

ItemEvents.dynamicTooltips('avgustov_mass', function (e) {
  try {
    var stack = e.item;
    if (stack == null || stack.isEmpty() || !(stack.getItem() instanceof AVM_BlockItem)) return;
    var player = Client.player;
    if (player == null || !AVM_Goggles.isWearingGoggles(player)) return;
    var state = stack.getItem().getBlock().defaultBlockState();
    var m = state['sable$getProperty'](avmMassType());
    if (m == null) return;
    m = Number(m);
    if (!(m > 0.5 && m < 4)) return; // Simulated already shows its own line
    var v = Math.abs(m - Math.round(m)) < 0.005 ? String(Math.round(m)) : m.toFixed(2);
    e.add(Text.of('').append(Text.gray('Обычный ')).append(Text.darkGray(v + ' kpg')));
  } catch (err) {
    // a broken tooltip must never break the inventory screen
  }
});
