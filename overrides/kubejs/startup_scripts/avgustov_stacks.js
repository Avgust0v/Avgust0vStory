// AvgustovStory 1.1.1: drinks and bowl food stack to 16 instead of 1.
// - minecraft:potion: the water bottle first of all (LSO purifies it in a furnace).
//   Vanilla 1.21 PotionItem puts the empty bottle into the inventory while the stack is not empty.
// - Food that returns its container through vanilla FoodProperties.usingConvertsTo (bowls, bottles):
//   vanilla Player.eat adds the container to the inventory the same way.
// - Legendary Survival Overhaul bottled drinks (BottledDrinkItem handles stacks itself).
// Only items whose stack is 1 now and that have no durability are changed (canteens keep 1).
// Script runs on both sides: the client must have it too, or stacks desync.
ItemEvents.modification(function (e) {
  var R = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries');
  var DC = Java.loadClass('net.minecraft.core.component.DataComponents');
  var STACK = 16;
  var EXTRA = /^legendarysurvivaloverhaul:(purified_water_bottle|[a-z_]+_juice)$/;
  var ids = [], items = [];
  var iter = R.ITEM.iterator();
  while (iter.hasNext()) {
    var item = iter.next();
    var id = String(R.ITEM.getKey(item));
    try {
      var c = item.components();
      if (c.getOrDefault(DC.MAX_STACK_SIZE, 64) != 1 || c.has(DC.MAX_DAMAGE)) continue;
      var take = id == 'minecraft:potion' || EXTRA.test(id);
      if (!take) {
        var food = c.get(DC.FOOD);
        take = food != null && food.usingConvertsTo().isPresent();
      }
      if (take) { ids.push(id); items.push(item); }
    } catch (x) {
      console.warn('[avgustov] stacks: skip ' + id + ': ' + x);
    }
  }
  ids.forEach(function (id) {
    e.modify(id, function (m) { m.setMaxStackSize(STACK); });
  });
  var done = [];
  for (var i = 0; i < items.length; i++) {
    try {
      if (items[i].getDefaultMaxStackSize() == STACK) done.push(ids[i]);
      else console.warn('[avgustov] stacks: not applied to ' + ids[i]);
    } catch (x) {
      console.warn('[avgustov] stacks: check failed ' + ids[i] + ': ' + x);
    }
  }
  console.info('[avgustov] stacks ' + STACK + ': ' + done.length + ' of ' + ids.length + ' items: ' + done.join(' '));
});
