// AvgustovStory 1.2.3: boiled water. In Legendary Survival Overhaul (LSO) water in a cauldron is always dirty
// (water_cauldron: 75% chance of Thirst), however it was filled (user, 22.11.2026: "можно ли котёл наполнить чистой
// водой?"). Now a water cauldron standing on a heat source holds boiled, clean water.
// Boiling = Amendments already marks the cauldron boiling=true (it bubbles; any fire below, soul fire too), or the
// block under it is rated 5+ degrees in LSO's own block temperature data: lit campfire, fire, magma, lava, lit
// furnace or stove, kindled blaze burner, balloon burner, and the modded ones from tools/lso_heat_blocks.js.
// On a boiling cauldron:
//   - empty hand, plain click (LSO's way to drink from blocks) or sneaking: clean drink, no Thirst;
//   - glass bottle: purified water bottle, the cauldron loses a level like with a normal bottle;
//   - LSO canteen: filled the usual way, then marked purified (unless it already held dirty water).
// The handler runs at HIGHEST priority and cancels the click, so LSO and vanilla do not act on it as well.
// 25.11.2026 (user: «Так же косты под котлом с водой не работают, всё равно пьётся как грязная, хоть она в котле и кипит»):
// LSO drinks from a block only on a plain click without sneaking (CommonNeoForgeEvents.onRightClickBlock skips the
// block when isCrouching), within half the reach and when not at full hydration. 1.2.3 took only the sneak click, so
// a plain click went on to LSO and gave dirty water. Now the plain click is taken on the same terms as LSO's; its
// drink sound comes from LSO on the drinker's side, so the script plays it only for the sneak click.

var AV_BOIL_MIN = 5;         // LSO degrees of the block under the cauldron
var AV_BOIL_DRINK = [3, 1];  // hydration and saturation of one sip (LSO water_cauldron gives 3 hydration)
var AV_BOIL = null;

function avBoilApi() {
  if (AV_BOIL !== null) return AV_BOIL;
  try {
    var BI = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries');
    AV_BOIL = {
      BI: BI,
      data: Java.loadClass('sfiomn.legendarysurvivaloverhaul.api.data.manager.TemperatureDataManager'),
      thirst: Java.loadClass('sfiomn.legendarysurvivaloverhaul.api.thirst.ThirstUtil'),
      attach: Java.loadClass('sfiomn.legendarysurvivaloverhaul.util.AttachmentUtil'),
      PURIFIED: Java.loadClass('sfiomn.legendarysurvivaloverhaul.api.thirst.HydrationEnum').PURIFIED,
      Canteen: Java.loadClass('sfiomn.legendarysurvivaloverhaul.common.items.drink.CanteenItem'),
      Cauldron: Java.loadClass('net.minecraft.world.level.block.LayeredCauldronBlock'),
      ItemUtils: Java.loadClass('net.minecraft.world.item.ItemUtils'),
      ItemStack: Java.loadClass('net.minecraft.world.item.ItemStack'),
      Result: Java.loadClass('net.minecraft.world.InteractionResult'),
      MAIN: Java.loadClass('net.minecraft.world.InteractionHand').MAIN_HAND,
      purified: BI.ITEM.get(Java.loadClass('net.minecraft.resources.ResourceLocation').parse('legendarysurvivaloverhaul:purified_water_bottle'))
    };
  } catch (err) {
    console.warn('[avgustov] boiling off: ' + err);
    AV_BOIL = false;
  }
  return AV_BOIL;
}

// matchesState has a BlockState and a FluidState overload; pick the BlockState one explicitly.
function avBoilMatches(j, st) {
  var m = j['matchesState(net.minecraft.world.level.block.state.BlockState)'];
  return m ? j['matchesState(net.minecraft.world.level.block.state.BlockState)'](st) : j.matchesState(st);
}

// LSO temperature of the block under pos (the highest matching entry), 0 when unknown.
function avBoilHeat(api, level, pos) {
  var st = level.getBlockState(pos.below());
  var list = api.data.getBlock(api.BI.BLOCK.getKey(st.getBlock()));
  if (!list) return 0;
  var best = 0;
  for (var i = 0; i < list.size(); i++) {
    var j = list.get(i);
    if (j.temperature > best && avBoilMatches(j, st)) best = j.temperature;
  }
  return best;
}

function avBoilSound(level, pos, sound) {
  level.getServer().runCommandSilent('playsound ' + sound + ' block @a ' + (pos.getX() + 0.5) + ' ' + (pos.getY() + 0.5) + ' ' + (pos.getZ() + 0.5));
}

// The whole click logic. Returns what was done ('drink', 'bottle', 'canteen') or '' when the click is left alone.
function avBoilClick(api, e) {
  var level = e.getLevel();
  if (level.isClientSide()) return '';
  var pos = e.getPos(), st = level.getBlockState(pos);
  if (String(api.BI.BLOCK.getKey(st.getBlock())) !== 'minecraft:water_cauldron') return '';
  if (String(st).indexOf('boiling=true') < 0 && avBoilHeat(api, level, pos) < AV_BOIL_MIN) return '';
  var p = e.getEntity(), hand = e.getHand(), stack = p.getItemInHand(hand);
  var done = '';
  if (stack.isEmpty()) {
    if (String(hand) !== 'MAIN_HAND' || api.attach.getThirstAttachment(p).isHydrationLevelAtMax()) return '';
    var sneak = p.isCrouching();
    // plain click: only where LSO itself would drink (the looked-at block within half the reach)
    if (!sneak && !api.thirst.getBlockThirstLookedAt(p, p.blockInteractionRange() / 2)) return '';
    api.thirst.takeDrink(p, AV_BOIL_DRINK[0], AV_BOIL_DRINK[1]);
    if (sneak) avBoilSound(level, pos, 'minecraft:entity.generic.drink');
    done = 'drink';
  } else if (String(api.BI.ITEM.getKey(stack.getItem())) === 'minecraft:glass_bottle') {
    p.setItemInHand(hand, api.ItemUtils.createFilledResult(stack, p, new api.ItemStack(api.purified)));
    api.Cauldron.lowerFillLevel(st, level, pos);
    avBoilSound(level, pos, 'minecraft:item.bottle.fill');
    done = 'bottle';
  } else if (stack.getItem() instanceof api.Canteen) {
    var item = stack.getItem();
    if (!item.canFill(stack, level)) return '';
    var clean = api.thirst.getCapacityTag(stack) === 0 || String(api.thirst.getHydrationEnumTag(stack)) === 'PURIFIED';
    item.fill(stack, level);
    if (clean) api.thirst.setHydrationEnumTag(stack, api.PURIFIED);
    api.Cauldron.lowerFillLevel(st, level, pos);
    avBoilSound(level, pos, 'minecraft:item.bottle.fill');
    done = 'canteen';
  } else {
    return '';
  }
  e.setCanceled(true);
  e.setCancellationResult(api.Result.SUCCESS);
  p.swing(hand, true);
  return done;
}

NativeEvents.onEvent(Java.loadClass('net.neoforged.bus.api.EventPriority').HIGHEST,
  Java.loadClass('net.neoforged.neoforge.event.entity.player.PlayerInteractEvent$RightClickBlock'), function (e) {
    var api = avBoilApi();
    if (!api) return;
    try {
      avBoilClick(api, e);
    } catch (err) {
      console.warn('[avgustov] boiling off after an error: ' + err);
      AV_BOIL = false;
    }
  });
