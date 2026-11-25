// AvgustovStory 1.3.0 (25.11.2026): guard against the Sable "teleport into the plot area" bug.
// What happened here on 23.11 (VERSIONS.md, server log): after ships were assembled and taken apart near a player
// (Grapple <-> Sable in the log), Amatearasu was moved to -20 480 884 / -20 478 920 — the service area where Sable keeps
// ship blocks — fell into the void, and the server froze generating terrain out there. Upstream: Sable 2.0.5-2.0.6
// (ours, latest) do not convert some teleports/ray hits from ship space to world space (ryanhcode/sable#1640, #1667),
// no fix released yet. The workaround from #1640: no player has any business beyond 1 000 000 blocks from the centre, so
// if one appears there, put them back on their last safe spot (on the ground, normal coordinates) at once — before the
// fall and before the chunk generation that hangs the server. Checked every 5 ticks and at login/respawn.
// The rescued player gets a line in chat, the server log gets a [sable-guard] warning, and the fun advancement
// avgustov:fun/one_way_ticket (avgustov_fun.js) marks the trip.
var AVSG_LIMIT = 1000000;

function avsgFar(p) { return Math.abs(p.x) > AVSG_LIMIT || Math.abs(p.z) > AVSG_LIMIT; }

function avsgRescue(p, why) {
  var s = p.server, pd = p.persistentData, n = p.username;
  var from = Math.round(p.x) + ' ' + Math.round(p.y) + ' ' + Math.round(p.z) + ' in ' + String(p.level.dimension);
  var dim, x, y, z;
  if (pd.contains('avsg_dim')) {
    dim = pd.getString('avsg_dim'); x = pd.getDouble('avsg_x'); y = pd.getDouble('avsg_y'); z = pd.getDouble('avsg_z');
  } else {
    var sp = s.overworld().getSharedSpawnPos();
    dim = 'minecraft:overworld'; x = sp.x + 0.5; y = sp.y + 1; z = sp.z + 0.5;
  }
  p.fallDistance = 0;
  p.setDeltaMovement(0, 0, 0);
  s.runCommandSilent('execute in ' + dim + ' run tp ' + n + ' ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2));
  p.fallDistance = 0;
  console.warn('[sable-guard] ' + n + ' found at ' + from + ' (' + why + '), returned to ' + dim + ' ' + Math.round(x) + ' ' + Math.round(y) + ' ' + Math.round(z));
  s.runCommandSilent('tellraw ' + n + ' ' + JSON.stringify([
    { text: 'Летописец поймал тебя за шиворот у самого края мира ', color: 'gold' },
    { text: '(корабли иногда «забывают», где у них верх, а где Земля)', color: 'gray', italic: true },
    { text: '. Ты снова дома.', color: 'gold' }]));
  s.runCommandSilent('advancement grant ' + n + ' only avgustov:fun/one_way_ticket');
}

PlayerEvents.tick(function (e) {
  var p = e.player;
  if (p.tickCount % 5 !== 0 || p.isSpectator()) return;
  if (avsgFar(p)) { avsgRescue(p, 'tick'); return; }
  // remember a safe spot about every 2 s: standing on the ground, not riding, not in the void
  if (p.tickCount % 40 === 0 && p.onGround() && !p.isPassenger() && p.y > p.level.getMinBuildHeight() + 2) {
    var pd = p.persistentData;
    pd.putString('avsg_dim', String(p.level.dimension));
    pd.putDouble('avsg_x', p.x); pd.putDouble('avsg_y', p.y); pd.putDouble('avsg_z', p.z);
  }
});

PlayerEvents.loggedIn(function (e) { if (avsgFar(e.player)) avsgRescue(e.player, 'login'); });
PlayerEvents.respawned(function (e) { if (avsgFar(e.player)) avsgRescue(e.player, 'respawn'); });
