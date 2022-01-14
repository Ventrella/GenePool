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

function Vector2D()
{	
	this.x = 0.0;
	this.y = 0.0;


	//----------------------------------
	this.setXY = function( x_, y_ )
	{	
		this.x = x_;
		this.y = y_;
	}


	//--------------------------
	this.copyFrom = function(v)
	{	
		this.x = v.x;
		this.y = v.y;
	}


	//--------------------------------------
	this.addXY  = function( x_, y_ )
	{
		this.x += x_;
		this.y += y_;	
	}
	
	
	//-----------------------
	this.set = function( p_ )
	{
		this.x = p_.x;
		this.y = p_.y;
	}
	
	
	
	/*
	//---------------------------------
	this.setToSum = function( v1, v2 )
	{
		x = v1.getX() + v2.getX();
		y = v1.getY() + v2.getY();
	} 
	*/

	//----------------------------------------
	this.setToDifference = function( v1, v2 )
	{
		this.x = v1.x - v2.x;
		this.y = v1.y - v2.y;		
	} 


	/*
	//-------------------------------------
	this.setToAverage = function( v1, v2 )
	{
		x = ( v1.getX() + v2.getX() ) * 0.5;
		y = ( v1.getY() + v2.getY() ) * 0.5;	
	}
	*/


	//-------------------------------------------------------------------------------------------
	this.normalize = function()
	{
		let m = Math.sqrt( this.x * this.x + this.y * this.y );
		
		if ( m > 0 )
		{
			this.x /= m;
			this.y /= m;
		}
		else
		{
			this.x = 1.0;
			this.y = 0.0;
		}
	} 


	
	//------------------------
	this.add = function( v )
	{
		this.x += v.x;
		this.y += v.y;
		
	} 

	
	//---------------------------- 
	this.subtract = function( v )
	{
		this.x -= v.x;
		this.y -= v.y;	
	}
	
	//-----------------------------------
	this.getMagnitude = function()
	{
		return Math.sqrt( this.x * this.x + this.y * this.y );
	}

	//-----------------------------------
	this.getMagnitudeSquared = function()
	{
		return this.x * this.x + this.y * this.y;
	}

	//-----------------------
	this.clear = function()
	{
		this.x = 0.0;
		this.y = 0.0;
	}
	
	//-------------------------
	this.scale = function( s )
	{
		this.x *= s;
		this.y *= s;
	}
	
	
	//----------------------------------------------
	this.addScaled = function( vectorToAdd, scale ) 
	{ 
		this.x += vectorToAdd.x * scale; 
		this.y += vectorToAdd.y * scale; 
	}
	
	//----------------------------------------------------------
	this.subtractScaled = function( vectorToSubtract, scale ) 
	{ 
		this.x -= vectorToSubtract.x * scale; 
		this.y -= vectorToSubtract.y * scale; 
	}


	//--------------------------
	this.dotWith = function( v )
	{
		return this.x * v.x + this.y * v.y;		
	} 
	
	

	//-----------------------------------------------------------
	this.setToRandomLocationInDisk = function( position, radius )
	{
		let radian = PI2 * gpRandom();
		let magnitude = radius * Math.sqrt( gpRandom() );

        this.x = position.x + Math.sin( radian ) * magnitude;
        this.y = position.y + Math.cos( radian ) * magnitude;
	}
	
	//-----------------------------------------------
    this.getDistanceSquaredTo = function( position )
    {
        let xx = this.x - position.x;
        let yy = this.y - position.y;
        return xx * xx + yy * yy;
    }


	//-----------------------------------------
    this.getDistanceTo = function( position )
    {
        let xx = this.x - position.x;
        let yy = this.y - position.y;
        return Math.sqrt( xx * xx + yy * yy );
    }


	//------------------------------------
    this.setToPerpendicular = function()
    {
        let px =  this.y;
        let py = -this.x;
        
        this.x = px;
        this.y = py;        
    }



	//----------------------------------------------------
	// check to see if segment a crosses segment b
	//----------------------------------------------------
    this.getSegmentsCrossing = function( a0, a1, b0, b1 )
    {
        //----------------------------
        // get the a and b vectors
        //----------------------------
        let aX = a1.x - a0.x;
        let aY = a1.y - a0.y;

        let bX = b1.x - b0.x;
        let bY = b1.y - b0.y;

        //----------------------------
        // get their perpendiculars
        //----------------------------
        let aPerpX = -aY;
        let aPerpY =  aX;

        let bPerpX = -bY;
        let bPerpY =  bX;
        
        //--------------------------------
        // get the vector from a0 to b0
        //--------------------------------
        let a0b0x = b0.x - a0.x;
        let a0b0y = b0.y - a0.y;

        //--------------------------------
        // get the vector from a0 to b1
        //--------------------------------
        let a0b1x = b1.x - a0.x;
        let a0b1y = b1.y - a0.y;

        //--------------------------------
        // get the vector from b0 to a0
        //--------------------------------
        let b0a0x = a0.x - b0.x;
        let b0a0y = a0.y - b0.y;
        
        //--------------------------------
        // get the vector from b0 to a1
        //--------------------------------
        let b0a1x = a1.x - b0.x;
        let b0a1y = a1.y - b0.y;
        
        //-------------------------------------------------------
        // get the dots of aPerp to the vectors to b0 and b1
        //-------------------------------------------------------
        let a0Dotb0 = aPerpX * a0b0x + aPerpY * a0b0y;
        let a0Dotb1 = aPerpX * a0b1x + aPerpY * a0b1y;

        //-------------------------------------------------------
        // get the dots of bPerp to the vectors to a0 and a1
        //-------------------------------------------------------
        let b0Dota0 = bPerpX * b0a0x + bPerpY * b0a0y;
        let b0Dota1 = bPerpX * b0a1x + bPerpY * b0a1y;
            
        //----------------------------------------------
        // if both pairs of dots are on opoosite 
        // sides of zero, then the lines are crossing.
        //----------------------------------------------
        if (((( a0Dotb0 > ZERO ) && ( a0Dotb1 < ZERO ))
        ||   (( a0Dotb1 > ZERO ) && ( a0Dotb0 < ZERO )))
        &&  ((( b0Dota0 > ZERO ) && ( b0Dota1 < ZERO ))
        ||   (( b0Dota1 > ZERO ) && ( b0Dota0 < ZERO ))))
        {
            return true;
        }
    
        return false;
    }




    /*
	//-------------------------------------------------------------------
    this.getClosestPointOnLineSegment = function( segmentEnd1, segmentEnd2 )
    {        
        let position = new Vector2D();
        position.setXY( x, y );
        
        let vectorFromEnd1ToPosition = new Vector2D();        
        vectorFromEnd1ToPosition.set( position );
        vectorFromEnd1ToPosition.subtract( segmentEnd1 );

        let segmentVector = new Vector2D();        
        segmentVector.set( segmentEnd2 );
        segmentVector.subtract( segmentEnd1 );
        
        let dot = vectorFromEnd1ToPosition.dotWith( segmentVector );
        if ( dot < 0.0 )
        {
            return segmentEnd1;
        }
        
        let squared = segmentVector.dotWith( segmentVector );
        if ( dot > squared )
        {
            return segmentEnd2;
        }
        
        let extent = dot / squared;

        let positionOnSegment = new Vector2D();
        positionOnSegment.set( segmentEnd1 );
        positionOnSegment.addScaled( segmentVector, extent );
        
        let vectorFromPositionToPositionOnSegment = new Vector2D();
        
        vectorFromPositionToPositionOnSegment.set( positionOnSegment );
        vectorFromPositionToPositionOnSegment.subtract( position );

        return positionOnSegment;
    }
	*/

	
	
/*
	//-------------------------------------------------------------------
    this.getDistanceToLineSegment = function( segmentEnd1, segmentEnd2 )
    {        
        //console.log( "position = " + x + ", " + y );

        //console.log( "segmentEnd1 = " + segmentEnd1.getX() + ", " +  segmentEnd1.getY() );
        //console.log( "segmentEnd2 = " + segmentEnd2.getX() + ", " +  segmentEnd2.getY() );
    
        let position = new Vector2D();
        position.setXY( x, y );
        
        let vectorFromEnd1ToPosition = new Vector2D();        
        vectorFromEnd1ToPosition.set( position );
        vectorFromEnd1ToPosition.subtract( segmentEnd1 );

        let segmentVector = new Vector2D();        
        segmentVector.set( segmentEnd2 );
        segmentVector.subtract( segmentEnd1 );

        //console.log( "segmentVector = " + segmentVector.getX() + ", " +  segmentVector.getY() );
        
        let dot = vectorFromEnd1ToPosition.dotWith( segmentVector );
        //console.log( "dot = " + dot );
        if ( dot < 0.0 )
        {
            //console.log( "dot is < 0" );
            let distance = vectorFromEnd1ToPosition.getMagnitude();
            return distance;
        }
        
        let squared = segmentVector.dotWith( segmentVector );
        //console.log( "segmentVector squared = " + squared ); 
        if ( dot > squared )
        {
            //console.log( "dot is > segmentVector squared" );
            let vectorFromEnd2ToPosition = new Vector2D();        
            vectorFromEnd2ToPosition.set( position );
            vectorFromEnd2ToPosition.subtract( segmentEnd2 );
            let distance = vectorFromEnd2ToPosition.getMagnitude();
            return distance;
        }
        
        //console.log( "dot is > 0.0 and < segmentVector squared " ); 
        
        let extent = dot / squared;

        //console.log( "extent = " + extent ); 

        let positionOnSegment = new Vector2D();
        positionOnSegment.set( segmentEnd1 );
        positionOnSegment.addScaled( segmentVector, extent );
        
        let vectorFromPositionToPositionOnSegment = new Vector2D();
        
        vectorFromPositionToPositionOnSegment.set( positionOnSegment );
        vectorFromPositionToPositionOnSegment.subtract( position );
        
        let distance = vectorFromPositionToPositionOnSegment.getMagnitude();
        return distance;
    }
*/

} //---------------------------------------------------------------------------------
 //---------------  END of class constructor ---------------------------------------
//---------------------------------------------------------------------------------




