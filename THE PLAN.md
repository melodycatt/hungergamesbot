# THE PLAN
### HOW IT LOOKS
1. every day/night, each tribute has their own 'block'
2. in these blocks,there will be status info about the tribute
3. as well as that, there will be the things they did that day/night, wit h details on what effects those events gave

### FUNCTIONALITY
 - tributes will have multiple events in one day
 - tributes will have 100 health
 - tributes will have 5 hunger (can be overstacked to 7)
    - hunger goes down by one each day/night
    - tribute must eat to regain hunger, otherwise they will slowly lose health (25 per round?) on 0 hunger
 - tributes will gain items as the round progresses, maybe with a weight or amount limit 
    - things like backpacks will extend this limit
 - thirst works similarly to hunger but tributes only have 3 thirst (overstacked to 5) and will have worse effects when too thirsty
##### POSSIBLE LOCATION SYSTEM
 - randomly generated map
 - tributes nearby each other will be much more likely to interact
 - tributes near water will always replenish some thirst that round (at the cost of 1 hunger if they are unable to start a fire)
 - tributes in more moist and elevated biomes are more likely to find water sources like creeks and rivers, which do not need to be boiled over a fire to be safe to drink
 - tributes in more average biomes will find more food
 - if youre in a desert you can move faster but other than that youre kinda fucked like not much food and no water
 - movement is 1sq/round in mountains, 1-2sq/round in foresty areas, 2-3sq/round in deserty areas
 - _possibly_ an algorithm to prioritise moving to areas with resources the tribute needs with better visibility ie better navigation in higher areas