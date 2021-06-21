
// Test 1 of the new two-gene color preference niche.
// Observations: 
// In the first run, all the swimbot races that survived the garden of eden are now all eating the same color foodbit. Each time a food bit gets eaten it will regenerate to a random color foodbit. Whenever a new food bit spawns as the color that is not prefered by the pool, it basically gets locked away "forever." Thus, over time the pond loses prefered food bits more and more until all the food bits are just one color. This is my hunch, but let's see if this happens. Yes, I think this is a problem. One food color dominates the board when it isn't being eaten quickly enough.
// To keep food bits balanced, what about setting it so that when a yellow food bit is eaten, a yellow food bit is spawned, and same for blue food bits. Currently, if food bit mutation rate is set to zero, then the next food bit will spawn to the more abundant color.

// So far 3 out of 4 pools went extinct. The one pool that survived evolved to "one" apparent species by timestep 2.5mil, where one group ate one group of swimbots ate one type of food color (it's prefered) and did fine, while the other group ate a non-prefered food color (getting only 5 energy points from each food bit). But instead of dying out, this other group is such a good swimmer that it eats all the non-prefered food bits anyway!

// saved simulations: food_niche_1.txt (400 starting pop)
// increasing starting population to 800 and then 1000 to prevent instant extinction...
// Turns out that because of the new food genes, only half of all random swimbots will be able to eat healthfully (preference matches nutrition). And since there are two separate colors, you divide that number into two since each gets access to only half the food.
// 1600 swimbots would provide 800 viable swimbots (400 for each color). I also increased food to 2000 foodbits--but this didn't work either!

// Going to try setting a larger starting radius so the swimbots and food are more spread out but then with a starting number of 1000 bots and 2000 food bits. Ok, this seems to have worked.. 
// Saved this one as: food_niche_2.txt. It reached almost 40k swimbots but it went extinct eventually. I think because of the food problem. food_niche_3 through 7 are also the same thing.

// Next I will run a series of tests after removing the food niche 2 gene thing by changing the nutrition offset to 1 (so the nutrition gene has no effect). All the previous ones had nutrition offset set to 0.1, meaning a swimbot gets only 10% of the energy from a food bit if it is not adapted to that food color. These new tests are called food_niche_reg_#.txt, beginign with number 1.


//const GARDEN_OF_EDEN_RADIUS = 2000;  // original version
  const GARDEN_OF_EDEN_RADIUS = 3000;  // research version 

// I then changed food regeneration period to 15 (from 20) to make it come back even faster to help prevent extinctions (that have been occuring a lot)
// I ran two simulations, both survived: food_niche_3.txt and food_niche_4.txt
const DEFAULT_FOOD_REGENERATION_PERIOD  = 15;

  const INITIAL_NUM_SWIMBOTS =  500; // original version
//const INITIAL_NUM_SWIMBOTS = 1000; // research version

//const INITIAL_NUM_FOODBITS = 1000; // original version
  const INITIAL_NUM_FOODBITS = 2000; // research version

const NON_REPRODUCING_JUNK_DNA_LIMIT    = 0.9; 
//0.9 appears to be a good threshold for species differences. Any less and it takes way too long
// for species to separate out and any more and the species appear the same to the user.

const SPAWN_FOOD_RANDOMLY_IN_POOL       = false;

const MUTATION_RATE	                    = 0.01;

//this increases genetic diversity
  const CROSSOVER_RATE = 0.01; // original version
//const CROSSOVER_RATE = 0.5;  // research version

const FOOD_NUTRITION_MUTATION_RATE      = 0.99;

const NUTRITION_OFFSET                  = 1;
// NUTRITION_OFFSET is how much energy a swimbot gets from food if 
// it is not its prefered food source. So if swimbots usually get 50 energy points, 
// a swimbot that does not have the right digestion (gene values) for that color
// of food will only get 35 energy points if the NUTRITION_OFFSET is set to 0.7

//const MAXIMUM_LIFESPAN   = 40000; // original version
  const MAXIMUM_LIFESPAN   = 15000; // research version

const OLD_AGE          = MAXIMUM_LIFESPAN - 1000;

// Line 348 of Genotype.js I've modified to:
// let amplitude = Math.floor( Math.random() * Math.random() * Math.random() * BYTE_SIZE );
// Math.random() is cubed instead of squared. This makes the mutation amplitude lower
// so that mutations don't appear totally random.

// Also changed line 726 of the saveload.js file to:
// for (let n=0; n<familyTree.getNumNodes(); n += 5) 
// so that the family tree only saves every fifth swimbot instead of all of them.
// This "random" subset of swimbots is all it takes to get enough data for meaningful
// analyses and evolutionary trees without slowing down Gene Pool to a stand-still.

