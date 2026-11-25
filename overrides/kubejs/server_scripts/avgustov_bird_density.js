// AvgustovStory 1.3.0 (25.11.2026, user: «спавнится слишком много птиц» — a problem since earlier versions).
// Fowl Play birds come from their own mob categories and from world generation, and pile up along explored rivers.
// Besides the lower caps and flock sizes in config/fowlplay.json5: a natural / chunk-generation spawn of a Fowl Play
// bird is refused when AVB_LIMIT birds are already within AVB_RADIUS blocks. checkSpawn runs before the mob enters the
// world, so saved birds and spawn eggs are never touched (cancelling EntityEvents.spawned for entities loaded from disk
// left ghost entities in the lookup in the boottest, so that is not used).
var AVB_LIMIT = 8, AVB_RADIUS = 48;
EntityEvents.checkSpawn(function (e) {
  var ent = e.entity;
  if (String(ent.type).indexOf('fowlplay:') !== 0) return;
  var n = 0;
  try {
    var box = Java.loadClass('net.minecraft.world.phys.AABB').ofSize(ent.position(), AVB_RADIUS * 2, AVB_RADIUS * 2, AVB_RADIUS * 2);
    ent.level.getEntities(ent, box).forEach(function (o) { if (String(o.type).indexOf('fowlplay:') === 0) n++; });
  } catch (err) { console.warn('[birds] ' + err); return; }
  // e.cancel() works by throwing KubeJS's EventExit: keep it outside the try
  if (n >= AVB_LIMIT) e.cancel();
});
