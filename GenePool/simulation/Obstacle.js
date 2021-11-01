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


//------------------------
// Obstacle
//------------------------
function Obstacle()
{
    const END_RADIUS = 20;
    const END_HOVER_RADIUS = 30;
    const END_MOVE_RADIUS  = 25;

    //----------------------------
    function ObstacleEndpoint()
    {
        this.position   = new Vector2D();
        this.hovered    = false;
        this.moved      = false;
        this.color      = "rgb( 100, 100, 100 )"
        
        //----------------------------
        this.setColor = function(c)
        {
            this.color = c;
        }
        
        //----------------------------
        this.setPosition = function(p)
        {
            this.position.x = p.x;
            this.position.y = p.y;
        }
        
        //----------------------------
        this.detectHover = function(p)
        {
            let x1 = p.x - this.position.x;
            let y1 = p.y - this.position.y;

            let d1 = x1 * x1 + y1 * y1;
        
            this.hovered = false;
            if ( d1 < END_HOVER_RADIUS * END_HOVER_RADIUS )
            {
                this.hovered = true; 
                return true;
            }

            return false;
        }
        
        //----------------------------
        this.render = function( camera )
        {
            canvas.fillStyle = this.color;	    
    
            canvas.beginPath();
            canvas.arc( this.position.x, this.position.y, END_RADIUS, 0, PI2, false );
            canvas.fill();
            canvas.closePath();	

            canvas.lineWidth = 0.003 * camera.getScale(); 	

            canvas.strokeStyle = "rgba( 0, 0, 0, 0.4 )";
            canvas.beginPath();
            canvas.arc( this.position.x, this.position.y, END_RADIUS, 0, PI2, false );
            canvas.stroke();
            canvas.closePath();	

            if ( this.hovered )
            {
                let r = END_HOVER_RADIUS;
                if ( this.moved )
                {
                    r = END_MOVE_RADIUS;
                }
            
                canvas.strokeStyle = "rgba(255, 255, 255, 0.4 )";
                canvas.beginPath();
                canvas.arc( this.position.x, this.position.y, r, 0, PI2, false );
                canvas.stroke();
                canvas.closePath();	
            }

        }
    } // end of obstacle endpoint
    
//const COLLISION_FORCE = 10;
//const COLLISION_FORCE = 1;

    //------------------------------------------
    // local variables
    //------------------------------------------
    let _end1           = new ObstacleEndpoint(); 
    let _end2           = new ObstacleEndpoint(); 
    let _mid            = new Vector2D();
    let _axis           = new Vector2D();
    let _direction      = new Vector2D();
    let _perp           = new Vector2D();
    let _testVector     = new Vector2D();
    let _collisionForce = new Vector2D();
    let _length         = ZERO;

    
    // set colors....
    _end1.setColor( "rgb( 200, 150, 100 )" );
    _end2.setColor( "rgb( 100, 150, 200 )" );

    //-------------------------------------------------
    // set the endpoints of the obstacle
    //------------------------------------------------
	this.setEndpointPositions = function( e1, e2 )
	{
	    _end1.setPosition( e1 );
	    _end2.setPosition( e2 );
	    
        //-----------------------------------
        // whenever an endpoint is moved...
        //-----------------------------------
        calculateStuff();
    }

    //------------------------------------------
    // start moving
    //------------------------------------------
	this.startMoving = function( movePosition )
	{
	    if ( _end1.hovered )
	    {
	        _end1.moved = true;
	        _end1.setPosition( movePosition );
	    }
	    else if ( _end2.hovered )
	    {
	        _end2.moved = true;
	        _end2.setPosition( movePosition );
	    }	 

        //-----------------------------------
        // whenever an endpoint is moved...
        //-----------------------------------
        calculateStuff();
    }
    
    //----------------------------------------------
    // move
    //----------------------------------------------
	this.setMovePosition = function( movePosition )
	{
        if ( _end1.moved )
        {     
            _end1.setPosition( movePosition );              
        }
        else if ( _end2.moved )
        {        	    
            _end2.setPosition( movePosition );   	    
        }
        
        //-----------------------------------
        // whenever an endpoint is moved...
        //-----------------------------------
        calculateStuff();
    }
    
    //-----------------------------------
    // stop moving
    //-----------------------------------
	this.stopMoving = function()
	{
	    _end1.moved = false;
        _end2.moved = false;        
    }
    
    
	//---------------------------------------------------
	// detect collision with a given position
	//---------------------------------------------------
	this.getCollision = function( testPosition, radius ) 
	{
	    if ( radius < END_RADIUS )
	    {
	        radius = END_RADIUS;
	    }
	    
	    let xx = testPosition.x - _mid.x;
	    let yy = testPosition.y - _mid.y;
	    
	    let distanceSquared = xx * xx + yy * yy;
	    
	    let ll = _length * ONE_HALF + END_RADIUS + radius;
	
	    if ( distanceSquared < ll * ll )
	    {
	        _testVector.x = testPosition.x - _end1.position.x;
	        _testVector.y = testPosition.y - _end1.position.y;
	        
	        let dot = _testVector.dotWith( _perp );
	        
	        if ( Math.abs( dot ) < radius )
	        {
	            let penetration = ( ONE - ( dot / radius ) ) /* * COLLISION_FORCE */;
	            
	            if ( dot < ZERO )
	            {
	                penetration *= -ONE;
	            }
	            
                _collisionForce.setXY( _perp.x * penetration, _perp.y * penetration );
    	        return true;
	        }
	    }
	    
	    return false; 
	}
	

	//-------------------------------------------------------------------
	// if a collision has been detected, then add the resulting force
	// NOTE: call this immediately after calling "getCollision"
	//-------------------------------------------------------------------
	this.getCurrentCollisionForce = function() 
	{
    	return _collisionForce;
    }

	//-------------------------------------------------------
	// See if the obstacle lies between these two points 
	// (blocking the view or stopping access)
	//-------------------------------------------------------
	this.getObstruction = function( p1, p2 ) 
	{
	    return p1.getSegmentsCrossing( p1, p2, _end1.position, _end2.position );
    }

	//------------------------------------------------------------------
	// get end positions
	//------------------------------------------------------------------
	this.getEnd1Position = function() { return _end1.position; }
	this.getEnd2Position = function() { return _end2.position; }

	//---------------------------------------------------
	// detect mouse hover hovered
	//---------------------------------------------------
	this.detectHover = function( touchPosition ) 
	{ 
	    if ( ( _end1.detectHover( touchPosition ) )
	    ||   ( _end2.detectHover( touchPosition ) ) )
	    { 
	        return true; 
	    }

	    return false;
	}
	
    
	//-----------------------------
	// get hovered
	//-----------------------------
	this.getHovered = function() 
	{ 
	    if (( _end1.hovered )
	    ||  ( _end2.hovered ))
	    {
	        //console.log( "OK" );
	        return true;
	    }
	    
	    return false;
	}
	 
	//----------------------------
	// get being moved
	//---------------------------
	this.getBeingMoved = function() 
	{ 
	    return _end1.moved || _end2.moved; 
	}

	 
	//--------------------------------------------
	// calculate stuff when moving an endpoint...
	//-------------------------------------------
	function calculateStuff() 
	{ 
	    //--------------------------------------------
	    // calcualte axis
	    //--------------------------------------------
	    _axis.x = _end2.position.x - _end1.position.x;
	    _axis.y = _end2.position.y - _end1.position.y;
	    
	    //--------------------------------------------
	    // calculate midpoint
	    //--------------------------------------------
	    _mid.x  = _end1.position.x + _axis.x * ONE_HALF;
	    _mid.y  = _end1.position.y + _axis.y * ONE_HALF;
	    
	    //------------------------------------------------------------
	    // calculate length
	    //------------------------------------------------------------
	    _length = Math.sqrt( _axis.x * _axis.x + _axis.y * _axis.y );

	    //----------------------------------
	    // calculate direction
	    //----------------------------------
        _direction.x = _axis.x / _length;
        _direction.y = _axis.y / _length;
        
	    //---------------------------
	    // calculate perpendicular
	    //---------------------------
        _perp.x =  _direction.y;
        _perp.y = -_direction.x;
        
        //--------------------------------------------
        // handle endpoints bumping into each other
        //--------------------------------------------
        let minLength = END_RADIUS * 2;
         
	    if ( _length < minLength )
	    {   
	        let penetration = ONE - ( _length / minLength );
	        	        
	        let xShift = END_RADIUS * _direction.x * penetration;
	        let yShift = END_RADIUS * _direction.y * penetration;
	        
	        _end1.position.x -= xShift;
	        _end1.position.y -= yShift; 

	        _end2.position.x += xShift;
	        _end2.position.y += yShift;
	    }
	    
	    
        //---------------------------------------
        // handle collisions with the pool walls
        //---------------------------------------
        let left   = POOL_LEFT   + END_RADIUS;
        let right  = POOL_RIGHT  - END_RADIUS
        let bottom = POOL_BOTTOM - END_RADIUS
        let top    = POOL_TOP    + END_RADIUS
        
             if ( _end1.position.x > right  ) { _end1.position.x = right;  }
        else if ( _end1.position.x < left   ) { _end1.position.x = left;   }
             if ( _end1.position.y > bottom ) { _end1.position.y = bottom; }
        else if ( _end1.position.y < top    ) { _end1.position.y = top;    }

             if ( _end2.position.x > right  ) { _end2.position.x = right;  }
        else if ( _end2.position.x < left   ) { _end2.position.x = left;   }
             if ( _end2.position.y > bottom ) { _end2.position.y = bottom; }
        else if ( _end2.position.y < top    ) { _end2.position.y = top;    }
	}
    
	//--------------------------------
	// render
	//--------------------------------
	this.render = function( camera )
	{
        //--------------------------------------------
        // show main shaft
        //--------------------------------------------
        canvas.strokeStyle = "rgb( 200, 200, 200 )";	    
        canvas.lineWidth = END_RADIUS;
        canvas.beginPath();
        canvas.moveTo( _end1.position.x, _end1.position.y );
        canvas.lineTo( _end2.position.x, _end2.position.y );
        canvas.closePath();
        canvas.stroke();

        /*
        //--------------------------------------------
        // show perpendicular
        //--------------------------------------------
        canvas.strokeStyle = "rgb( 255, 255, 100 )";	    
        canvas.lineWidth = 2;
        canvas.beginPath();
        canvas.moveTo( _mid.x,  _mid.y  );
        canvas.lineTo( _mid.x + _perp.x * 100, _mid.y + _perp.y * 100 );
        canvas.closePath();
        canvas.stroke();
        
        //--------------------------------------------
        // show mid point
        //--------------------------------------------
        canvas.fillStyle = "rgb( 0, 0, 0 )";	    
        canvas.beginPath();
        canvas.arc( _mid.x, _mid.y, 5, 0, PI2, false );
        canvas.fill();
        canvas.closePath();	
        */
        
        //-----------------------
        // show ends
        //-----------------------
        _end1.render( camera );
        _end2.render( camera );
    }
}






