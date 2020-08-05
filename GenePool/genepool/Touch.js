"use strict";

//------------------------------
// touch states
//------------------------------
const TOUCH_BEEN_UP   = 0;
const TOUCH_JUST_DOWN = 1;
const TOUCH_BEEN_DOWN = 2;
const TOUCH_JUST_UP   = 3;

//----------------------------
function Touch()
{
    let _state = TOUCH_BEEN_UP;
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

	    if ( _state === TOUCH_JUST_DOWN )
	    {
	        _state = TOUCH_BEEN_DOWN;
	    }
	    else if ( _state === TOUCH_JUST_UP )
	    {
	        _state = TOUCH_BEEN_UP;
	    }    	
	}
    
    //-------------------------------------
    // set to down
    //-------------------------------------
	this.setToDown = function( x, y ) 
	{ 
	    _x = x; 
	    _y = y; 
	    _state = TOUCH_JUST_DOWN;
    }    
    
    //-------------------------------------
    // set to up
    //-------------------------------------
	this.setToUp = function( x, y ) 
	{ 
	    _x = x; 
	    _y = y; 
	    _state = TOUCH_JUST_UP;
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
		if ( _state === TOUCH_BEEN_UP   ) { canvas.fillStyle = "rgb(   0,   0,   0 )"; }
		if ( _state === TOUCH_JUST_DOWN ) { canvas.fillStyle = "rgb( 244, 244, 244 )"; }
		if ( _state === TOUCH_BEEN_DOWN ) { canvas.fillStyle = "rgb(   0, 244,   0 )"; }
		if ( _state === TOUCH_JUST_UP   ) { canvas.fillStyle = "rgb( 244,   0,   0 )"; }
		
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
