# AvgustovStory fix: Pool and Billiards v1.3.7 sets version 1240 (1.21.4+) on 1.21.1, so the bot called this
# function, whose item_model component does not exist on 1.21.1. Same as equip_1210 (custom_model_data).
item replace entity @s armor.head with minecraft:bow[minecraft:custom_model_data=1]
