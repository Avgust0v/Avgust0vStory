// AvgustovStory: mobs that Fresh Animations breaks.
// Earth Mobs draws these with vanilla models (cow, pig, wolf, slime, rabbit, snow golem, chicken).
// Fresh Animations swaps those models for its own, so their textures land in the wrong places.
// Their natural spawn rates are 0 in earthmobsmod-common.toml; this script also stops the other ways in:
// a zombie killing a pig or rabbit, spawn eggs, a player-built melon golem, and mobs already saved in old chunks.
// Earth Mobs mobs with their own models (fancy chicken, horned sheep, teacup pig, rabbits, zombies, etc.) are untouched.
const AVG_FA_BLOCKED = [
  'albino_cow', 'ashen_cow', 'cookie_cow', 'cream_cow', 'dairy_cow', 'pinto_cow', 'sunset_cow', 'wooly_cow', 'umbra_cow',
  'moobloom', 'moolip', 'tropical_slime', 'skeleton_wolf', 'wither_skeleton_wolf',
  'zombified_pig', 'zombified_rabbit', 'melon_golem', 'duck'
]

AVG_FA_BLOCKED.forEach(name => {
  EntityEvents.spawned('earthmobsmod:' + name, event => event.cancel())
})
