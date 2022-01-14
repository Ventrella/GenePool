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
//const POOL_COLOR                = "rgba( 60, 73, 80, 0.8 )";
const POOL_COLOR                = "rgba( 50, 63, 80, 1.0 )";

    const BOUNDARY_MARGIN_COLOR     = "rgb(  0,  0,  0 )";
    const EFFECT_COLOR 	            = "220, 240, 255";

//const POOL_BOUNDARY_MARGIN      = 300.0;
const POOL_BOUNDARY_MARGIN      = 1200.0;

    const TOUCH_RIPPLE_DURATION	    = 0.3;
    const MAX_TOUCH_RIPPLE_RADIUS   = 0.04;
    const NUM_EFFECT_BLOBS          = 20;
    const EFFECT_BLOB_COLOR         = "70, 80, 90";
    const EFFECT_BLOB_DURATION      = 8.0;
    const EFFECT_BLOB_PERIOD        = 20;
    const EFFECT_BLOB_ALPHA         = 0.5;

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
	let _currentEffectBlob = 0;
	let _effectClock = 0;
	let _effectBlob = new Array( NUM_EFFECT_BLOBS );
	
	//----------------------------------
	// do this now
	//----------------------------------
    _center.x = POOL_LEFT + POOL_WIDTH  * ONE_HALF;
    _center.y = POOL_TOP  + POOL_HEIGHT * ONE_HALF;
        
	//----------------------------------
	// initialize
	//----------------------------------
	this.initialize = function( t )
	{
    	_touch.time = t;
    	
    	for (let b=0; b<NUM_EFFECT_BLOBS; b++)
    	{
    	    _effectBlob[b] = new EffectBlob();
    	}

        //console.log( "pool initialize: " + _center.x + ", " + _center.y );            
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

	//---------------------------
	// get center
	//---------------------------
	this.getCenter = function()
	{
        //console.log( "getCenter: " + _center.x + ", " + _center.y );            
	
		return _center;
	}

	//------------------------------------------------
	// render
	//------------------------------------------------
	this.render = function( _seconds, viewport )
	{
		//------------------------------
		// show pool background
		//------------------------------
        let lineWidth = 0.005 + 0.001 * viewport.getScale(); 	

        canvas.fillStyle = POOL_COLOR;		
        canvas.fillRect( POOL_LEFT, POOL_TOP, POOL_WIDTH, POOL_HEIGHT );

        // use this instead of the above to include an image as the background...
        //canvas.clearRect( POOL_LEFT, POOL_TOP, POOL_WIDTH, POOL_HEIGHT );

		//------------------------------------------------------------
		// show touch
		//------------------------------------------------------------
		if ( ( _seconds - _touch.time ) < TOUCH_RIPPLE_DURATION )
		{
			let f = ( _seconds - _touch.time ) / TOUCH_RIPPLE_DURATION;

			if ( _touch.down )
			{
				_touch.radius = MAX_TOUCH_RIPPLE_RADIUS * ( ONE - f );
			}
			else
			{
				_touch.radius = MAX_TOUCH_RIPPLE_RADIUS * f;
			}

            let radius = _touch.radius * viewport.getScale();
            //assert( radius >= ZERO, "Pool.js: render: radius >= ZERO" );

            if ( radius > ZERO )
            {
                let alpha = ONE - _touch.radius / MAX_TOUCH_RIPPLE_RADIUS;
            
                canvas.lineWidth = lineWidth;
                canvas.strokeStyle = "rgba( " + EFFECT_COLOR + ", " + alpha + " )";	
                canvas.beginPath();
                canvas.arc( _touch.position.x, _touch.position.y, radius, 0, PI2, false );
                canvas.stroke();
                canvas.closePath();	
			}
		}

		//----------------
		// reset this!
		//----------------
		_touch.moving = false;
		
		//------------------------------------------
		// show watery effects
		//------------------------------------------
		//showWateryEffects( _seconds, viewport );
		
		//------------------
		// show boundary
		//------------------
		canvas.fillStyle = BOUNDARY_MARGIN_COLOR;	
		canvas.fillRect( POOL_LEFT,                         POOL_TOP - POOL_BOUNDARY_MARGIN,    POOL_WIDTH,             POOL_BOUNDARY_MARGIN    );
		canvas.fillRect( POOL_LEFT,                         POOL_BOTTOM,                        POOL_WIDTH,             POOL_BOUNDARY_MARGIN    );
		canvas.fillRect( POOL_LEFT - POOL_BOUNDARY_MARGIN,  POOL_TOP,                           POOL_BOUNDARY_MARGIN,   POOL_HEIGHT             );
		canvas.fillRect( POOL_RIGHT,                        POOL_TOP,                           POOL_BOUNDARY_MARGIN,   POOL_HEIGHT             );
	}
	


	//---------------------------------------------
    function showWateryEffects( seconds, viewport )
    {        
        let v = viewport.getScale() * 0.3;
        _effectClock ++;

        let viewCenterX = 4000;
        let viewCenterY = 4000;
    
        if ( _effectClock % EFFECT_BLOB_PERIOD === 0 )
        {
            _currentEffectBlob ++;
            if ( _currentEffectBlob >= NUM_EFFECT_BLOBS )
            {
                _currentEffectBlob = 0;
            }
            
            _effectBlob[ _currentEffectBlob ].startTime = seconds;
            _effectBlob[ _currentEffectBlob ].radius = v;
            
            //_effectBlob[ _currentEffectBlob ].xPosition = viewport.getPosition().x - v + v * 2 * gpRandom(); 
            //_effectBlob[ _currentEffectBlob ].yPosition = viewport.getPosition().y - v + v * 2 * gpRandom();    

            _effectBlob[ _currentEffectBlob ].xPosition = viewport.getPosition().x + v * Math.sin( _effectClock * 0.040 ); 
            _effectBlob[ _currentEffectBlob ].yPosition = viewport.getPosition().y + v * Math.sin( _effectClock * 0.080 ); 
        }

        canvas.lineWidth = 3;
        
    	for (let b=0; b<NUM_EFFECT_BLOBS; b++)
    	{
    	    let timePassed = seconds - _effectBlob[b].startTime;
    	    
    	    if ( timePassed < EFFECT_BLOB_DURATION )
    	    {    	
    	        let fraction = timePassed / EFFECT_BLOB_DURATION;
    	        let wave = ONE_HALF - ONE_HALF * Math.cos( fraction * PI2 );
    	        //let radius   = _effectBlob[b].radius * 0.3 + wave * _effectBlob[b].radius;
    	        let radius   = _effectBlob[b].radius * 0.3 + fraction * _effectBlob[b].radius;
    	        let alpha    = wave * EFFECT_BLOB_ALPHA;    	        
    	        
                canvas.strokeStyle = "rgba( " + EFFECT_BLOB_COLOR + ", " + alpha + " )";	
                canvas.fillStyle   = "rgba( " + EFFECT_BLOB_COLOR + ", " + alpha + " )";	
                canvas.beginPath();
//canvas.arc( _effectBlob[b].xPosition, _effectBlob[b].yPosition, radius, 0, PI2, false );
canvas.ellipse( _effectBlob[b].xPosition, _effectBlob[b].yPosition, radius, radius * 0.5, 0.0, 0, PI2, false );                
                
                //canvas.stroke();
                canvas.fill();
                canvas.closePath();	 
            }
    	}
    }
}





