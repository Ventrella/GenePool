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

const ViewTrackingMode = 
{
    NULL        : -1,
    WHOLE_POOL  :  0,
    AUTOTRACK   :  1,
    SELECTED    :  2,
    MUTUAL      :  3,
    PROLIFIC    :  4,
    EFFICIENT   :  5,
    VIRGIN      :  6,
    HUNGRY      :  7
};


let hh = 0;

//----------------------
function ViewTracking()
{	
    const LOVER_TRACKING_SCALE_BASE = 0//200;
    const LOVER_TRACKING_SCALE_INC  = 2.0;
    const DEFAULT_INERTIA           = 0.4;
    const EASE_IN_FRACTION          = 15.0;
    const INNER_WINDOW_RATIO        = 0.1;
    
    let _vectorUtility      = new Vector2D();
    let _isTracking         = false;
    let _trackingEaseIn     = ZERO;
    let _trackingPosition   = new Vector2D();
    let _trackingScale      = POOL_WIDTH;
    let _inertia            = DEFAULT_INERTIA;
    let _cameraForce        = new Vector2D();
    let _cameraScaleForce   = ZERO;
    let _swimbots           = new Array();
    let _mode               = ViewTrackingMode.AUTOTRACK;
    let _lover1Index        = NULL_INDEX;
    let _lover2Index        = NULL_INDEX;
    
    //-------------------------------------------------
    // set this to the default
    //-------------------------------------------------
    _vectorUtility.x = POOL_X_CENTER;
    _vectorUtility.y = POOL_Y_CENTER;
    _trackingPosition.copyFrom( _vectorUtility );        

    //--------------------------------------------
    // should this use a "copyFrom" function?
    //--------------------------------------------
    this.setSwimbots = function( swimbots ) 
    { 
        _swimbots = swimbots; 
    }
            
            
    //-----------------------------------------------------------------------------------------
    this.setMode = function( mode, currentCameraPosition, currentCameraScale, selectedSwimbot )
    {
        //console.log( "ViewTracking.setMode: " + mode );    
    
        _mode = mode;
    
        _isTracking = false;
        _trackingPosition.copyFrom( currentCameraPosition );
//_trackingScale = POOL_WIDTH;
        _trackingEaseIn = ZERO;
        _inertia  = DEFAULT_INERTIA;        
        
        //-----------------------------------------------
        // whole pool
        //-----------------------------------------------
        if ( _mode === ViewTrackingMode.WHOLE_POOL )
        {
            _isTracking = true;
            _trackingScale = POOL_WIDTH;
            _inertia = 0.1;      
        }
        //-----------------------------------------------
        // autotrack
        //-----------------------------------------------
        else if ( _mode === ViewTrackingMode.AUTOTRACK ) 
        {     
            //console.log( "_mode is ViewTrackingMode.AUTOTRACK" );    
  
            _isTracking = true;
            _trackingScale = 600;
            //_inertia = 0.05;      
            _inertia = 0.1;      
        } 
        //-----------------------------------------------
        // selected swimbot
        //-----------------------------------------------
        else if ( _mode === ViewTrackingMode.SELECTED ) 
        {
            if ( selectedSwimbot != NULL_INDEX )
            {
                _isTracking = true;
                _trackingScale = 400;
                document.getElementById( 'swimbotDataPanel' ).innerHTML = "";
            }
        }
        //-----------------------------------------------
        // mutual love
        //-----------------------------------------------
        else if ( _mode === ViewTrackingMode.MUTUAL ) 
        {
            _trackingPosition.copyFrom( getCentroidOfLovers() );

            if (( _lover1Index != NULL_INDEX )
            &&  ( _lover2Index != NULL_INDEX ))
            {
                _isTracking = true;
//_trackingScale = LOVER_TRACKING_SCALE_BASE;
            }
        }
        //-----------------------------------------------
        // prolific
        //-----------------------------------------------
        else if ( _mode === ViewTrackingMode.PROLIFIC ) 
        {
            let mostProlific = getMostProlificSwimbot();

            if ( mostProlific != NULL_INDEX )
            {
                selectedSwimbot = mostProlific;
            
                _isTracking = true;
                _trackingScale = 500;
                document.getElementById( 'swimbotDataPanel' ).innerHTML = "";
            }
        } 
        //-----------------------------------------------
        // most efficient
        //-----------------------------------------------
        else if ( _mode === ViewTrackingMode.EFFICIENT   ) 
        {
            let mostEfficient = getMostEfficientSwimbot();

            if ( mostEfficient != NULL_INDEX )
            {
                selectedSwimbot = mostEfficient;
            
                _isTracking = true;
                _trackingScale = 500;
                document.getElementById( 'swimbotDataPanel' ).innerHTML = "";
            }
        }
        //-----------------------------------------------
        // oldest virgin
        //-----------------------------------------------
        else if ( _mode === ViewTrackingMode.VIRGIN ) 
        {
            let oldestVirgin = getOldestVirgin();

            if ( oldestVirgin != NULL_INDEX )
            {
                selectedSwimbot = oldestVirgin;
            
                _isTracking = true;
                _trackingScale = 500;
                document.getElementById( 'swimbotDataPanel' ).innerHTML = "";
            }
        }
        //-----------------------------------------------
        // hungriest
        //-----------------------------------------------
        else if ( _mode === ViewTrackingMode.HUNGRY ) 
        {
            let biggestEater = getBiggestEater();

            if ( biggestEater != NULL_INDEX )
            {
                selectedSwimbot = biggestEater;
            
                _isTracking = true;
                _trackingScale = 500;
                document.getElementById( 'swimbotDataPanel' ).innerHTML = "";
            }
        }
        
        return selectedSwimbot;
    }
    
    
    //-----------------------
    this.reset = function()
    {
        _lover1Index = NULL_INDEX;
        _lover2Index = NULL_INDEX;
    }
    

            
    //--------------------------------
    this.startTracking = function()
    {
        _isTracking = true;
    }
    
    //--------------------------------
    this.stopTracking = function()
    {
        _isTracking = false;
        _mode = ViewTrackingMode.NULL;
    }
    
    //-------------------------------------------------------------------------------------------------
    this.updateTracking = function( currentCameraPosition, currentCameraScale, selectedSwimbot )
    {
        if ( _mode === ViewTrackingMode.AUTOTRACK )
        {                    
            _trackingPosition.copyFrom( getCentroidOfVisibleSwimbots() );  
        }
        else if ( _mode === ViewTrackingMode.MUTUAL )
        {
            if (( _lover1Index != NULL_INDEX )
            &&  ( _lover2Index != NULL_INDEX ))
            {
                let loverDistance = _swimbots[ _lover1Index ].getPosition().getDistanceTo( _swimbots[ _lover2Index ].getPosition() );  
                
                // tone it down dudes! FIX...  
//let trackingScaleTarget = LOVER_TRACKING_SCALE_BASE + loverDistance * LOVER_TRACKING_SCALE_INC;
//_trackingScale += ( trackingScaleTarget - _trackingScale ) * 0.01;
                
//_trackingScale = trackingScaleTarget;

_trackingScale += ( ( loverDistance * 2 ) - _trackingScale ) * 0.1;
                
            }

            _trackingPosition.copyFrom( getCentroidOfLovers() );     
        } 
        else
        {
            if ( selectedSwimbot != NULL_INDEX )
            {                    
                _trackingPosition.copyFrom( _swimbots[ selectedSwimbot ].getPosition() );
            }
        }     
        
        //----------------------------------------------------------------
        // This is where the tracking forces are created......
        //----------------------------------------------------------------    
// goals: 
// DONE - NEEDS TESTING    improve ease-in
// DONE - NEEDS TESTING    make camera stop when forces go below a minimum
// make whole pool go slower        
// for autotracking, make drop off with distance 
// for transition, make scale go up and then down
        
        let xx = _trackingPosition.x - currentCameraPosition.x;
        let yy = _trackingPosition.y - currentCameraPosition.y;
        
        //---------------------------------------------------------------------------
        // this is where we handle the inner-window having no tracking force...
        //---------------------------------------------------------------------------
        let min = currentCameraScale * INNER_WINDOW_RATIO;
        
        let d = Math.sqrt( xx * xx + yy * yy );
        
        if ( d < min ) 
        { 
            _cameraForce.x = ZERO;
            _cameraForce.y = ZERO;               
        }
        else
        { 
            let ramp = ( d - min ) / currentCameraScale;
            
            if ( ramp > ONE )
            {
                ramp = ONE;
            }
            
            _cameraForce.x = xx * _inertia * ramp;
            _cameraForce.y = yy * _inertia * ramp;               
        }
        
        //-----------------------------------------------------------------------------------
        // set scale force
        //-----------------------------------------------------------------------------------
        _cameraScaleForce = ( _trackingScale - currentCameraScale ) * _inertia;
        
        //-------------------------------------
        // handle ease-in effect
        //-------------------------------------
        _trackingEaseIn += EASE_IN_FRACTION;

        let distance = _cameraForce.getMagnitude();

        if ( distance > _trackingEaseIn )
        {
            if ( distance > ZERO )
            {
                _cameraForce.x = ( _cameraForce.x / distance ) * _trackingEaseIn;
                _cameraForce.y = ( _cameraForce.y / distance ) * _trackingEaseIn;
            }
        }

        if ( _cameraScaleForce < -_trackingEaseIn ) { _cameraScaleForce   = -_trackingEaseIn; }
        if ( _cameraScaleForce >  _trackingEaseIn ) { _cameraScaleForce   =  _trackingEaseIn; }
    }
    
    
    
    

    //----------------------------------------------------------------
    // some quickie get functions....
    //----------------------------------------------------------------    
    this.getIsTracking          = function() { return _isTracking;      }
    this.getMode                = function() { return _mode;            }
    this.getLover1Index         = function() { return _lover1Index;     }
    this.getLover2Index         = function() { return _lover2Index;     }
    this.getCameraForce         = function() { return _cameraForce      }
    this.getCameraScaleForce    = function() { return _cameraScaleForce }

    

    //--------------------------------------
    function getCentroidOfVisibleSwimbots()
    {
        //let num = 0;
        let totalWeight = ZERO;
        let centroid = new Vector2D();	    
        centroid.clear();
         
        for (let s=0; s<MAX_SWIMBOTS; s++)
        {
            let xx = _swimbots[s].getPosition().x - _trackingPosition.x;
            let yy = _swimbots[s].getPosition().y - _trackingPosition.y;
            
            let distance = Math.sqrt( xx*xx + yy*yy );
            
            if ( distance < _trackingScale )
            {
                if ( _swimbots[s].getAlive() )
                {
                    let weight = ONE - ( distance / _trackingScale );
                    
                    //assert( weight <= ONE,  "weight <= ONE"  );
                    //assert( weight >= ZERO, "weight >= ZERO" );
                    
                    centroid.addScaled( _swimbots[s].getPosition(), weight );
                    //num ++;
                    totalWeight += weight;
                }
            }
        }

        if ( totalWeight > ZERO )
        //if ( num > 0 )
        {
            //centroid.scale( ONE / num );
            centroid.scale( ONE / totalWeight );
        }
        else
        {
            let closestSwimbot = getClosestSwimbotToTrackingPosition();

            if ( closestSwimbot != NULL_INDEX )
            {
                centroid.copyFrom( _swimbots[ closestSwimbot ].getPosition() );   
            }
            else
            {
                centroid.copyFrom( _trackingPosition );   
            }
        }
            
        return centroid;
    }




    //---------------------------------------------
    function getClosestSwimbotToTrackingPosition()
    {
        let closest = NULL_INDEX;
        let smallestDistance = POOL_WIDTH;
        
        for (let s=0; s<MAX_SWIMBOTS; s++)
        {
            if ( _swimbots[s].getAlive() )
            {
                let distance = _swimbots[s].getPosition().getDistanceTo( _trackingPosition );

                if ( distance < smallestDistance )
                {
                    smallestDistance = distance;
                    closest = s;
                }
            }
        }
                
        return closest
    }    
    
    
    //---------------------------------
    function getMostProlificSwimbot()
    {		
        let mostNumOffspring = 0;
        let mostProlific = 0;

        for (let s=0; s<MAX_SWIMBOTS; s++)
        {
            if ( _swimbots[s].getAlive() )
            {
                let numOffspring = _swimbots[s].getNumOffspring();
            
                if ( numOffspring > mostNumOffspring )
                {
                    mostNumOffspring = numOffspring;
                    mostProlific = s;
                }
            }
        }

        return mostProlific;
    }	    
    
    //----------------------------------
    function getMostEfficientSwimbot()
    {		
        let highestEfficiency = 0;
        let mostEfficient = NULL_INDEX;

        for (let s=0; s<MAX_SWIMBOTS; s++)
        {
            if ( _swimbots[s].getAlive() )
            {
                if ( _swimbots[s].getNumOffspring() === 0 )
                {
                    let efficiency = _swimbots[s].getEnergyEfficiency();
            
                    if ( efficiency > highestEfficiency )
                    {
                        highestEfficiency = efficiency;
                        mostEfficient = s;
                    }
                }
            }
        }

        return mostEfficient;
    }
    
    //--------------------------
    function getOldestVirgin()
    {		
        let highestAge = 0;
        let oldestVirgin = NULL_INDEX;

        for (let s=0; s<MAX_SWIMBOTS; s++)
        {
            if ( _swimbots[s].getAlive() )
            {
                if ( _swimbots[s].getNumOffspring() === 0 )
                {
                    let age = _swimbots[s].getAge();
            
                    if ( age > highestAge )
                    {
                        highestAge = age;
                        oldestVirgin = s;
                    }
                }
            }
        }

        return oldestVirgin;
    }
    
    //--------------------------
    function getBiggestEater()
    {		
        let mostEaten = 0;
        let biggestEater = NULL_INDEX;

        for (let s=0; s<MAX_SWIMBOTS; s++)
        {
            if ( _swimbots[s].getAlive() )
            {
                let numEaten = _swimbots[s].getNumFoodBitsEaten();
        
                if ( numEaten > mostEaten )
                {
                    mostEaten = numEaten;
                    biggestEater = s;
                }
            }
        }

        return biggestEater;
    }
    
    
    
    //-----------------------------
    function getCentroidOfLovers()
    {
        let centroid = new Vector2D();	 

        //-----------------------------------------------------------
        // set the centroid to the tracking position as the default
        //-----------------------------------------------------------
        centroid.copyFrom( _trackingPosition );   

        //-----------------------------------------------------------
        // start by assuming they are still in love
        //-----------------------------------------------------------
        let stillInLove = true;
        
        //-----------------------------------------------------------
        // check if either of the lovers has NULL_INDEX
        //-----------------------------------------------------------
        if (( _lover1Index === NULL_INDEX )
        ||  ( _lover2Index === NULL_INDEX ))
        {
            stillInLove = false;
        }
        
        //-----------------------------------------------------------
        // okay - if their indices are legit
        //-----------------------------------------------------------
        if ( stillInLove )
        {
            //--------------------------------------------
            // Check to see if the lovers have broken up
            //--------------------------------------------
            for (let s=0; s<MAX_SWIMBOTS; s++)
            {
                //-----------------------------------------------
                // is lover 1 still in love with lover 2?
                //-----------------------------------------------
                if ( s === _lover1Index )
                {
                    if ( _swimbots[s].getAlive() )
                    {
                        if (( _swimbots[s].getBrainState() != BRAIN_STATE_PURSUING_MATE )
                        ||  ( _swimbots[s].getChosenMateIndex() != _lover2Index ))
                        {
                            stillInLove = false;
                        }
                    }
                    else
                    {
                        stillInLove = false;
                    }
                }
            
                //---------------------------------------------------------------
                // if yes, then...is lover 2 still in love with lover 1?
                //---------------------------------------------------------------
                if ( stillInLove )
                {
                    if ( s === _lover2Index )
                    {
                        if ( _swimbots[s].getAlive() )
                        {
                            if (( _swimbots[s].getBrainState() != BRAIN_STATE_PURSUING_MATE )
                            ||  ( _swimbots[s].getChosenMateIndex() != _lover1Index ))
                            {
                                stillInLove = false;
                            }
                        }
                        else
                        {
                            stillInLove = false;
                        }
                    }
                }
            }        
        }
        
        //-------------------------------------------------------------
        // okay, they parted ways - find two new lovers!
        //-------------------------------------------------------------
        if ( ! stillInLove )
        {
//console.log( "yea, not stillInLove" ); 
//console.log( "" );    
//console.log( "" );    
//console.log( "" );    
  

            for (let s=0; s<MAX_SWIMBOTS; s++)
            {
                if ( _swimbots[s].getAlive() )
                {
                    if ( _swimbots[s].getBrainState() === BRAIN_STATE_PURSUING_MATE )
                    {
                        let chosenMate = _swimbots[s].getChosenMateIndex();
                        
//console.log( "lover " + s + " is going after " + chosenMate );    
                        
                        for (let o=0; o<MAX_SWIMBOTS; o++)
                        {
                            if ( o === chosenMate )
                            {
//console.log( "here's " + o );    
                                if ( _swimbots[o].getAlive() )
                                {
//console.log( o + " is alive" );    
                                    if ( _swimbots[o].getBrainState() === BRAIN_STATE_PURSUING_MATE )
                                    {
//console.log( "lover " + o + " is going after " + _swimbots[o].getChosenMateIndex() );    
                                        if ( _swimbots[o].getChosenMateIndex() === s )
                                        {
//console.log( o + " likes " + s );    
//console.log( "*********************************************************************************" );    
//console.log( "lover " + s + " is going after " + _swimbots[s].getChosenMateIndex() );    
//console.log( "lover " + o + " is going after " + _swimbots[o].getChosenMateIndex() );    
                                    
                                            _lover1Index = s;
                                            _lover2Index = o;
                                            
//console.log( " _lover1Index = " + _lover1Index );    
//console.log( " _lover2Index = " + _lover2Index );    
                                      
                                            
                                            
                                            assert( _lover1Index != _lover2Index, "getCentroidOfLovers: _lover1Index != _lover2Index" );
                                            
                                            //_loverDistance = _swimbots[s].getPosition().getDistanceTo( _swimbots[o].getPosition );
                                        }
                                    }
                                }
                            }
                        }                        
                    }
                }
            }
        }

        //----------------------------------------------------------
        // get the centroid of the two lovers and send it off
        //----------------------------------------------------------
        if (( _lover1Index != NULL_INDEX )
        &&  ( _lover2Index != NULL_INDEX ))
        {
            centroid.x = ( _swimbots[ _lover1Index ].getPosition().x + _swimbots[ _lover2Index ].getPosition().x ) * ONE_HALF;
            centroid.y = ( _swimbots[ _lover1Index ].getPosition().y + _swimbots[ _lover2Index ].getPosition().y ) * ONE_HALF;
        }
    
        return centroid;
    }
}
