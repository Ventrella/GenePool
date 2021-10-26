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

"use strict";

//-------------------------------------------
//  time-related constants
//-------------------------------------------
const TIMER_DELTA_INCREASE_RATE = 0.02;
const STARVING_TIMER_DELTA = 0.05;

//----------------------------------------
//  part indices
//----------------------------------------
const NULL_PART       = -1;
const ROOT_PART       =  0;
const MOUTH_INDEX	  =  0;
const GENITAL_INDEX   =  1;
const MIN_PARTS 	  =  2;
const MAX_PARTS 	  = 16;

//-------------------------------------------
//  max swimbot population size
//-------------------------------------------
//const MAX_SWIMBOTS = 2000;  // this has been moved to ExperimentParameters.js

//------------------------------------------
// attraction
//------------------------------------------
const ATTRACTION_NULL               = -1;
const ATTRACTION_COLORFUL           =  0;
const ATTRACTION_BIG                =  1;
const ATTRACTION_HYPER              =  2;
const ATTRACTION_LONG               =  3;
const ATTRACTION_STRAIGHT           =  4;
const ATTRACTION_NO_COLOR           =  5;
const ATTRACTION_SMALL              =  6;
const ATTRACTION_STILL              =  7;
const ATTRACTION_SHORT              =  8;
const ATTRACTION_CROOKED            =  9;
const ATTRACTION_SIMILAR_COLOR      = 10;
const ATTRACTION_SIMILAR_SIZE       = 11;
const ATTRACTION_SIMILAR_HYPER      = 12;
const ATTRACTION_SIMILAR_LENGTH     = 13;
const ATTRACTION_SIMILAR_STRAIGHT   = 14;
const ATTRACTION_CLOSEST            = 15;
const ATTRACTION_RANDOM             = 16;
const NUM_ATTRACTIONS               = 17;




//-----------------------------------
//  metrics 
//-----------------------------------
const SWIMBOT_MIN_MOUTH_WIDTH   = 4.0;
const SWIMBOT_MIN_MOUTH_LENGTH  = 8.0;
const SWIMBOT_MOUTH_LENGTH      = 10.0;
const SWIMBOT_GENITAL_LENGTH    = 10.0;
const SWIMBOT_MOUTH_WIDTH       = 1.0;
const SWIMBOT_GENITAL_WIDTH     = 1.0;
const SWIMBOT_VIEW_RADIUS	    = 300.0;
const SWIMBOT_EGG_RADIUS	    = 6.0;

//const SELECT_RADIUS_SCALAR      = 7.0;

//const SWIMBOT_NUTRITION_ENERGY  = 10.0;



// this has been moved to ExperimentParameters.js
/*
//----------------------------------------
//  LOD 
//----------------------------------------
const SWIMBOT_LEVEL_OF_DETAIL_DOT  = 0;
const SWIMBOT_LEVEL_OF_DETAIL_LOW  = 1;
const SWIMBOT_LEVEL_OF_DETAIL_HIGH = 2;
*/

//--------------------
//  physics constants
//--------------------
//original
//static const double SPIN_FORCE = 0.4;
//static const double SPIN_DECAY = 0.95;

//const SPIN_SCALAR     = 0.01;
//const SPIN_DECAY      = 0.95;

//before May 5:
//const SPIN_SCALAR     = 5.0;
//const SPIN_DECAY      = 0.9;

//const SPIN_SCALAR     = 2.0;
//const SPIN_SCALAR     = 1.0;
//const SPIN_DECAY      = 0.95;

const WALL_BOUNCE = 0.1;


//---------------------------------------------------
//  graphics 
//---------------------------------------------------
// this has been moved to ExperimentParameters.js
//const SIZE_VIEW_SCALE = 0.03; //increase with view scale (a kind of LOD)


//---------------------------------------------------
//  energy 
//---------------------------------------------------
const ENERGY_USED_UP_SWIMMING				= 0.01;
const STARVING								= 4.0;
const CONTINUAL_ENERGY_DRAIN				= 0.0001;


// ranges from 0 to 1 with 0 being not picky at all and 1 being totally 'nothing else'
//const SWIMBOT_NUTRITION_PICKINESS = 0.7;

//const MAX_SWIMBOT_HUNGER_THRESHOLD          = 100;
//const MAX_SWIMBOT_HUNGER_THRESHOLD          = 200;// this has been moved to ExperimentParameters.js

//const DEFAULT_SWIMBOT_HUNGER_THRESHOLD		= 50;// this has been moved to ExperimentParameters.js
//const DEFAULT_SWIMBOT_ATTRACTION            = ATTRACTION_SIMILAR_COLOR;

const ENERGY_EFFICIENCY_MEASUREMENT_PERIOD  = 200;

//--------------------
//  Part 
//--------------------
function Part()
{	
	this.category			= 0;
	this.position			= new Vector2D();   //dynamic
	this.velocity			= new Vector2D();   //dynamic
	this.axis 		        = new Vector2D();   //dynamic
	this.previousMid 		= new Vector2D();   //dynamic
	this.midPosition 		= new Vector2D();   //dynamic
	this.perpendicular		= new Vector2D();   //dynamic
	this.bendingAngle		= ZERO;             //dynamic
	this.currentAngle		= ZERO;             //dynamic
	this.parent 			= NULL_PART;
	this.child              = NULL_PART; // only valid if it is the continuation of a single-category section
	this.mass				= ZERO;
	this.length				= ZERO;
	this.width				= ZERO;
    this.angle		        = ZERO;
	this.frequency			= ZERO;
	this.phase				= ZERO;
	this.amp			    = ZERO;
	this.turnAmp		    = ZERO;
	this.turnPhase	        = ZERO;
	this.momentFactor		= ZERO;
	this.red				= ZERO;
	this.green				= ZERO;
	this.blue				= ZERO;
    this.endCapSpline       = ZERO;     // how pointy the splined end-cap is for parts that terminate body sequence
	this.branch             = false;    // set to true if this part branches off (not a continuation of a category)
    this.splined		    = false;
	this.numDecendents		= 0;
	this.decendent			= new Array( MAX_PARTS );

	for (let p=0; p<MAX_PARTS; p++)
	{
		this.decendent[p] = 0; 
	}
}

//--------------------
//  Phenotype 
//--------------------
function Phenotype()
{	
	this.numParts           = 0;
	this.frequency          = ZERO;
	this.parts              = new Array( MAX_PARTS ); 
	this.sumPartLengths     = ZERO;
	this.mass               = ZERO;
	this.preferredFoodType  = 0;
	this.digestibleFoodType = 0;
	
	for (let p=0; p<MAX_PARTS; p++)
	{
		this.parts[p] = new Part(); 
	}
}


