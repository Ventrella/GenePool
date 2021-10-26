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
    // render
    //------------------------------
	this.render = function() 
	{ 
		if ( _state === TouchState.BEEN_UP   ) { canvas.fillStyle = "rgb(   0,   0,   0 )"; }
		if ( _state === TouchState.JUST_DOWN ) { canvas.fillStyle = "rgb( 244, 244, 244 )"; }
		if ( _state === TouchState.BEEN_DOWN ) { canvas.fillStyle = "rgb(   0, 244,   0 )"; }
		if ( _state === TouchState.JUST_UP   ) { canvas.fillStyle = "rgb( 244,   0,   0 )"; }
		
		canvas.beginPath();
        canvas.arc( _x, _y, 10.0, 0, PI2, false );
		canvas.fill();
		canvas.closePath();
	}    
	
    //-----------------------------------------------
    // get methods
    //-----------------------------------------------
	this.getState      = function() { return _state; }    
	this.getVelocityX  = function() { return _x - _previousX; }    
	this.getVelocityY  = function() { return _y - _previousY; }    
}
