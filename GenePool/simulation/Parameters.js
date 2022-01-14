//--------------------------------------------------------------------------
//                                                                        
//    This file is part of GenePool Swimbots.                             
//    Copyright (c) 2021 by Jeffrey Ventrella - All Rights Reserved.      
//                                                                        
//    See the README file or go to swimbots.com for full license details.           
//    You may use, distribute, and modify this code only under the terms  
//    of the "Commons Clause" license (commonsclause.com).                
//                                                                        
//    This software is intended for education, game design, and research. 
//                                                                        
// -------------------------------------------------------------------------- 


// Test 1 of the new two-gene type preference niche.
// Observations: 
// In the first run, all the swimbot races that survived the garden of eden are now all eating the same type of foodbit. Each time a food bit gets eaten it will regenerate to a random type foodbit. Whenever a new food bit spawns as the type that is not prefered by the pool, it basically gets locked away "forever." Thus, over time the pond loses prefered food bits more and more until all the food bits are just one type. This is my hunch, but let's see if this happens. Yes, I think this is a problem. One food type dominates the board when it isn't being eaten quickly enough.
// To keep food bits balanced, what about setting it so that when a yellow food bit is eaten, a yellow food bit is spawned, and same for blue food bits. Currently, if food bit mutation rate is set to zero, then the next food bit will spawn to the more abundant type.

// So far 3 out of 4 pools went extinct. The one pool that survived evolved to "one" apparent species by timestep 2.5mil, where one group ate one group of swimbots ate one type of food type (it's prefered) and did fine, while the other group ate a non-prefered food type (getting only 5 energy points from each food bit). But instead of dying out, this other group is such a good swimmer that it eats all the non-prefered food bits anyway!

// saved simulations: food_niche_1.txt (400 starting pop)
// increasing starting population to 800 and then 1000 to prevent instant extinction...
// Turns out that because of the new food genes, only half of all random swimbots will be able to eat healthfully (food preference matches digestable food type). And since there are two separate types, you divide that number into two since each gets access to only half the food.
// 1600 swimbots would provide 800 viable swimbots (400 for each type). I also increased food to 2000 foodbits--but this didn't work either!

// Going to try setting a larger starting radius so the swimbots and food are more spread out but then with a starting number of 1000 bots and 2000 food bits. Ok, this seems to have worked.. 
// Saved this one as: food_niche_2.txt. It reached almost 40k swimbots but it went extinct eventually. I think because of the food problem. food_niche_3 through 7 are also the same thing.

// Next I will run a series of tests after removing the food niche 2 gene thing by changing the food type offset to 1 (so the food type gene has no effect). All the previous ones had food type offset set to 0.1, meaning a swimbot gets only 10% of the energy from a food bit if it is not adapted to that food type. These new tests are called food_niche_reg_#.txt, beginign with number 1.

// moved back to GenePool.js
//const DEFAULT_MILLISECONDS_PER_UPDATE = 20; // original version
//const DEFAULT_MILLISECONDS_PER_UPDATE = 1;  // research version
  //luka: 1



//this is being slammed to 1 to debug the 2-food type issue...
//const FOOD_TYPE_OFFSET = 1.0;


const FOOD_TYPE_OFFSET = 0.2;

const DEFAULT_NUM_FOOD_TYPES = 1;


//----------------------------------------
//  LOD 
//----------------------------------------
const SWIMBOT_LEVEL_OF_DETAIL_DOT  = 0;
const SWIMBOT_LEVEL_OF_DETAIL_LOW  = 1;
const SWIMBOT_LEVEL_OF_DETAIL_HIGH = 2;

const DEFAULT_GARDEN_OF_EDEN_RADIUS = 2000;
const GARDEN_OF_EDEN_RADIUS = DEFAULT_GARDEN_OF_EDEN_RADIUS;  // original version
//const GARDEN_OF_EDEN_RADIUS = 3000;  // research version 

// I then changed food regeneration period to 15 (from 20) to make it come back even faster to help prevent extinctions (that have been occuring a lot)
// I ran two simulations, both survived: food_niche_3.txt and food_niche_4.txt
const MIN_FOOD_REGENERATION_PERIOD      = 1;
const DEFAULT_FOOD_REGENERATION_PERIOD  = 20;
//const DEFAULT_FOOD_REGENERATION_PERIOD  = 40;
const MAX_FOOD_REGENERATION_PERIOD      = 200;

//const DEFAULT_FOOD_REGENERATION_PERIOD  = 15;  // research version
//luka 15


const DEFAULT_CHILD_ENERGY_RATIO = ONE_HALF;

const MIN_CHILD_ENERGY_RATIO                = ZERO;
const MAX_CHILD_ENERGY_RATIO                = ONE;
const MIN_SWIMBOT_HUNGER_THRESHOLD          = ZERO;


const MAX_SWIMBOTS = 2000;

const INITIAL_NUM_SWIMBOTS =  500; // original version
//const INITIAL_NUM_SWIMBOTS = 1000; // research version
//luka 1000

const MAX_FOODBITS           = 2000;
const MAX_FOODBITS_PER_TYPE  = 1000; // make this one-half of MAX_FOODBITS (because there are two types)
const INITIAL_NUM_FOODBITS   = 1000; // original version
//const INITIAL_NUM_FOODBITS = 2000; // research version

const NON_REPRODUCING_JUNK_DNA_LIMIT    = 0.9; 
//0.9 appears to be a good threshold for species differences. Any less and it takes way too long
// for species to separate out and any more and the species appear the same to the user.

const SPAWN_FOOD_RANDOMLY_IN_POOL = false;

const MUTATION_RATE = 0.01;

//const CROSSOVER_RATE = 0.01;  // original version
const CROSSOVER_RATE = 0.2;     // I just decided to make this bigger (sept.3.2021) but I should check that it's ok.
//const CROSSOVER_RATE = 0.5;   // research version

//for the videos: luka set FOOD_BIT_SIZE = 1.5

const MAX_SWIMBOT_HUNGER_THRESHOLD      = 200;
const DEFAULT_SWIMBOT_HUNGER_THRESHOLD	=  50;

//const FOOD_TYPE_MUTATION_RATE = 0.99; // essentially 1: makes it so newborn foodbits can be either type


// FOOD_TYPE_OFFSET is the proportion of energy a swimbot gets from food if 
// it is not its prefered food source. So if swimbots usually get 50 energy points, 
// a swimbot that does not have the right digestion (gene values) for that type
// of food will only get 35 energy points if the FOOD_TYPE_OFFSET is set to 0.7

const YOUNG_AGE_DURATION    = 1000;
const OLD_AGE_DURATION      = 1000;
const MIN_MAXIMUM_AGE       = YOUNG_AGE_DURATION + OLD_AGE_DURATION;
const MAX_MAXIMUM_AGE       = 40000;

const DEFAULT_MAXIMUM_AGE   = MAX_MAXIMUM_AGE;

//const MAXIMUM_LIFESPAN   = 15000; // research version //luka

//const OLD_AGE = MAXIMUM_LIFESPAN - OLD_AGE_DURATION;

const SWIMBOT_SELECT_RADIUS_SCALAR  = 7.0;


const RENDER_SWIMBOT_AS_DOT     = false;
const SWIMBOT_DOT_RENDER_RADIUS = 20;

// Line 348 of Genotype.js I've modified to:
// let amplitude = Math.floor( gpRandom() * gpRandom() * gpRandom() * BYTE_SIZE );
// gpRandom() is cubed instead of squared. This makes the mutation amplitude lower
// so that mutations don't appear totally random.

// Also changed line 726 of the saveload.js file to:
// for (let n=0; n<familyTree.getNumNodes(); n += 5) 
// so that the family tree only saves every fifth swimbot instead of all of them.
// This "random" subset of swimbots is all it takes to get enough data for meaningful
// analyses and evolutionary trees without slowing down Gene Pool to a stand-still.


//---------------------------------------------------------------------------
// I'm trying something new here: these are global variables that are 
// meant to be adjustible via the ui (and maybe via other components).
//---------------------------------------------------------------------------
function GlobalTweakers()
{
    this.childEnergyRatio       = DEFAULT_CHILD_ENERGY_RATIO;
    this.maximumLifeSpan        = DEFAULT_MAXIMUM_AGE;
	this.foodSpread             = DEFAULT_FOOD_BIT_MAX_SPAWN_RADIUS;
	this.foodBitEnergy          = DEFAULT_FOOD_BIT_ENERGY;
	this.foodRegenerationPeriod = DEFAULT_FOOD_REGENERATION_PERIOD;
	this.hungerThreshold        = DEFAULT_SWIMBOT_HUNGER_THRESHOLD;
	this.numFoodTypes           = DEFAULT_NUM_FOOD_TYPES;
	this.attractionCriterion    = ATTRACTION_SIMILAR_COLOR;
}





