"use strict";


function Camera()
{
	const FRICTION   			=  8.0;
	const BUTTON_FORCE          =  0.3;
	const DRAG_FORCE            =  0.1;
	const MAX_TRACKING_FORCE    =  0.02;
	const TRACKING_FORCE_DELTA  =  0.005;
	const DECAY_DURATION 		=  40;
    const PAN_OVERSHOOT_PUSH 	=  0.7;
    const SCALE_OVERSHOOT_PUSH	=  0.7;
    const MINIMUM_SCALE 		=  500.0;

    function CameraShift()
    {
        this.active         = false;
        this.startTime      = ZERO;
        this.duration       = ZERO;
        this.startPosition  = new Vector2D();
        this.endPosition    = new Vector2D();
        this.startScale     = ZERO;
        this.endScale       = ZERO;
    }

    function CameraTracking()
    {
        this.active   = false;
        this.force    = ZERO;
        this.position = new Vector2D();
    }
    
	//----------------------
	// members
	//----------------------
	let _position  		    = new Vector2D();
	let _velocity  		    = new Vector2D();
	let _shift              = new CameraShift();
	let _tracking           = new CameraTracking();
	let _scaleDelta 	    = ZERO;
	let _scale      	    = ONE;
    let _aspectRatio        = ONE;
	let _left	    	    = ZERO;
	let _right	    	    = ZERO;
	let _top	    	    = ZERO;
	let _bottom	    	    = ZERO;
	let _force	    	    = ZERO;
	let _seconds		    = ZERO;
	let _secondsDelta	    = ZERO;
	let _decayClock		    = 0;
	
	
	//--------------------------------
	this.update = function( seconds )
	{	
	    if ( _shift.active )
	    {
	        //console.log( "_shift.active" );
	        updateShift();
	    }
	    else
	    {
	        if ( _tracking.active )
	        {
	            //console.log( "_tracking.active" );
	            updateTracking();
	        }
	        else
	        {        
                if ( _decayClock < DECAY_DURATION )
                {
                    //----------------------
                    // update decay clock
                    //----------------------
                    _decayClock ++;

                    //-----------------------------------
                    // determine force
                    //-----------------------------------
                    _force = _scale * BUTTON_FORCE * _secondsDelta;

                    //-------------------------------------------
                    // friction
                    //-------------------------------------------
                    let f = ONE - FRICTION  * _secondsDelta;

                    if ( f < ZERO )
                    {
                        _velocity.clear();
                        _scaleDelta = ZERO;				
                    }
                    else if ( f < ONE )
                    {
                        _velocity.scale(f);
                        _scaleDelta *= (f);
                    }

                    //-------------------------------------------
                    // finish decay
                    //-------------------------------------------
                    if ( _decayClock == DECAY_DURATION )
                    {
                        _force = ZERO;
                        _velocity.clear();
                        _scaleDelta = ZERO;
                    }

                    //-----------------------------------
                    // update position and scale
                    //-----------------------------------
                    _position.add( _velocity );
                    _scale += _scaleDelta;

                    //-----------------------------------
                    // calculate frame
                    //-----------------------------------
                    calculateFrame();

                    //-----------------------------------
                    // apply constraints
                    //-----------------------------------
                    applyConstraints();
                }
            }
		}

		//-----------------------------------
		// update seconds
		//-----------------------------------
		_secondsDelta = seconds - _seconds;
		_seconds = seconds;
	}



	//------------------------------------------------------------
	this.startTracking = function( position, scale, duration )
	{	
	    //console.log( "startTracking" );
	    
        _shift.active       = true;
	    _shift.startTime    = _seconds;
	    _shift.duration     = duration;
        _shift.startScale   = _scale;     //current scale
        _shift.endScale     = scale;      //new scale
	    
        _shift.startPosition.copyFrom( _position );
        _shift.endPosition.copyFrom  (  position );
	}


	//--------------------------------
	this.stopTracking = function()
	{	
	    //console.log( "STOP Tracking" );

		_tracking.active    = false;
	    _shift.active       = false;
		_tracking.force     = ZERO;
	    _scaleDelta         = ZERO;
	    _velocity.clear()
	}
	
	//-----------------------------------------------
	this.setTrackingPosition = function( position )
	{   
	    console.log( "setTrackingPosition" );
	    _tracking.position.copyFrom( position );
	}

	//-------------------------------------------
	this.setTrackingScale = function( scale )
	{   
	    _scale = scale;
	}
	
	//----------------------------
    function updateTracking()
    {    
        //console.log( "updateTracking" );    
    
        if ( _tracking.force < MAX_TRACKING_FORCE )
        {
            _tracking.force += TRACKING_FORCE_DELTA;

            if ( _tracking.force > MAX_TRACKING_FORCE )
            {
                _tracking.force = MAX_TRACKING_FORCE;
            }
        }
        
        //console.log( _tracking.force );    
        
        let x = ( _tracking.position.x - _position.x ) * _tracking.force;
        let y = ( _tracking.position.y - _position.y ) * _tracking.force;
             
        _position.addXY( x, y );
        
        //-------------------
        // calculate frame
        //-------------------
        calculateFrame();

        //-----------------------------------
        // apply constraints
        //-----------------------------------
        applyConstraints();
	}
	
	//------------------------------------
	this.getIsTracking = function()
	{   
	    return _tracking.active;
	}


	//-----------------------
    function updateShift()
    {
        let timePassed = _seconds - _shift.startTime;
        
        if ( timePassed > _shift.duration )
        {
            timePassed = _shift.duration;
            _position.copyFrom( _shift.endPosition );
            _scale = _shift.endScale;
            
            //-------------------------------------
            // stop shifting and start tracking
            //-------------------------------------
            _shift.active = false;
            _tracking.active = true;
  		    _tracking.force = ZERO;
		    _tracking.position.copyFrom( _position );
        }

        let fraction = timePassed / _shift.duration;
        
        fraction = ONE_HALF - ONE_HALF * Math.cos( fraction * Math.PI );
         
        _position.x = _shift.startPosition.x + fraction * ( _shift.endPosition.x - _shift.startPosition.x );
        _position.y = _shift.startPosition.y + fraction * ( _shift.endPosition.y - _shift.startPosition.y );
        _scale      = _shift.startScale      + fraction * ( _shift.endScale      - _shift.startScale      );

        //---------------------
        // important
        //---------------------
        calculateFrame();
        
        //---------------------
        // apply constraints
        //---------------------
        applyConstraints();        
    }

	//--------------------------------------
	this.setAspectRatio = function(a)
	{	
        //console.log( "setAspectRatio" );
	
	    _aspectRatio = a;

        //---------------------
        // important
        //---------------------
        calculateFrame();
        
        //---------------------
        // apply constraints
        //---------------------
        applyConstraints();        
	}

	//-------------------------
	function calculateFrame()
	{	
        _right  = _position.x + _scale * ONE_HALF * _aspectRatio;
        _left   = _position.x - _scale * ONE_HALF * _aspectRatio;

		_top    = _position.y + _scale * ONE_HALF;
		_bottom	= _position.y - _scale * ONE_HALF;
	}


	//--------------------------
	function applyConstraints()
	{	
        let scaleOvershoot = _scale - ( POOL_RIGHT - POOL_LEFT );
        if ( scaleOvershoot > ZERO )
        {
            _scale -= scaleOvershoot * SCALE_OVERSHOOT_PUSH;
        }

        let scaleUndershoot = _scale - MINIMUM_SCALE;
        if ( scaleUndershoot < ZERO )
        {
            _scale -= scaleUndershoot * SCALE_OVERSHOOT_PUSH;
        }

        let rightOverShoot  = _right  - POOL_RIGHT;
        let leftOverShoot   = _left   + POOL_LEFT;
        let topOverShoot    = _top    - POOL_BOTTOM;
        let bottomOverShoot = _bottom + POOL_TOP;

        if ( rightOverShoot > ZERO  )
        {
            _position.x -= rightOverShoot * PAN_OVERSHOOT_PUSH; 
            calculateFrame();
        }
        if ( leftOverShoot < ZERO  )
        {
            _position.x -= leftOverShoot * PAN_OVERSHOOT_PUSH; 
            calculateFrame();
        }

        if ( topOverShoot > ZERO  )
        {
            _position.y -= topOverShoot * PAN_OVERSHOOT_PUSH; 
            calculateFrame();
        }
        if ( bottomOverShoot < ZERO  )
        {
            _position.y -= bottomOverShoot * PAN_OVERSHOOT_PUSH; 
            calculateFrame();
        }
	}

	//-----------------------------------------------------------------------
	// controls
	//-----------------------------------------------------------------------
	this.panLeft    = function() { _decayClock = 0; _velocity.x -= _force; }
	this.panRight   = function() { _decayClock = 0; _velocity.x += _force; }
	this.panDown    = function() { _decayClock = 0; _velocity.y += _force; }
	this.panUp      = function() { _decayClock = 0; _velocity.y -= _force; }
	this.zoomIn     = function() { _decayClock = 0; _scaleDelta -= _force; }
	this.zoomOut    = function() { _decayClock = 0; _scaleDelta += _force; }

	//----------------------------
	this.drag = function( x, y )
	{	
		_decayClock = 0;
		_velocity.x -= x * _force * DRAG_FORCE;
		_velocity.y -= y * _force * DRAG_FORCE;
		
		//---------------------------------------------------------------
		// as the scale approaches the whole pool, the drag gets 
		// more dampened, until it is fully dampened at the limit.
		//---------------------------------------------------------------
		let limit = POOL_WIDTH * 0.4;

		if ( _scale > limit )
		{
		    if ( _scale > POOL_WIDTH )
		    {
		        _scale = POOL_WIDTH;
		    }

		    let dampening = ONE - ( ( _scale - limit ) / ( POOL_WIDTH - limit ) );
		    		    
		    //console.log( dampening );
		    _velocity.x *= dampening;
		    _velocity.y *= dampening;
		}
		
		if ( _tracking.active )
		{
    		this.stopTracking();
	    }
    }
    
	//--------------------------------------
	this.setPosition = function( position )
	{	
		_position.copyFrom( position );
		_velocity.clear();

	    this.stopTracking();

        //---------------------
        // important
        //---------------------
        calculateFrame();
	}

	//---------------------------------
	this.setScale = function( scale )
	{	
		_scale = scale;
		_scaleDelta = ZERO;

        //---------------------
        // important
        //---------------------
        calculateFrame();
	}
	
	//-------------------------------------
	this.setScaleToMax = function()
	{	
		_scale = POOL_RIGHT - POOL_LEFT;
	    _scaleDelta = ZERO;
        _position.setXY( POOL_LEFT + _scale * ONE_HALF, POOL_TOP + _scale * ONE_HALF );
	    _velocity.clear()

        //---------------------
        // important
        //---------------------
        calculateFrame();
	}

	//---------------------------
	this.getPosition = function()
	{	
		return _position;
	}	

	//---------------------------
	this.getScale = function()
	{	
        return _scale;
	}
	
	//---------------------------
	this.getXDimension = function()
	{	
        return _scale * _aspectRatio;
	}
	
	//---------------------------
	this.getYDimension = function()
	{	
		return _scale;
	}

	//------------------------------------------------
	this.getWithinView = function( position, buffer )
	{
		if (( position.x < _right  + buffer )
		&&  ( position.x > _left   - buffer )
		&&  ( position.y < _top    + buffer )
		&&  ( position.y > _bottom - buffer ))
		{
			return true;
		}

		return false;
	}
	
}
