// AvgustovStory 1.1: hearts are earned by cooking and lost by dying (quest "Гурман" in the Kitchen chapter).
// dev.9: a player starts with 8 hearts; every different dish is remembered and the milestones below give +1 heart each.
// A Crystal Heart (Legendary Survival Overhaul item; 9 fragments, found in mineshaft, buried treasure, jungle temple and
// bastion chests) gives +1 heart on right click; LSO's own health system stays off, so the item is handled here.
// A death takes 1 heart, never below the starting 8; it comes back for as many different dishes (known ones count) as
// the last stage took (dev.11j), or with a Crystal Heart. Maximum 20 hearts.
// A dish = food that restores at least 4 hunger points (2 shanks), so raw meat and berries do not count.
// Model: hearts = 8 + milestones reached + delta. delta (Crystal Hearts minus deaths) is kept inside
// [-milestones, 12 - milestones], so a death at 8 hearts leaves no debt and hearts above 20 are not banked.
// Progress is kept in server persistent data by player UUID; one max-health modifier (hearts - 10) * 2 is re-applied
// on login, respawn and every change.
const AV_KITCHEN_MILESTONES = [5, 10, 20, 30, 45, 60, 80, 100, 125, 150, 180, 210];
const AV_KITCHEN_MIN_NUTRITION = 4;
const AV_HEARTS_START = 8, AV_HEARTS_MAX = 20;
const AV_VARIETY_LEN = 6, AV_VARIETY_HASTE = 4, AV_VARIETY_BORED = 8;
const AV_DataComponents = Java.loadClass('net.minecraft.core.component.DataComponents');
const AV_KH_CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag');

function avKitchenSub(server, name, id) {
  var root = server.persistentData;
  if (!root.contains(name)) root.put(name, new AV_KH_CompoundTag());
  var store = root.getCompound(name);
  if (!store.contains(id)) store.put(id, new AV_KH_CompoundTag());
  return store.getCompound(id);
}
function avKitchenPlayer(server, player) { return avKitchenSub(server, 'av_kitchen', String(player.uuid)); }
function avHeartState(server, player) { return avKitchenSub(server, 'av_hearts', String(player.uuid)); }
function avKitchenReached(count) {
  var h = 0;
  AV_KITCHEN_MILESTONES.forEach(function (m) { if (count >= m) h++; });
  return h;
}
// Returns the player's hearts after clamping delta into its allowed range.
function avHearts(server, player) {
  var m = avKitchenReached(avKitchenPlayer(server, player).getAllKeys().size());
  var st = avHeartState(server, player);
  var d = st.getInt('delta');
  var lo = -m, hi = AV_HEARTS_MAX - AV_HEARTS_START - m;
  if (d < lo) d = lo;
  if (d > hi) d = hi;
  st.putInt('delta', d);
  return AV_HEARTS_START + m + d;
}
function avHeartsApply(server, player) {
  var n = player.username;
  var h = avHearts(server, player);
  server.runCommandSilent('attribute ' + n + ' minecraft:generic.max_health modifier remove avgustov:kitchen_hearts');
  if (h !== 10) server.runCommandSilent('attribute ' + n + ' minecraft:generic.max_health modifier add avgustov:kitchen_hearts ' + ((h - 10) * 2) + ' add_value');
  server.runCommandSilent('scoreboard players set ' + n + ' av_hearts ' + h);
  return h;
}
function avHeartsTitle(server, n, title, color, sub) {
  server.runCommandSilent('title ' + n + ' times 10 60 20');
  server.runCommandSilent('title ' + n + ' subtitle ' + JSON.stringify({ text: sub, color: 'gray', italic: true }));
  server.runCommandSilent('title ' + n + ' title ' + JSON.stringify({ text: title, color: color, bold: true }));
}

// Variety: the last 6 dishes are remembered. 4 different -> Haste I for 10 min, all 6 different -> also Strength I;
// both are refreshed by every dish. The same dish 8 times in a row (and every time after) -> "Приелось": Hunger for
// 20 s, and that meal does not enter the list.
function avVariety(s, player, key) {
  var n = player.username;
  var st = avHeartState(s, player);
  var raw = String(st.getString('recent'));
  var list = raw ? raw.split(',') : [];
  var streak = String(st.getString('streak_item')) === key ? st.getInt('streak') + 1 : 1;
  st.putString('streak_item', key);
  st.putInt('streak', streak);
  if (streak >= AV_VARIETY_BORED) {
    s.runCommandSilent('effect give ' + n + ' minecraft:hunger 20 0');
    return { distinct: 0, bar: [{ text: 'Приелось: ', color: 'red' }, { text: streak + '-й раз подряд одно и то же — поешьте что-нибудь другое', color: 'gray' }] };
  }
  list.push(key);
  while (list.length > AV_VARIETY_LEN) list.shift();
  st.putString('recent', list.join(','));
  var seen = {}, d = 0;
  list.forEach(function (k) { if (!seen[k]) { seen[k] = true; d++; } });
  if (d >= AV_VARIETY_HASTE) s.runCommandSilent('effect give ' + n + ' minecraft:haste 600 0 true');
  if (d >= AV_VARIETY_LEN) s.runCommandSilent('effect give ' + n + ' minecraft:strength 600 0 true');
  var what = d >= AV_VARIETY_LEN ? ' · Спешка и Сила' : d >= AV_VARIETY_HASTE ? ' · Спешка · все 6 разных — ещё Сила' : ' · с 4 разных — Спешка';
  return { distinct: d, bar: [{ text: 'Разнообразие ' + d + '/' + AV_VARIETY_LEN, color: d >= AV_VARIETY_HASTE ? 'green' : 'gray' }, { text: what, color: 'gray' }] };
}

// dev.11j (user, 2026-11-18): a heart lost on death becomes a debt. It comes back for as many DIFFERENT dishes as the
// last kitchen stage took (5, 5, 10, 10, 15, 15, 20, 20, 25, 25, 30, 30), and dishes already tried count too, so food
// variety never runs out. New milestones and Crystal Hearts still give their own +1 on top of that.
// State in av_hearts/<uuid>: debt (hearts to win back), rec_need (dishes for the current one), rec (dishes eaten so far).
function avStageSize(count) {
  var m = avKitchenReached(count);
  if (m <= 0) return AV_KITCHEN_MILESTONES[0];
  return AV_KITCHEN_MILESTONES[m - 1] - (m >= 2 ? AV_KITCHEN_MILESTONES[m - 2] : 0);
}
function avDebtInit(server, player) {
  var st = avHeartState(server, player);
  if (!st.contains('debt_v')) {
    // saves from before the debt: every unrecovered death is in a negative delta, so give those hearts a way back
    st.putInt('debt_v', 1);
    var d0 = -st.getInt('delta');
    if (d0 > 0 && st.getInt('debt') < d0) st.putInt('debt', d0);
  }
  if (st.getInt('debt') > 0 && st.getInt('rec_need') <= 0) {
    st.putInt('rec_need', avStageSize(avKitchenPlayer(server, player).getAllKeys().size()));
    st.put('rec', new AV_KH_CompoundTag());
  }
  return st;
}
// Counts a dish towards the debt. null = no debt, else { have, need, back } (back = a heart came back just now).
function avRecover(server, player, key) {
  var st = avDebtInit(server, player);
  if (st.getInt('debt') <= 0) return null;
  if (avHearts(server, player) >= AV_HEARTS_MAX) { st.putInt('debt', 0); st.putInt('rec_need', 0); st.remove('rec'); return null; }
  if (!st.contains('rec')) st.put('rec', new AV_KH_CompoundTag());
  var rec = st.getCompound('rec');
  if (key) rec.putBoolean(key, true);
  var have = rec.getAllKeys().size(), need = st.getInt('rec_need');
  if (have < need) return { have: have, need: need, back: false };
  st.putInt('debt', st.getInt('debt') - 1);
  st.putInt('delta', st.getInt('delta') + 1);
  st.put('rec', new AV_KH_CompoundTag());
  st.putInt('rec_need', st.getInt('debt') > 0 ? avStageSize(avKitchenPlayer(server, player).getAllKeys().size()) : 0);
  return { have: have, need: need, back: true };
}
function avDebtText(st) {
  var debt = st.getInt('debt'); if (debt <= 0) return '';
  var have = st.contains('rec') ? st.getCompound('rec').getAllKeys().size() : 0;
  return 'возврат сердца ' + have + '/' + st.getInt('rec_need') + ' разных блюд' + (debt > 1 ? ' (ещё сердец к возврату: ' + debt + ')' : '');
}

ItemEvents.foodEaten(function (e) {
  var player = e.player || (e.entity && e.entity.isPlayer() ? e.entity : null);
  if (!player || !e.server) return;
  var item = e.item;
  var food = null;
  try { food = item.get(AV_DataComponents.FOOD); } catch (x) {}
  if (!food || food.nutrition() < AV_KITCHEN_MIN_NUTRITION) return;
  var s = e.server;
  var n = player.username;
  var key = String(item.id);
  var v = avVariety(s, player, key);
  var bar = v.bar;
  var tasted = avKitchenPlayer(s, player);
  if (!tasted.contains(key)) {
    var before = avHearts(s, player);
    tasted.putBoolean(key, true);
    var count = tasted.getAllKeys().size();
    var next = null;
    for (var i = 0; i < AV_KITCHEN_MILESTONES.length; i++) if (AV_KITCHEN_MILESTONES[i] > count) { next = AV_KITCHEN_MILESTONES[i]; break; }
    bar = [{ text: 'Новое блюдо: ', color: 'gold' }, { translate: String(item.descriptionId), color: 'yellow' },
      { text: ' · попробовано ' + count + (next ? ' · до сердца ещё ' + (next - count) : '') + ' · разнообразие ' + v.distinct + '/' + AV_VARIETY_LEN, color: 'gray' }];
    s.runCommandSilent('scoreboard players set ' + n + ' av_dishes ' + count);
    if (AV_KITCHEN_MILESTONES.indexOf(count) >= 0) {
      var after = avHeartsApply(s, player);
      if (after > before) {
        avHeartsTitle(s, n, '+1 сердце', 'red', 'Попробовано ' + count + ' разных блюд · сердец: ' + after);
        s.runCommandSilent('execute as ' + n + ' at @s run playsound minecraft:entity.player.levelup master @s ~ ~ ~ 0.8 1.2');
        s.runCommandSilent('tellraw @a ' + JSON.stringify([{ text: n, color: 'yellow' }, { text: ': ' + count + ' разных блюд — +1 сердце (' + after + ').', color: 'gold' }]));
      } else {
        s.runCommandSilent('tellraw ' + n + ' ' + JSON.stringify({ text: count + ' разных блюд — но сердец уже ' + AV_HEARTS_MAX + ', это максимум.', color: 'gray' }));
      }
    }
  }
  var r = avRecover(s, player, key);
  if (r && r.back) {
    var h2 = avHeartsApply(s, player);
    avHeartsTitle(s, n, '+1 сердце', 'red', 'Сердце вернулось: ' + r.need + ' разных блюд · сердец: ' + h2);
    s.runCommandSilent('execute as ' + n + ' at @s run playsound minecraft:entity.player.levelup master @s ~ ~ ~ 0.8 1.2');
  } else if (r) {
    bar = bar.concat([{ text: ' · возврат сердца ' + r.have + '/' + r.need, color: 'light_purple' }]);
  }
  s.runCommandSilent('title ' + n + ' actionbar ' + JSON.stringify(bar));
});


// Crystal Heart: +1 heart up to the maximum.
ItemEvents.rightClicked('legendarysurvivaloverhaul:heart_container', function (e) {
  var player = e.player, s = e.server;
  if (!player || !s) return;
  var n = player.username;
  var before = avHearts(s, player);
  if (before >= AV_HEARTS_MAX) {
    s.runCommandSilent('title ' + n + ' actionbar ' + JSON.stringify({ text: 'Сердец уже ' + AV_HEARTS_MAX + ' — это максимум', color: 'gray' }));
    e.cancel();
    return;
  }
  var st = avHeartState(s, player);
  st.putInt('delta', st.getInt('delta') + 1);
  var after = avHeartsApply(s, player);
  if (!player.isCreative()) e.item.shrink(1);
  player.heal(2);
  avHeartsTitle(s, n, '+1 сердце', 'light_purple', 'Кристальное сердце · сердец: ' + after);
  s.runCommandSilent('execute as ' + n + ' at @s run playsound minecraft:block.amethyst_block.resonate master @s ~ ~ ~ 1 1');
  e.cancel();
});

// Death: -1 heart, never below the start; the lost heart becomes a debt (see avRecover).
EntityEvents.death(function (e) {
  var ent = e.entity;
  if (!ent.isPlayer() || !e.server) return;
  var s = e.server;
  var before = avHearts(s, ent);
  if (before <= AV_HEARTS_START) return;
  var st = avDebtInit(s, ent);
  st.putInt('delta', st.getInt('delta') - 1);
  st.putInt('debt', st.getInt('debt') + 1);
  if (st.getInt('rec_need') <= 0) {
    st.putInt('rec_need', avStageSize(avKitchenPlayer(s, ent).getAllKeys().size()));
    st.put('rec', new AV_KH_CompoundTag());
  }
  st.putBoolean('lost_msg', true);
});

PlayerEvents.loggedIn(function (e) { avDebtInit(e.server, e.player); avHeartsApply(e.server, e.player); });
PlayerEvents.respawned(function (e) {
  var s = e.server, p = e.player;
  var h = avHeartsApply(s, p);
  var fromEnd = false;
  try { fromEnd = e.isEndConquered(); } catch (x) {}
  if (!fromEnd) p.setHealth(h * 2);
  var st = avDebtInit(s, p);
  if (st.getBoolean('lost_msg')) {
    st.remove('lost_msg');
    avHeartsTitle(s, p.username, '−1 сердце', 'dark_red', 'Сердец: ' + h + ' · вернуть: ' + st.getInt('rec_need') + ' разных блюд (знакомые тоже) или Кристальное сердце');
  }
});

// /сердца for the player's own progress (also /hearts).
ServerEvents.commandRegistry(function (e) {
  var Commands = e.commands;
  var run = function (ctx) {
    var p = ctx.source.player;
    if (!p) return 0;
    var s = ctx.source.server;
    var count = avKitchenPlayer(s, p).getAllKeys().size();
    var h = avHearts(s, p);
    var next = null;
    for (var i = 0; i < AV_KITCHEN_MILESTONES.length; i++) if (AV_KITCHEN_MILESTONES[i] > count) { next = AV_KITCHEN_MILESTONES[i]; break; }
    var debt = avDebtText(avDebtInit(s, p));
    p.tell(Text.of('Сердец: ' + h + ' из ' + AV_HEARTS_MAX + ' · разных блюд: ' + count + (next ? ' · следующее сердце на ' + next : '') + (debt ? ' · ' + debt : '')).gold());
    return 1;
  };
  e.register(Commands.literal('hearts').executes(run));
  e.register(Commands.literal('сердца').executes(run));
});
