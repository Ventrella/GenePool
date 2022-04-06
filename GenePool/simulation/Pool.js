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

//-------------------------------------
// metrics
//-------------------------------------
const POOL_LEFT     = ZERO;
const POOL_RIGHT    = 8000.0;
const POOL_TOP      = ZERO;
const POOL_BOTTOM   = 8000.0;

const POOL_WIDTH  = ( POOL_RIGHT  - POOL_LEFT );
const POOL_HEIGHT = ( POOL_BOTTOM - POOL_TOP  );

const POOL_X_CENTER = POOL_LEFT + POOL_WIDTH    * ONE_HALF;
const POOL_Y_CENTER = POOL_TOP  + POOL_HEIGHT   * ONE_HALF;

//--------------------------------------------------
// pool
//--------------------------------------------------
function Pool()
{
	const POOL_COLOR              = new Color( 50/255, 63/255, 80/255, 1.0 );
    const BOUNDARY_MARGIN_COLOR   = new Color( 0,  0,  0, 1 );
    const EFFECT_COLOR 	          = new Color( 220/255, 240/255, 255/255, 1.0 );

	//const POOL_BOUNDARY_MARGIN      = 300.0;
	const POOL_BOUNDARY_MARGIN      = 1200.0;

	function Touch()
	{	
		this.down		= false;
		this.moving		= false;
		this.position	= new Vector2D();
		this.time 		= ZERO;
		this.radius		= ZERO;
	}

    function EffectBlob()
    {
        let startTime = ZERO;
        let xPosition = ZERO;    
        let yPosition = ZERO;    
        let radius    = ZERO;    
     }

	let _touch = new Touch();
	let _center = new Vector2D();
	
	//----------------------------------
	// do this now
	//----------------------------------
    _center.x = POOL_LEFT + POOL_WIDTH  * ONE_HALF;
    _center.y = POOL_TOP  + POOL_HEIGHT * ONE_HALF;

	//----------------------------------
	// getters
	//----------------------------------
	this.getTouch  = function() { return _touch; }
	this.getCenter = function() { return _center; }
	this.getColor  = function() { return POOL_COLOR; }
	this.getEffectColor = function() { return EFFECT_COLOR; }

	this.getBoundaries = function() { return [ POOL_LEFT, POOL_RIGHT, POOL_TOP, POOL_BOTTOM ] }
	this.getDimensions = function() { return [ POOL_WIDTH, POOL_HEIGHT ] }
	this.getBoundaryMarginColor = function() { return BOUNDARY_MARGIN_COLOR; }
	this.getBoundaryMargin = function() { return POOL_BOUNDARY_MARGIN; }

	//----------------------------------
	// initialize
	//----------------------------------
	this.initialize = function( t )
	{
    	_touch.time = t;
    }
    
	//----------------------------------------
	// start touch
	//----------------------------------------
	this.startTouch = function( position, time )
	{
		_touch.down 		= true;
		_touch.position.x	= position.x;
		_touch.position.y 	= position.y;
		_touch.time 		= time;
	}

	//--------------------------------------
	// move touch
	//--------------------------------------
	this.moveTouch = function( position, time )
	{
		if ( _touch.down ) 
		{
			_touch.position.x = position.x;
			_touch.position.y = position.y;
		}
	}

	//--------------------------------------
	// end touch
	//--------------------------------------
	this.endTouch = function( position, time )
	{
		_touch.down 		= false;
		_touch.position.x 	= position.x;
		_touch.position.y 	= position.y;
		_touch.time 		= time;
	}

	//------------------------------------------------
	// render
	//------------------------------------------------
	this.render = function( seconds, viewport )
	{
		globalRenderer.getPoolRenderer().render( this, seconds, viewport );

		//----------------
		// reset this!
		//----------------
		_touch.moving = false;
	}

}
