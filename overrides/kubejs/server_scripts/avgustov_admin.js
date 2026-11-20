// AvgustovStory 1.1-dev.11e/11i: player health repair.
// 2026-11-18: the user's player file had Health, AbsorptionAmount and foodExhaustionLevel = NaN, plus every LSO limb
// damage = NaN (left over from the Hardcore Revival knockout bug). Vanilla subtracts damage from absorption first, so a
// NaN absorption turns every hit into NaN damage: health and all limbs become NaN again (all wound debuffs at once, and
// the player cannot die because NaN is never <= 0). Healing health alone did not help; absorption must be reset too.
// - /avheal <player> (op level 2): resets absorption, exhaustion and saturation if broken, every limb (set 0, then heal;
//   NaN + x stays NaN), health to max, clears effects.
// - Guard: every 5 s and on login, any player with non-finite health/absorption/exhaustion/saturation is repaired the
//   same way and the server log gets a "[avgustov] NaN repaired" line, so a new source can be traced.
const AVA_PARTS = ['HEAD', 'CHEST', 'RIGHT_ARM', 'LEFT_ARM', 'RIGHT_LEG', 'LEFT_LEG', 'RIGHT_FOOT', 'LEFT_FOOT'];
const avBad = function (x) { return !(x >= 0) || x === Infinity; };

const avRepair = function (p, full) {
  var s = p.server, n = p.username, fixed = [];
  if (avBad(p.getAbsorptionAmount())) { p.setAbsorptionAmount(0); fixed.push('absorption'); }
  var fd = p.getFoodData();
  if (avBad(fd.getExhaustionLevel())) { fd.setExhaustion(0); fixed.push('exhaustion'); }
  if (avBad(fd.getSaturationLevel())) { fd.setSaturation(0); fixed.push('saturation'); }
  var healthBroken = avBad(p.getHealth());
  if (healthBroken) fixed.push('health');
  if (full || healthBroken) {
    AVA_PARTS.forEach(function (part) {
      s.runCommandSilent('bodydamage ' + n + ' set ' + part + ' 0');
      s.runCommandSilent('bodydamage ' + n + ' heal ' + part + ' 1000');
    });
    p.setHealth(p.getMaxHealth());
    s.runCommandSilent('effect clear ' + n);
  }
  if (fixed.length) console.warn('[avgustov] NaN repaired for ' + n + ': ' + fixed.join(', '));
  return fixed;
};

ServerEvents.commandRegistry(function (e) {
  var Commands = e.commands, Arguments = e.arguments;
  var run = function (ctx) {
    var p = Arguments.PLAYER.getResult(ctx, 'target');
    var fixed = avRepair(p, true);
    p.tell(Text.of('Здоровье и раны восстановлены' + (fixed.length ? ' (исправлено: ' + fixed.join(', ') + ')' : '')).green());
    return 1;
  };
  e.register(Commands.literal('avheal').requires(function (src) { return src.hasPermission(2); })
    .then(Commands.argument('target', Arguments.PLAYER.create(e)).executes(run)));
});

var avGuardTicks = 0;
ServerEvents.tick(function (e) {
  if (++avGuardTicks < 100) return;
  avGuardTicks = 0;
  e.server.players.forEach(function (p) {
    var fixed = avRepair(p, false);
    if (fixed.length) p.tell(Text.of('Сломанное здоровье исправлено автоматически: ' + fixed.join(', ')).yellow());
  });
});

PlayerEvents.loggedIn(function (e) { avRepair(e.player, false); });
