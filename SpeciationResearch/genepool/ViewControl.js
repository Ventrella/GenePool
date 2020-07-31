"use strict";

const ViewMode = 
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


//----------------------
function ViewControl()
{	
    const LOVER_TRACKING_SCALE_BASE = 400;
    const LOVER_TRACKING_SCALE_INC  = 5.0;
    
    let _poolCenter     = new Vector2D();
    let _camera         = new Camera();
    let _swimbots       = new Array();
    let _mode           = ViewMode.AUTOTRACK;
    let _lover1Index    = NULL_INDEX;
    let _lover2Index    = NULL_INDEX;
    let _trackingScale  = POOL_WIDTH;

    //---------------------------------------------------------------------------------------
    // some quickie set functions...
    //---------------------------------------------------------------------------------------
    this.setPoolCenter  = function( center      ) { _poolCenter.copyFrom( center ); }
    this.setCamera      = function( camera      ) { _camera = camera;               } // should this use a "copyFrom" function?
    this.setSwimbots    = function( swimbots    ) { _swimbots = swimbots;           } // should this use a "copyFrom" function?
    
            
    //-----------------------------------------------
    this.setMode = function( mode, selectedSwimbot )
    {
        //console.log( "ViewControl.setMode: " + mode );    
    
        _mode = mode;
    
        let tracking = false;
        _trackingScale = POOL_WIDTH;
        let duration = 1.0; //seconds
        let trackingPosition = new Vector2D();
 
        //-----------------------------------------------
        // whole pool
        //-----------------------------------------------
        if ( _mode === ViewMode.WHOLE_POOL )
        {
            tracking = true;
            _trackingScale = POOL_WIDTH;
            duration = 2.0;
            trackingPosition.copyFrom( _poolCenter );
        }
        //-----------------------------------------------
        // autotrack
        //-----------------------------------------------
        else if ( _mode === ViewMode.AUTOTRACK ) 
        {     
            //console.log( "_mode is ViewMode.AUTOTRACK" );    
  
            tracking = true;
            _trackingScale = 600;
            duration = 2.0; 
            trackingPosition.copyFrom( getCentroidOfVisibleSwimbots() );
        } 
        //-----------------------------------------------
        // selected swimbot
        //-----------------------------------------------
        else if ( _mode === ViewMode.SELECTED ) 
        {
            if ( selectedSwimbot != NULL_INDEX )
            {
                tracking = true;
                _trackingScale = 400;
                duration = 1.0; 
                trackingPosition.copyFrom( _swimbots[ selectedSwimbot ].getPosition() );
                document.getElementById( 'swimbotDataPanel' ).innerHTML = "";
            }
        }
        //-----------------------------------------------
        // mutual love
        //-----------------------------------------------
        else if ( _mode === ViewMode.MUTUAL ) 
        {
            trackingPosition.copyFrom( getCentroidOfLovers() );

            if (( _lover1Index != NULL_INDEX )
            &&  ( _lover2Index != NULL_INDEX ))
            {
                tracking = true;
                _trackingScale = LOVER_TRACKING_SCALE_BASE;
                duration = 1.0; 
                //trackingPosition.copyFrom( getCentroidOfLovers() );
            }
        }
        //-----------------------------------------------
        // prolific
        //-----------------------------------------------
        else if ( _mode === ViewMode.PROLIFIC ) 
        {
            let mostProlific = getMostProlificSwimbot();

            if ( mostProlific != NULL_INDEX )
            {
                selectedSwimbot = mostProlific;
            
                tracking = true;
                _trackingScale = 500;
                duration = 1.0; 
                trackingPosition.copyFrom( _swimbots[ selectedSwimbot ].getPosition() );
                document.getElementById( 'swimbotDataPanel' ).innerHTML = "";
            }
        } 
        //-----------------------------------------------
        // most efficient
        //-----------------------------------------------
        else if ( _mode === ViewMode.EFFICIENT   ) 
        {
            let mostEfficient = getMostEfficientSwimbot();

            if ( mostEfficient != NULL_INDEX )
            {
                selectedSwimbot = mostEfficient;
            
                tracking = true;
                _trackingScale = 500;
                duration = 1.0; 
                trackingPosition.copyFrom( _swimbots[ selectedSwimbot ].getPosition() );
                document.getElementById( 'swimbotDataPanel' ).innerHTML = "";
            }
        }
        //-----------------------------------------------
        // oldest virgin
        //-----------------------------------------------
        else if ( _mode === ViewMode.VIRGIN ) 
        {
            let oldestVirgin = getOldestVirgin();

            if ( oldestVirgin != NULL_INDEX )
            {
                selectedSwimbot = oldestVirgin;
            
                tracking = true;
                _trackingScale = 500;
                duration = 1.0; 
                trackingPosition.copyFrom( _swimbots[ selectedSwimbot ].getPosition() );
                document.getElementById( 'swimbotDataPanel' ).innerHTML = "";
            }
        }
        //-----------------------------------------------
        // hungriest
        //-----------------------------------------------
        else if ( _mode === ViewMode.HUNGRY ) 
        {
            let biggestEater = getBiggestEater();

            if ( biggestEater != NULL_INDEX )
            {
                selectedSwimbot = biggestEater;
            
                tracking = true;
                _trackingScale = 500;
                duration = 1.0; 
                trackingPosition.copyFrom( _swimbots[ selectedSwimbot ].getPosition() );
                document.getElementById( 'swimbotDataPanel' ).innerHTML = "";
            }
        }
    
        if ( tracking )
        {
            _camera.startTracking( trackingPosition, _trackingScale, duration );
        }
        
        return selectedSwimbot;
    }
    
    
    //-----------------------
    this.reset = function()
    {
        _lover1Index = NULL_INDEX;
        _lover2Index = NULL_INDEX;
    }
    
    

    //----------------------------------------------------------------
    // some quickie get functions....
    //----------------------------------------------------------------
    this.getTrackingScale   = function() { return _trackingScale;   }
    this.getMode            = function() { return _mode;            }
    this.getLover1Index     = function() { return _lover1Index;     }
    this.getLover2Index     = function() { return _lover2Index;     }
    

    //------------------------------------------------------
    this.getTrackingPosition = function( selectedSwimbot )
    {
        let trackingPosition = new Vector2D();

        trackingPosition.copyFrom( _camera.getPosition() );                      
        
        if ( _mode === ViewMode.AUTOTRACK )
        {                    
            trackingPosition.copyFrom( getCentroidOfVisibleSwimbots() );  
            
            //console.log( "getTrackingPosition" );        
        }
        else if ( _mode === ViewMode.MUTUAL )
        {
            if (( _lover1Index != NULL_INDEX )
            &&  ( _lover2Index != NULL_INDEX ))
            {
                let loverDistance = _swimbots[ _lover1Index ].getPosition().getDistanceTo( _swimbots[ _lover2Index ].getPosition() );    
                _trackingScale = LOVER_TRACKING_SCALE_BASE + loverDistance * LOVER_TRACKING_SCALE_INC;
            }

            trackingPosition.copyFrom( getCentroidOfLovers() );     
        }
        else
        {
            if ( selectedSwimbot != NULL_INDEX )
            {                    
                trackingPosition.copyFrom( _swimbots[ selectedSwimbot ].getPosition() );
            }
        }     

        _camera.setTrackingPosition( trackingPosition );   
//_camera.setScale( _trackingScale );

        return trackingPosition;
    }



    //--------------------------------------
    function getCentroidOfVisibleSwimbots()
    {
        let num = 0;
        let centroid = new Vector2D();	    
        centroid.clear();
        
        for (let s=0; s<MAX_SWIMBOTS; s++)
        {
            if ( _camera.getWithinView( _swimbots[s].getPosition(), ZERO ) )
            {
                if ( _swimbots[s].getAlive() )
                {
                    centroid.add( _swimbots[s].getPosition() );
                    num ++;
                }
            }
        }

        if ( num > 0 )
        {
            centroid.scale( ONE / num );
        }
        else
        {
            centroid.copyFrom( _camera.getPosition() );   
        }
            
        return centroid;
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

        //-----------------------------------------------
        // set the centroid to the camera as the default
        //-----------------------------------------------
        centroid.copyFrom( _camera.getPosition() );   
        
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
