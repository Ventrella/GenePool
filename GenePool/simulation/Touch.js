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

//------------------------------
// touch states
//------------------------------
const TouchState = 
{
    NULL      : -1,
    BEEN_UP   :  0,
    JUST_DOWN :  1,
    BEEN_DOWN :  2,
    JUST_UP   :  3
};


//----------------------------
function Touch()
{
    let _state = TouchState.BEEN_UP;
    let _x = ZERO;
    let _y = ZERO;
    let _previousX = ZERO;
    let _previousY = ZERO;
    
    //------------------------------
    // update
    //------------------------------
	this.update = function() 
	{ 
    	_previousX = _x;
    	_previousY = _y;

	    if ( _state === TouchState.JUST_DOWN )
	    {
	        _state = TouchState.BEEN_DOWN;
	    }
	    else if ( _state === TouchState.JUST_UP )
	    {
	        _state = TouchState.BEEN_UP;
	    }    	
	}
    
    //-------------------------------------
    // set to down
    //-------------------------------------
	this.setToDown = function( x, y ) 
	{ 
	    _x = x; 
	    _y = y; 
	    _state = TouchState.JUST_DOWN;
    }    
    
    //-------------------------------------
    // set to up
    //-------------------------------------
	this.setToUp = function( x, y ) 
	{ 
	    _x = x; 
	    _y = y; 
	    _state = TouchState.JUST_UP;
    }    

    //-------------------------------------
    // set to move
    //-------------------------------------
	this.setToMove = function( x, y  ) 
	{ 
	    _x = x; 
	    _y = y; 
	}    
	
    //------------------------------
    // render (optinal debug)
    //------------------------------
	this.render = function() 
	{ 
		let lineWidth = 4;
        let color = new Color(1,1,1,1);
        if ( _state === TouchState.BEEN_UP   ) { color.set(  0, 0, 0, 1 ); }	// black
        if ( _state === TouchState.JUST_DOWN ) { color.set(  1, 1, 1, 1 ); }	// white
        if ( _state === TouchState.BEEN_DOWN ) { color.set(  0, 1, 0, 1 ); }	// green
        if ( _state === TouchState.JUST_UP   ) { color.set(  1, 0, 0, 1 ); }	// red
        globalRenderer.renderCircle( {x:_x, y:_y}, 10.0, color, lineWidth, 0, true );
	}    
	
    //-----------------------------------------------
    // get methods
    //-----------------------------------------------
	this.getState      = function() { return _state; }    
	this.getVelocityX  = function() { return _x - _previousX; }    
	this.getVelocityY  = function() { return _y - _previousY; }    
}
