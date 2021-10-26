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

//----------------------------------------
// states
//----------------------------------------
const BRAIN_STATE_NULL                = -1;
const BRAIN_STATE_RESTING             =  0;
const BRAIN_STATE_LOOKING_FOR_MATE    =  1;
const BRAIN_STATE_PURSUING_MATE       =  2;
const BRAIN_STATE_LOOKING_FOR_FOOD    =  3;
const BRAIN_STATE_PURSUING_FOOD       =  4;
const BRAIN_STATE_LOOKING_FOR_PREY    =  5;
const BRAIN_STATE_PURSUING_PREY       =  6;
const BRAIN_STATE_FLEEING_PREDATOR    =  7;
const NUM_BRAIN_STATES                =  8;

//--------------------------------------------
// perceiving
//--------------------------------------------
const BRAIN_SENSORY_UPDATE_PERIOD           = 50;
const BRAIN_MAX_PERCEIVED_NEARBY_SWIMBOTS   = 20;

//const BRAIN_FOCUS_TARGET_SHIFT_STRENGTH	    = 0.2;
const BRAIN_FOCUS_TARGET_SHIFT_STRENGTH	    = 0.1;
const BRAIN_FOCUS_TARGET_SHIFT_THRESHOLD    = 0.07;
const BRAIN_WANDER_AMOUNT					= 0.2;
//const BRAIN_WALL_BOUNCE_SHIFT_AMOUNT	    = 0.1;


//----------------------------------------
// Brain!
//----------------------------------------
function Brain()
{
	let _state                  = BRAIN_STATE_NULL;
	let _energy                 = ZERO;
	let _foundFoodBit           = false;
	let _foundSwimbot           = false;
	let _hungerThreshold        = ZERO;
	let _attractionCriterion    = ATTRACTION_SIMILAR_COLOR;
	
	
    //-----------------------------
    this.initialize = function()
    {
	    _state = BRAIN_STATE_NULL;
	    
	    /*
	    _energy                 = ZERO;
	    _foundFoodBit           = false;
	    _foundSwimbot           = false;
	    _hungerThreshold        = ZERO;
	    _attractionCriterion    = ATTRACTION_SIMILAR_COLOR;
	    */
    }

    //-----------------------
    this.update = function()
    {   
        //----------------------------------------------------------------------
        // if low energy, look for food, otherwise, look for sex
        //----------------------------------------------------------------------
        if ( _energy < _hungerThreshold )
        {
            if (( _state != BRAIN_STATE_PURSUING_FOOD )
            &&  ( _state != BRAIN_STATE_LOOKING_FOR_FOOD ))
            {
                _state = BRAIN_STATE_LOOKING_FOR_FOOD;
            }       
        }
        else 
        {
            if (( _state != BRAIN_STATE_PURSUING_MATE )
            &&  ( _state != BRAIN_STATE_LOOKING_FOR_MATE ))
            {
                _state = BRAIN_STATE_LOOKING_FOR_MATE;
            }        
        }
    
        //--------------------------------------------------------
        //  looking for food
        //--------------------------------------------------------
        if ( _state == BRAIN_STATE_LOOKING_FOR_FOOD )
        {
            if ( _foundFoodBit )
            {
                _state = BRAIN_STATE_PURSUING_FOOD;
            }
        }	      
        //--------------------------------------------------------
        //  pursuing food
        //--------------------------------------------------------
        else if ( _state == BRAIN_STATE_PURSUING_FOOD )
        {
            if ( !_foundFoodBit )
            {
                _state = BRAIN_STATE_LOOKING_FOR_FOOD;
            }
        }
        //--------------------------------------------------------
        //  Looking for mate
        //--------------------------------------------------------
        else if ( _state == BRAIN_STATE_LOOKING_FOR_MATE )
        {
            if ( _foundSwimbot )
            {
                _state = BRAIN_STATE_PURSUING_MATE;
            }
        }
        //--------------------------------------------------------
        //  pursuing mate
        //--------------------------------------------------------
        else if ( _state == BRAIN_STATE_PURSUING_MATE )
        {
            if ( !_foundSwimbot )
            {
                _state = BRAIN_STATE_LOOKING_FOR_MATE;
            }
        }

        //-----------------------------------------------------------------
        //  check for bogus brain state 
        //-----------------------------------------------------------------
        assert( _state < NUM_BRAIN_STATES, "_state < NUM_BRAIN_STATES" );        
        assert( _state > BRAIN_STATE_NULL, "_state > BRAIN_STATE_NULL" );
    }

    //-------------------------------------------------------------------
    // setters
    //-------------------------------------------------------------------
    this.setEnergyLevel     = function(e) { _energy              = e; }   
    this.setHungerThreshold = function(h) { _hungerThreshold     = h; }		
    this.setFoundFoodBit    = function(f) { _foundFoodBit        = f; }
    this.setFoundSwimbot    = function(f) { _foundSwimbot        = f; }		

    //--------------------------------
    this.setAttraction = function(a) 
    {
        //console.log( "setAttraction to " + a );
        
        _attractionCriterion = a; 

        // setting _foundSwimbot to false, causes the swimbot to search for a new potential mate
        _foundSwimbot = false;
    }


    //--------------------------------------------------------------------------
    // getters
    //--------------------------------------------------------------------------
    this.getHungerThreshold     = function() { return _hungerThreshold;     }	
    this.getAttractionCriterion = function() { return _attractionCriterion; }	
    this.getState               = function() { return _state;               }
}
