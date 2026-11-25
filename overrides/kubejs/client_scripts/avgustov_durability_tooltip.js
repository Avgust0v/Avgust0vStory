// AvgustovStory 1.3.0 (25.11.2026, user: "хотелось в подсказке видеть на сколько блоков хватит кирки или меча ударов").
// No installed mod shows durability without F3+H (checked: Obscure Tooltips, Iceberg, Equipment Compare, Jade, only Just
// Hammers has its own line). Every item that wears out gets "Прочность: left / max" (skipped with F3+H, vanilla prints it
// then) and, by kind, how much work is left:
//   mining tools (tag minecraft:enchantable/mining) - blocks (1 point per block that takes time to break);
//   weapons without mining (enchantable/weapon) - hits; bows and crossbows - shots; trident - hits; fishing rods - casts.
// Unbreaking L spends a point only with chance 1/(L+1) for tools and weapons, so the count is multiplied by L+1 and
// marked "с учётом чар". Armour wears by the damage taken, so it gets the durability line only.
// API: KubeJS 2101.7 ItemEvents.modifyTooltips -> TextActionBuilder.dynamic(id) -> ItemEvents.dynamicTooltips(id).
var AVD_DC = Java.loadClass('net.minecraft.core.component.DataComponents');

function avdPlural(n, one, few, many) {
  var a = n % 100, b = n % 10;
  if (a >= 11 && a <= 14) return many;
  if (b === 1) return one;
  if (b >= 2 && b <= 4) return few;
  return many;
}

function avdUnbreaking(stack) {
  var lvl = 0;
  try {
    var en = stack.get(AVD_DC.ENCHANTMENTS);
    if (en == null) return 0;
    en.keySet().forEach(function (h) {
      var k = h.unwrapKey();
      if (k.isPresent() && String(k.get().location()) === 'minecraft:unbreaking') lvl = en.getLevel(h);
    });
  } catch (err) { lvl = 0; }
  return lvl;
}

ItemEvents.modifyTooltips(function (e) {
  e.modifyAll(function (tooltip) { tooltip.dynamic('avgustov_durability'); });
});

ItemEvents.dynamicTooltips('avgustov_durability', function (e) {
  try {
    var stack = e.item;
    if (stack == null || stack.isEmpty() || !stack.isDamageableItem()) return;
    if (stack.has(AVD_DC.UNBREAKABLE)) return;
    var max = stack.getMaxDamage(), left = max - stack.getDamageValue();
    if (max <= 0) return;
    var kind = null;
    if (stack.hasTag('minecraft:enchantable/mining')) kind = ['блок', 'блока', 'блоков'];
    else if (stack.hasTag('minecraft:enchantable/bow') || stack.hasTag('minecraft:enchantable/crossbow')) kind = ['выстрел', 'выстрела', 'выстрелов'];
    else if (stack.hasTag('minecraft:enchantable/weapon') || stack.hasTag('minecraft:enchantable/trident')) kind = ['удар', 'удара', 'ударов'];
    else if (stack.hasTag('minecraft:enchantable/fishing')) kind = ['заброс', 'заброса', 'забросов'];
    var share = left / max;
    var color = share > 0.5 ? 'green' : share > 0.2 ? 'yellow' : 'red';
    var line = [];
    if (!e.advanced) line.push(Text.gray('Прочность: '), Text.of(String(left))[color](), Text.gray(' / ' + max));
    if (kind) {
      var ub = avdUnbreaking(stack), n = left * (ub + 1);
      line.push(Text.gray((line.length ? ' · ' : '') + 'хватит на ≈'), Text.white(String(n)),
        Text.gray(' ' + avdPlural(n, kind[0], kind[1], kind[2]) + (ub > 0 ? ' (с учётом чар)' : '')));
    }
    if (line.length) e.add(avdJoin(line));
  } catch (err) {
    // a broken tooltip must never break the inventory screen
  }
});

function avdJoin(parts) {
  var t = Text.of('');
  for (var i = 0; i < parts.length; i++) t = t.append(parts[i]);
  return t;
}
