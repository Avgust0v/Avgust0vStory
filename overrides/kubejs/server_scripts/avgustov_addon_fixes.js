// AvgustovStory 1.3.0 (25.11.2026): data fixes for addons added in 1.3.0.
// Create: Tracks 1.0.1 writes its ids as "Tracks:..." (capital namespace) in its tags and loot tables, so Minecraft
// rejects them: the blocks were not mineable with the right tool and dropped nothing. The loot tables are replaced in
// kubejs/data/tracks/loot_table/blocks; the tags are added here (the mod's broken tag files still log an error).
var AVA_TRACKS = ['tracks:track_mount', 'tracks:suspension_track', 'tracks:track_drive_wheel'];
ServerEvents.tags('block', function (e) {
  e.add('minecraft:mineable/axe', 'tracks:track_mount');
  e.add('minecraft:mineable/pickaxe', AVA_TRACKS);
  e.add('create:safe_nbt', AVA_TRACKS);
});
