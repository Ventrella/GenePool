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

//--------------------------------------------------
// poolRenderer
//--------------------------------------------------

function PoolRenderer()
{
    const TOUCH_RIPPLE_DURATION	    = 0.3;
    const MAX_TOUCH_RIPPLE_RADIUS   = 0.04;
    const NUM_EFFECT_BLOBS          = 20;
    const EFFECT_BLOB_DURATION      = 8.0;
    const EFFECT_BLOB_PERIOD        = 20;
    const EFFECT_BLOB_ALPHA         = 0.5;

    function EffectBlob()
    {
        let startTime = ZERO;
        let xPosition = ZERO;    
        let yPosition = ZERO;    
        let radius    = ZERO;    
     }

	let _canvas = null;

    let _currentEffectBlob = 0;
    let _effectClock = 0;
    let _effectBlob = new Array( NUM_EFFECT_BLOBS );
    let _effectBlobColor = new Color( 70/255, 80/255, 90/255, 1 );

	this._screenClearEnable = true;
	
	//----------------------------------
	// initialize - one time setup
	//----------------------------------
	this.initialize = function( canvas )
	{
		_canvas = canvas;
    	for (let b=0; b<NUM_EFFECT_BLOBS; b++)
    	{
    	    _effectBlob[b] = new EffectBlob();
    	}
    }

	this.setScreenClearEnable = function( state )
	{
		this._screenClearEnable = state;
	}

	//------------------------------------------------
	// render
	//------------------------------------------------
	this.render = function( pool, seconds, viewport )
	{
		//------------------------------
		// show pool background
		//------------------------------
		let bounds = pool.getBoundaries();     // left, right, top, bottom
		let size   = pool.getDimensions();     // width, height
		let margin = pool.getBoundaryMargin();
		let color  = pool.getColor();

        let lineWidth = 0.005 + 0.001 * viewport.getScale(); 	

		// clear the 2d canvas while still allowing the 3d glCamvas underneath to show
		if ( this._screenClearEnable == true ) {
			_canvas.clearRect( bounds[0], bounds[2], size[0], size[1] );
		}

		//------------------------------------------------------------
		// show touch
		//------------------------------------------------------------
		let touch = pool.getTouch();
		if ( ( seconds - touch.time ) < TOUCH_RIPPLE_DURATION )
		{
			let f = ( seconds - touch.time ) / TOUCH_RIPPLE_DURATION;

			if ( touch.down )
			{
				touch.radius = MAX_TOUCH_RIPPLE_RADIUS * ( ONE - f );
			}
			else
			{
				touch.radius = MAX_TOUCH_RIPPLE_RADIUS * f;
			}

            let radius = touch.radius * viewport.getScale();
            //assert( radius >= ZERO, "PoolRenderer.js: render: radius >= ZERO" );

            if ( radius > ZERO )
            {
                let alpha = ONE - touch.radius / MAX_TOUCH_RIPPLE_RADIUS;
				let effectColor = pool.getEffectColor();
				effectColor.opacity = alpha;

                _canvas.lineWidth = lineWidth;
                _canvas.strokeStyle = effectColor.rgba();	
                _canvas.beginPath();
                _canvas.arc( touch.position.x, touch.position.y, radius, 0, PI2, false );
                _canvas.stroke();
                _canvas.closePath();	
			}
		}
		
		//------------------------------------------
		// show watery effects
		//------------------------------------------
		//showWateryEffects( seconds, viewport );
		
		//------------------
		// show boundary
		//------------------
		_canvas.fillStyle = pool.getBoundaryMarginColor().rgba();
		_canvas.fillRect( bounds[0],           bounds[2] - margin,  size[0],  margin   );
		_canvas.fillRect( bounds[0],           bounds[3],           size[0],  margin   );
		_canvas.fillRect( bounds[0] - margin,  bounds[2],           margin,   size[1]  );
		_canvas.fillRect( bounds[1],           bounds[2],           margin,   size[1]  );
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

        _canvas.lineWidth = 3;
        
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
    	        
				_effectBlobColor.opacity = alpha;
                _canvas.strokeStyle = _effectBlobColor.rgba();	
                _canvas.fillStyle   = _effectBlobColor.rgba();	

                _canvas.beginPath();
//_canvas.arc( _effectBlob[b].xPosition, _effectBlob[b].yPosition, radius, 0, PI2, false );
_canvas.ellipse( _effectBlob[b].xPosition, _effectBlob[b].yPosition, radius, radius * 0.5, 0.0, 0, PI2, false );                
                
                //_canvas.stroke();
                _canvas.fill();
                _canvas.closePath();	 
            }
    	}
    }



	//-----------------------------------------------------------------------
	// render obsticles
	//-----------------------------------------------------------------------
	this.renderObsticle = function( endPoint1, endPoint2, radius, color, camera )
	{
        //--------------------------------------------
        // show main shaft
        //--------------------------------------------
        _canvas.strokeStyle = color.rgba();	    
        _canvas.lineWidth = radius;
        _canvas.beginPath();
        _canvas.moveTo( endPoint1.position.x, endPoint1.position.y );
        _canvas.lineTo( endPoint2.position.x, endPoint2.position.y );
        _canvas.closePath();
        _canvas.stroke();

        /*
        //--------------------------------------------
        // show perpendicular
        //--------------------------------------------
        _canvas.strokeStyle = "rgb( 255, 255, 100 )";	    
        _canvas.lineWidth = 2;
        _canvas.beginPath();
        _canvas.moveTo( _mid.x,  _mid.y  );
        _canvas.lineTo( _mid.x + _perp.x * 100, _mid.y + _perp.y * 100 );
        _canvas.closePath();
        _canvas.stroke();
        
        //--------------------------------------------
        // show mid point
        //--------------------------------------------
        _canvas.fillStyle = "rgb( 0, 0, 0 )";	    
        _canvas.beginPath();
        _canvas.arc( _mid.x, _mid.y, 5, 0, PI2, false );
        _canvas.fill();
        _canvas.closePath();	
        */
        
        //-----------------------
        // show ends
        //-----------------------
        renderObsticleEndpoint( endPoint1, camera.getScale() );
        renderObsticleEndpoint( endPoint2, camera.getScale() );
    }


	function renderObsticleEndpoint( endPoint, scale )
	{
        let radius   = endPoint.getEndRadius();
        let position = endPoint.getPosition();
        let hovered  = endPoint.getHovered();

        _canvas.fillStyle = endPoint.getColor().rgba();	    
        _canvas.beginPath();
        _canvas.arc( position.x, position.y, radius, 0, PI2, false );
        _canvas.fill();
        _canvas.closePath();	

        _canvas.lineWidth = 0.003 * scale; 	

        _canvas.strokeStyle = "rgba( 0, 0, 0, 0.4 )";
        _canvas.beginPath();
        _canvas.arc( position.x, position.y, radius, 0, PI2, false );
        _canvas.stroke();
        _canvas.closePath();	

        if ( hovered )
        {
			let hoverRadius = endPoint.getHoverRadius();
            _canvas.strokeStyle = "rgba(255, 255, 255, 0.4 )";
            _canvas.beginPath();
            _canvas.arc( position.x, position.y, hoverRadius, 0, PI2, false );
            _canvas.stroke();
            _canvas.closePath();	
        }
    }
}

