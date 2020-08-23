"use strict";

const SimulationStartMode = 
{
    RANDOM       : 0,
    FROGGIES     : 1,
    TANGO        : 2,
    RACE         : 3,
    NEIGHBORHOOD : 4,
    BIG_BANG     : 5,
    BAD_PARENTS  : 6,
    BARRIER      : 7,
    EMPTY        : 8,
    FILE         : 9
};

const CameraNavigationAction = 
{
    LEFT    : 0,
    RIGHT   : 1,
    UP      : 2,
    DOWN    : 3,
    IN      : 4,
    OUT     : 5
}

const MIN_FOOD_REGENERATION_PERIOD      = 1;
//const DEFAULT_FOOD_REGENERATION_PERIOD  = 40;
const DEFAULT_FOOD_REGENERATION_PERIOD  = 20;
const MAX_FOOD_REGENERATION_PERIOD      = 200;

//const NON_REPRODUCING_JUNK_DNA_LIMIT = 0.7;

// this needs to be the same as the analogous value in embryology!
const NUM_GENES_USED = 111;




var GLOBAL_childEnergyRatio = DEFAULT_CHILD_ENERGY_RATIO;

//------------------
function GenePool()
{	
	//-----------------------------------
	// count-related constants
	//-----------------------------------
	const MAX_FOODBITS          = 2000;
	
    //const INITIAL_NUM_SWIMBOTS  = 400;
    //const INITIAL_NUM_FOODBITS  = 1600;    
    
    const TRAIL_LENGTH          = 100;
    
    const NUM_NEIGHBORHOOD_SWIMBOTS = 14 * 14;
    const NUM_NEIGHBORHOOD_FOODBITS = 28 * 28;
    
	//---------------------------------------------
	// rendering-related constants
	//---------------------------------------------
//const MILLISECONDS_PER_UPDATE           = 20;
const MILLISECONDS_PER_UPDATE           = 1;

//const LEVEL_OF_DETAIL_THRESHOLD         = 1000.0;
const LEVEL_OF_DETAIL_THRESHOLD         = 1200.0;

    const INITIAL_VIEW_SCALE                = POOL_WIDTH * 0.1;
    const RACE_VIEW_SCALE                   = POOL_WIDTH * 0.3;
    const BANG_VIEW_SCALE                   = POOL_WIDTH * 0.2;
    const PARENT_VIEW_SCALE                 = POOL_WIDTH * 0.05;
    const NEIGHBORHOOD_VIEW_SCALE           = POOL_WIDTH * 0.4;
    const NEIGHBORHOOD_FREQ                 = 5.0;
    const DEBUG_SHOW_SWIMBOT_TRAIL          = false;
    const SWIMBOT_DATA_UPDATE_PERIOD        = 30;
    const CAMERA_TRACKING_UPDATE_PERIOD   = 10;
    const CLONE_SEPARATION                  = 10.0;
    const FOOD_RACE_SIZE                    = 1000;
    const FOOD_BANG_SIZE                    = 1700;
    
	//----------------------------------------------------
	// variables
	//----------------------------------------------------
	let _touch                  = new Touch(); 
	let _swimbots 		        = new Array( Swimbot ); 
	let _foodBits		        = new Array( MAX_FOODBITS );
    let _nearbySwimbotsArray    = new Array( BRAIN_MAX_PERCEIVED_NEARBY_SWIMBOTS );
	let _viewControl		    = new ViewControl();
    let _potentialMate          = new Swimbot();
	let _chosenFoodBit          = new FoodBit();
	let _camera  		        = new Camera();
	let _obstacle               = new Obstacle();
	let _pool			        = new Pool();
	let _embryology		        = new Embryology();
	let _vectorUtility          = new Vector2D();
	let _myGenotype             = new Genotype();
    let _mateGenotype           = new Genotype();
    let _childGenotype          = new Genotype();
    let _neighborhoodX          = new Array();
    let _neighborhoodY          = new Array();
    let _neighborhoodAxis       = new Array();
	let _simulationRunning      = false;
	let _swimbotBeingDragged    = false;
	let _foodBitBeingDragged    = false;
	let _poolCenter             = new Vector2D();   
	let _canvas                 = null;  
	let _clock                  = 0;
	let _numSwimbots 	        = 0;
    let _numNearbySwimbots      = 0;
	let _numFoodBits 	        = 0;
	let _canvasWidth            = 0;
	let _canvasHeight           = 0;
	let _mousedOverSwimbot      = NULL_INDEX;
    let _mousedOverFoodBit      = NULL_INDEX;
	let _selectedSwimbot        = NULL_INDEX;
	let _selectedFoodBit        = NULL_INDEX;
	let _startTime		        = ZERO;
	let _seconds		        = ZERO;
	let _attractionCriterion    = ATTRACTION_SIMILAR_COLOR;
	let _levelOfDetail	        = SWIMBOT_LEVEL_OF_DETAIL_LOW;
	let _foodRegenerationPeriod = DEFAULT_FOOD_REGENERATION_PERIOD;
	let _foodSpread             = DEFAULT_FOOD_BIT_MAX_SPAWN_RADIUS;
	let _foodBitEnergy          = DEFAULT_FOOD_BIT_ENERGY;
	let _hungerThreshold        = DEFAULT_SWIMBOT_HUNGER_THRESHOLD;
	let _previousTime           = ZERO;
	let _frameRate              = ZERO;
	let _debugTrail 		    = new Array( TRAIL_LENGTH ); 
	let _familyTree             = new FamilyTree();
	let _panningLeft            = false;
	let _panningRight           = false;
	let _panningUp              = false;
	let _panningDown            = false;
    let _zoomingIn              = false;
    let _zoomingOut             = false;
    let _renderingGoals         = false;
    let _windowWidth            = 0;
    let _windowHeight           = 0;

    
    
let hhh = 0;	
	//-------------------------------------
	// create fixed-sized swimbot array
	//-------------------------------------
	for (let s=0; s<MAX_SWIMBOTS; s++)
	{
		_swimbots[s] = new Swimbot(); 
		_swimbots[s].setParent(this);
	}	
    
	//-----------------------------------------------------
	// create fixed-sized perceived nearby swimbot array
	//-----------------------------------------------------
	for (let s=0; s<BRAIN_MAX_PERCEIVED_NEARBY_SWIMBOTS; s++)
	{
		_nearbySwimbotsArray[s] = new Swimbot(); 
	}	

	//-------------------------------------
	// create fixed-sized foodbit array
	//-------------------------------------
	for (let f=0; f<MAX_FOODBITS; f++)
	{
		_foodBits[f] = new FoodBit(); 
	}	

	//-------------------------------------
	// create trail array
	//-------------------------------------
	for (let t=0; t<TRAIL_LENGTH; t++)
	{
		_debugTrail[t] = new Vector2D(); 
	}	
	
	//-------------------------------
	// This is an important call!
	//-------------------------------
	this.setCanvas = function(c)
    {
        _canvas = c;        
        //console.log( canvas );
    }
    
	//-------------------------------------------
	this.setCanvasDimensions = function( w, h )
    {
        //console.log( "setCanvasDimensions: " + w + ", " + h );
        
        _canvasWidth  = w;
        _canvasHeight = h;

        _camera.setAspectRatio( _canvasWidth / _canvasHeight );
    }
    
    
	//---------------------------
	this.initialize = function()
	{	
		//----------------------------------
		// get pool center
		//----------------------------------
        _poolCenter.copyFrom( _pool.getCenter() );
        
		//------------------------------------
		// start with a random simulation
		//------------------------------------
        this.startSimulation( SimulationStartMode.RANDOM );
        
		//------------------------------------------
		// configure view control
		//------------------------------------------
        _viewControl.setPoolCenter( _poolCenter );	        
        _viewControl.setCamera( _camera );	        
        _viewControl.setSwimbots( _swimbots );	   
        _viewControl.setMode( ViewMode.AUTOTRACK, 0 );   
        
		//------------------------------------------------------------
		// start up the timer
		//------------------------------------------------------------
		this.timer = setTimeout( "genePool.update()", MILLISECONDS_PER_UPDATE );	
	}
	
	

	//------------------------------------------
	this.startSimulation = function( mode )
	{	
//looks like numOffspring didn't get reset. fix this! (and any other related side effects
	
		//---------------------------------
		// set clock to 0
		//---------------------------------
		_clock = 0;
	
		//----------------------------
		// start time
		//----------------------------
		_startTime = (new Date).getTime();

		//----------------------------------
		// initialize pool
		//----------------------------------
		_seconds = ( (new Date).getTime() - _startTime ) / MILLISECONDS_PER_SECOND;
	    _pool.initialize( _seconds );

        //-------------------------
        // initialize camera
        //-------------------------
        _camera.setScale( INITIAL_VIEW_SCALE );
        _camera.setPosition( _poolCenter );
        
        //-------------------------
        // reset view control
        //-------------------------
        _viewControl.reset();

        //-------------------------
        // reset family tree
        //-------------------------
        _familyTree.reset();
        
        //--------------------------------------
        // clear out all swimbots and food bits
        //--------------------------------------
        _numSwimbots = 0;
        for (let s=0; s<MAX_SWIMBOTS; s++)
        {
            _swimbots[s].clear();
        }                    

        _numFoodBits = 0            
        for (let f=0; f<MAX_FOODBITS; f++)
        {
            _foodBits[f].kill();
        }            
        
        //--------------------------------------------------------------
        // set ecosystem tweak values to their defaults. Some of them 
        // may be changed afterwards depending on the simulation mode.
        //--------------------------------------------------------------
        this.setFoodGrowthDelay ( DEFAULT_FOOD_REGENERATION_PERIOD  );
        this.setFoodSpread      ( DEFAULT_FOOD_BIT_MAX_SPAWN_RADIUS );
        this.setFoodBitEnergy   ( DEFAULT_FOOD_BIT_ENERGY           );
        this.setHungerThreshold ( DEFAULT_SWIMBOT_HUNGER_THRESHOLD  );
        this.setAttraction      ( ATTRACTION_SIMILAR_COLOR          );
        
        //console.log( "startSimulation: setOffspringEnergyRatio to default: " + DEFAULT_CHILD_ENERGY_RATIO );
        
        this.setOffspringEnergyRatio( DEFAULT_CHILD_ENERGY_RATIO );
        
        //----------------------------------------------------
        // initialize according to simulation start mode
        //----------------------------------------------------
        if ( mode === SimulationStartMode.RANDOM )
        {
            _numSwimbots = INITIAL_NUM_SWIMBOTS;
            this.randomizeFood();
            
            
            
        }
        else if ( mode === SimulationStartMode.FROGGIES )
        {
            _numSwimbots = INITIAL_NUM_SWIMBOTS;
            this.randomizeFood();
        }
        else if ( mode === SimulationStartMode.TANGO )
        {
            _numSwimbots = 2;
            this.randomizeFood();
        }
        else if ( mode === SimulationStartMode.RACE )
        {
            _numSwimbots = 4;
            this.setFoodToRaceConfiguration();
            _camera.setScale( RACE_VIEW_SCALE );
        }
        else if ( mode === SimulationStartMode.BIG_BANG )
        {        
            _numSwimbots = 100;
            this.setFoodToBangConfiguration();
            _camera.setScale( BANG_VIEW_SCALE );
        }
        else if ( mode === SimulationStartMode.BAD_PARENTS )
        {        
            _numSwimbots = 2;
            this.setFoodToBadParentsConfiguration();
            
            this.setFoodGrowthDelay     ( 200 );  
            this.setFoodSpread          ( 20 );       
	        this.setHungerThreshold     ( 150 );
            this.setFoodBitEnergy       ( 6 );
            this.setOffspringEnergyRatio( 0.0001 );
	        
            //console.log( "if ( mode === SimulationStartMode.BAD_PARENTS ): setOffspringEnergyRatio to 0.001" );
            
            _camera.setScale( PARENT_VIEW_SCALE );
        }
        else if ( mode === SimulationStartMode.BARRIER )
        {        
            _numSwimbots = INITIAL_NUM_SWIMBOTS;
            //this.setFoodToBarrierConfiguration();
            this.randomizeFood();
            
            //_camera.setScale( PARENT_VIEW_SCALE );
        }
        else if ( mode === SimulationStartMode.NEIGHBORHOOD )
        {
            _camera.setScale( NEIGHBORHOOD_VIEW_SCALE );
            _numSwimbots = NUM_NEIGHBORHOOD_SWIMBOTS;
            this.randomizeNeighborhood();
            this.setFoodToNeighborhood( _poolCenter, GARDEN_OF_EDEN_RADIUS );
        }
        else if ( mode === SimulationStartMode.EMPTY )
        {
            _numSwimbots = 0;
            this.randomizeFood();
        }

        //----------------------------------
        // initialize swimbots
        //----------------------------------
        for (let i=0; i<_numSwimbots; i++)
        {
            let initialPosition = new Vector2D();

            initialPosition.setToRandomLocationInDisk( _poolCenter, GARDEN_OF_EDEN_RADIUS ); 


//initialPosition.x = POOL_LEFT + POOL_WIDTH  * Math.random();
//initialPosition.y = POOL_TOP  + POOL_HEIGHT * Math.random();
    
            //------------------------------------------------------------
            // yo, initial age varies but is weighted towards the young
            //------------------------------------------------------------
            let weightedRandomNormal = Math.random() * Math.random();

//let index = i;
            let initialAge      = FULLY_GROWN_AGE + Math.floor( ( MAXIMUM_LIFESPAN - FULLY_GROWN_AGE ) * weightedRandomNormal );
            let initialAngle    = getRandomAngleInDegrees(); //-180.0 + Math.random() * 360.0;
            let initialEnergy   = DEFAULT_SWIMBOT_HUNGER_THRESHOLD;

            //--------------------------------------------------
            // set values according to sim type
            //--------------------------------------------------

            //---------------------------------
            // neighborhood
            //---------------------------------
            if ( mode === SimulationStartMode.NEIGHBORHOOD )
            {
                let sqrt = Math.floor( Math.sqrt( _numSwimbots ) );
                let xMod = i % sqrt;
                let yMod = Math.floor( ( i / _numSwimbots ) * sqrt );
                
                let xFraction = xMod / sqrt;
                let yFraction = yMod / sqrt;
                
                let x = _poolCenter.x - GARDEN_OF_EDEN_RADIUS + xFraction * GARDEN_OF_EDEN_RADIUS * 2; 
                let y = _poolCenter.y - GARDEN_OF_EDEN_RADIUS + yFraction * GARDEN_OF_EDEN_RADIUS * 2; 
                 
                initialPosition.setXY( x, y ); 
                                       
                for (let g=0; g<NUM_GENES; g++)
                {
                    let value = ZERO; 
                    
                    if ( _neighborhoodAxis[g] )
                    {
                        value = ONE_HALF + ONE_HALF * Math.sin( ( _neighborhoodX[g] + ( - ONE_HALF + xFraction ) ) * NEIGHBORHOOD_FREQ  ); 
                    }
                    else
                    {
                        value = ONE_HALF + ONE_HALF * Math.sin( ( _neighborhoodY[g] + ( - ONE_HALF + yFraction ) ) * NEIGHBORHOOD_FREQ  ); 
                    }
                       
                    if ( value < ZERO ) { value = ZERO; }
                    if ( value > ONE  ) { value = ONE;  }
                    
                    let geneValue = Math.floor( ( BYTE_SIZE - 1 ) * value );
 
                    _myGenotype.setGeneValue( g, geneValue );
                }
            }
            //---------------------------------
            // froggies
            //---------------------------------
            else if ( mode === SimulationStartMode.FROGGIES )
            {
                _myGenotype.setToFroggy();      
            }
            //---------------------------------
            // tango
            //---------------------------------
            else if ( mode === SimulationStartMode.TANGO )
            {
                if ( i === 0 ) { _myGenotype.setToPreset( PRESET_GENOTYPE_DARWIN ); }
                if ( i === 1 ) { _myGenotype.setToPreset( PRESET_GENOTYPE_MENDEL ); }
                                                
                if ( i === 0 ) { initialPosition.setXY( _poolCenter.x - 100 * ONE_HALF, _poolCenter.y ); }
                if ( i === 1 ) { initialPosition.setXY( _poolCenter.x + 100 * ONE_HALF, _poolCenter.y ); }
            }
            //---------------------------------
            // race
            //---------------------------------
            else if ( mode === SimulationStartMode.RACE )
            {            
                if ( i === 0 ) { _myGenotype.setToPreset( PRESET_GENOTYPE_MARGULIS   ); }
                if ( i === 1 ) { _myGenotype.setToPreset( PRESET_GENOTYPE_MARGULIS   ); }
                if ( i === 2 ) { _myGenotype.setToPreset( PRESET_GENOTYPE_DAWKINS  ); }
                if ( i === 3 ) { _myGenotype.setToPreset( PRESET_GENOTYPE_DAWKINS  ); }

                if ( i === 0 ) { initialPosition.setXY( _poolCenter.x - FOOD_RACE_SIZE, _poolCenter.y + FOOD_RACE_SIZE      ); }
                if ( i === 1 ) { initialPosition.setXY( _poolCenter.x - FOOD_RACE_SIZE, _poolCenter.y + FOOD_RACE_SIZE - 60 ); }
                if ( i === 2 ) { initialPosition.setXY( _poolCenter.x + FOOD_RACE_SIZE, _poolCenter.y + FOOD_RACE_SIZE      ); }
                if ( i === 3 ) { initialPosition.setXY( _poolCenter.x + FOOD_RACE_SIZE, _poolCenter.y + FOOD_RACE_SIZE - 60 ); }
            }
            //-------------------------------------------------
            // big bang
            //-------------------------------------------------
            else if ( mode === SimulationStartMode.BIG_BANG )
            {            
                initialPosition.setXY( _poolCenter.x, _poolCenter.y );                
                _myGenotype.randomize();
            }
            //-------------------------------------------------
            // bad parents
            //-------------------------------------------------
            else if ( mode === SimulationStartMode.BAD_PARENTS )
            {            
                if ( i === 0 ) { _myGenotype.setToPreset( PRESET_GENOTYPE_TURING ); }
                if ( i === 1 ) { _myGenotype.setToPreset( PRESET_GENOTYPE_TURING ); }

                if ( i === 0 ) { initialPosition.setXY( _poolCenter.x - 200 * ONE_HALF, _poolCenter.y ); }
                if ( i === 1 ) { initialPosition.setXY( _poolCenter.x + 200 * ONE_HALF, _poolCenter.y ); }
            }
            
            /*
            //-------------------------------------------------
            // barrier
            //-------------------------------------------------
            else if ( mode === SimulationStartMode.BARRIER )
            {            
                if ( i === 0 ) { _myGenotype.setToPreset( PRESET_GENOTYPE_DAWKINS   ); }
                if ( i === 1 ) { _myGenotype.setToPreset( PRESET_GENOTYPE_WALLACE   ); }
                if ( i === 2 ) { _myGenotype.setToPreset( PRESET_GENOTYPE_MENDEL    ); }
                if ( i === 3 ) { _myGenotype.setToPreset( PRESET_GENOTYPE_WILSON    ); }
                if ( i === 4 ) { _myGenotype.setToPreset( PRESET_GENOTYPE_TURING    ); }
                if ( i === 5 ) { _myGenotype.setToPreset( PRESET_GENOTYPE_MARGULIS  ); }
                
                let s = 150;

                if ( i === 0 ) { initialPosition.setXY( _poolCenter.x + s * -1,  _poolCenter.y + s * -1 ); }
                if ( i === 1 ) { initialPosition.setXY( _poolCenter.x + s *  0,  _poolCenter.y + s * -1 ); }
                if ( i === 2 ) { initialPosition.setXY( _poolCenter.x + s *  1,  _poolCenter.y + s * -1 ); }
                if ( i === 3 ) { initialPosition.setXY( _poolCenter.x + s * -1,  _poolCenter.y + s *  1 ); }
                if ( i === 4 ) { initialPosition.setXY( _poolCenter.x + s *  0,  _poolCenter.y + s *  1 ); }
                if ( i === 5 ) { initialPosition.setXY( _poolCenter.x + s *  1,  _poolCenter.y + s *  1 ); }
            }
            */
            //---------------------------------
            // normal
            //---------------------------------
            else
            {
                _myGenotype.randomize();
            }
            
            //--------------------------------------------------
            // This sets all junk DNA to a value of 0!!!
            //--------------------------------------------------
            for (let g=NUM_GENES_USED; g<NUM_GENES; g++)
            {
                _myGenotype.setGeneValue( g, 0 );
            }            

            //--------------------------------------------------
            // create the swimbot
            //--------------------------------------------------
            _swimbots[i].create( i, initialAge, initialPosition, initialAngle, initialEnergy, _myGenotype, _embryology );	
            
            //------------------------------------------------------------------------------------
            // add the new swimbot to the family tree
            //------------------------------------------------------------------------------------
            _familyTree.addNode( i, NULL_INDEX, NULL_INDEX, _clock, this.getSwimbotGenes(i) );
        }	
        
        //--------------------------------------
        // initialize obstacle       
        //--------------------------------------  
		let end1 = new Vector2D();
		let end2 = new Vector2D();
		
		end1.setXY( 0.0, 0.0 );
		end2.setXY( 100.0, 0.0 );

        if ( mode === SimulationStartMode.BARRIER )
        {
    		end1.setXY( POOL_LEFT + POOL_WIDTH * 0.2, POOL_TOP + POOL_HEIGHT * 0.5 );
	    	end2.setXY( POOL_LEFT + POOL_WIDTH * 0.8, POOL_TOP + POOL_HEIGHT * 0.5 );
        }


        /*
        if ( mode === SimulationStartMode.RANDOM )
        {
    		end1.setXY( POOL_LEFT + POOL_WIDTH * 0.5, POOL_TOP + POOL_HEIGHT * 0.5 );
	    	end2.setXY( POOL_LEFT + POOL_WIDTH * 0.5, POOL_TOP + POOL_HEIGHT * 0.8 );
        }
        */
        
		_obstacle.setEndpointPositions( end1, end2 );
        
        for (let m=0; m<10; m++)
        {
            moveFoodBitsFromObstacle();
        }
        
		//---------------------------------
		// clear this!
		//---------------------------------
        setSelectedSwimbot( NULL_INDEX );
        
		//---------------------------------
		// set _simulationRunning to true
		//---------------------------------
		_simulationRunning = true;
	}
	
	
	//-------------------------------------
	this.randomizeNeighborhood = function()
	{
        for (let g=0; g<NUM_GENES; g++)
        {
            _neighborhoodX[g] = -ONE + Math.random() * 2.0;
            _neighborhoodY[g] = -ONE + Math.random() * 2.0;
            
            if ( Math.random() < ONE_HALF )
            {
                _neighborhoodAxis[g] = false;
            }		    		
            else
            {
                _neighborhoodAxis[g] = true;
            }
	    }
	}
	
	//------------------------------
	this.randomizeFood = function()
	{	
        _numFoodBits = INITIAL_NUM_FOODBITS;
    
        for (let f=0; f<_numFoodBits; f++)
        {
            _foodBits[f].initialize(f);
        }
	}
	
	
	//----------------------------------------------------------
	this.setFoodToNeighborhood = function( position, size )
	{		
        _numFoodBits = NUM_NEIGHBORHOOD_FOODBITS;
    
        for (let f=0; f<_numFoodBits; f++)
        {
            let sqrt = Math.floor( Math.sqrt( _numFoodBits ) );
            let xMod = f % sqrt;
            let yMod = Math.floor( ( f / _numFoodBits ) * sqrt );
            
            let xFraction = xMod / sqrt;
            let yFraction = yMod / sqrt;
            
            let foodBitPosition = new Vector2D();
            
            foodBitPosition.setXY
            (
                position.x - size + xFraction * size * 2,
                position.y - size + yFraction * size * 2
            ); 

            _foodBits[f].initialize(f);
            _foodBits[f].setPosition( foodBitPosition );
        }
	}
	
	

	//--------------------------------------------------
	this.setFoodToBarrierConfiguration = function()
	{	
        _numFoodBits = 40;
        let spread = 500;
        let p = new Vector2D();
        
        for (let f=0; f<_numFoodBits; f++)
        {
            _foodBits[f].initialize(f);
            p.setXY
            ( 
                _poolCenter.x + ( -spread * ONE_HALF + Math.random() * spread ), 
                _poolCenter.y + ( -spread * ONE_HALF + Math.random() * spread ) 
            );
             
            _foodBits[f].setPosition(p); 
        }

        this.setFoodSpread( MIN_FOOD_BIT_MAX_SPAWN_RADIUS + ( MAX_FOOD_BIT_MAX_SPAWN_RADIUS - MIN_FOOD_BIT_MAX_SPAWN_RADIUS ) * 0.2 );
	}
	


	//-------------------------------------------
	this.setFoodToBadParentsConfiguration = function()
	{	
        _numFoodBits = 5;

        let spread = 100;
        let p = new Vector2D();
        let f = -1;
    
        f++; _foodBits[f].initialize(f); p.setXY( _poolCenter.x, _poolCenter.y + spread * -1.0 ); _foodBits[f].setPosition(p); 
        f++; _foodBits[f].initialize(f); p.setXY( _poolCenter.x, _poolCenter.y + spread * -0.5 ); _foodBits[f].setPosition(p);
        f++; _foodBits[f].initialize(f); p.setXY( _poolCenter.x, _poolCenter.y + spread *  0.0 ); _foodBits[f].setPosition(p);
        f++; _foodBits[f].initialize(f); p.setXY( _poolCenter.x, _poolCenter.y + spread *  0.5 ); _foodBits[f].setPosition(p);
        f++; _foodBits[f].initialize(f); p.setXY( _poolCenter.x, _poolCenter.y + spread *  1.0 ); _foodBits[f].setPosition(p);

        
        /*
        let range = 100;
        let spread = 40.0;
    
        for (let f=0; f<_numFoodBits; f++)
        {
            let side = -range;
            
            if ( Math.random() > ONE_HALF ) { side = range; }
            let x = _poolCenter.x + side + Math.random() * spread;
            let y = _poolCenter.y + Math.random() * spread;
            foodBitPosition.setXY( x, y ); 
        
            _foodBits[f].initialize(f);
            _foodBits[f].setPosition( foodBitPosition );    
    	}
    	*/
    	
    	
        this.setFoodSpread( MIN_FOOD_BIT_MAX_SPAWN_RADIUS );
	}
	
	
	//-------------------------------------------
	this.setFoodToBangConfiguration = function()
	{	
        _numFoodBits = 500;
        let radius   = ONE;
        let fraction = ZERO;
        let thirdNum = _numFoodBits / 3.0;
        
        let foodBitPosition = new Vector2D();
    
        for (let f=0; f<_numFoodBits; f++)
        {            
            if ( f > _numFoodBits * 0.66666 )
            {
                fraction = ( f - ( _numFoodBits * 0.66666 ) ) / thirdNum;            
                radius = 600;
            }
            else if ( f > _numFoodBits * 0.333333 )
            {
                fraction = ( f - ( _numFoodBits * 0.333333 ) ) / thirdNum;            
                radius = 900;
            }
            else
            {
                fraction = f / thirdNum;
                radius = 300;
            }

            let radian = fraction * Math.PI * 2.0;
            
            
            // spiral
            /*
            radius *= 1.016;          
            let radian = f * 0.2;
            */
            
            
            let x = _poolCenter.x + radius * Math.sin( radian );
            let y = _poolCenter.y + radius * Math.cos( radian );
            
            foodBitPosition.setXY( x, y ); 

            _foodBits[f].initialize(f);
            _foodBits[f].setPosition( foodBitPosition );    
        }	
        
        this.setFoodGrowthDelay( DEFAULT_FOOD_REGENERATION_PERIOD );
        this.setFoodSpread( 20 );
	}

	//-------------------------------------------
	this.setFoodToRaceConfiguration = function()
	{	
       	_numFoodBits = 0;
       	
    	let p = new Vector2D();
    	let num = 200;
    	let xx = _poolCenter.x;
    	let yy = _poolCenter.y + FOOD_RACE_SIZE * 0.9;
    	
    	for (let f=0; f<num; f++)
    	{
            let fraction = f / num;

            p.x = xx + FOOD_RACE_SIZE * Math.cos( fraction * Math.PI ); 
            p.y = yy - FOOD_RACE_SIZE * Math.sin( fraction * Math.PI ); 

            _foodBits[ _numFoodBits ].initialize(f); 
            _foodBits[ _numFoodBits ].setPosition(p); 
            _numFoodBits ++;    	    
        }	

        num = 140;
        let r = 0;
    	xx = _poolCenter.x;
    	yy = _poolCenter.y - FOOD_RACE_SIZE * 0.4;

    	for (let f=0; f<num; f++)
    	{
            let ff = f * 0.1;
            
            r += 2;

            p.x = xx + r * Math.cos( ff ); 
            p.y = yy + r * Math.sin( ff ); 

            _foodBits[ _numFoodBits ].initialize(f); 
            _foodBits[ _numFoodBits ].setPosition(p); 
            _numFoodBits ++;    	    
        }	

    	//set the delay of food growth
        this.setFoodGrowthDelay( MAX_FOOD_REGENERATION_PERIOD );    	
        this.setFoodSpread( MIN_FOOD_BIT_MAX_SPAWN_RADIUS );
	}
	

	//--------------------------------
    this.setAttraction = function(a)
	{
	    //console.log( "GenePool.js: setAttraction: " + a );	
	    
	    _attractionCriterion = a;

        assert( _attractionCriterion >= 0,                 "genepool: setAttraction: _attractionCriterion >= 0" )
        assert( _attractionCriterion < NUM_ATTRACTIONS,    "genepool: setAttraction: _attractionCriterion < NUM_ATTRACTIONS" )

        for (let s=0; s<MAX_SWIMBOTS; s++)
        {
            _swimbots[s].setAttraction( _attractionCriterion );
        }	    
	}


	
	//--------------------------------------------------------------
	this.notifySwimbotDeathTime = function( deceasedSwimbotIndex )
	{
	    //console.log( deceasedSwimbotIndex + " just died" );
	    _familyTree.setDeathTime( deceasedSwimbotIndex, _clock );
	}
	
	
	//------------------------
	this.update = function()
	{	
		//-------------------------------------
		// get seconds since started...
		//-------------------------------------
		_seconds = ( (new Date).getTime() - _startTime ) / MILLISECONDS_PER_SECOND;
		
		//-------------------------------------
		// calculate frame rate...
		//-------------------------------------
        //_frameRate = _seconds - _previousTime;
		//_previousTime = _seconds;

        if ( _simulationRunning )
        {
            //--------------------
            // advance clock...
            //--------------------
            _clock ++;

            //----------------------
            // update swimbots...
            //----------------------
            this.updateSwimbots();

            //------------------
            // update food
            //------------------
            this.updateFood();
        }
                
		//---------------------------
		// update camera...
		//---------------------------
		_camera.update( _seconds );

		if ( _camera.getScale() > LEVEL_OF_DETAIL_THRESHOLD ) 
		{
			_levelOfDetail = SWIMBOT_LEVEL_OF_DETAIL_LOW;
		}
		else 
		{
			_levelOfDetail = SWIMBOT_LEVEL_OF_DETAIL_HIGH;
		}
		
		//---------------------------
		// update camera tracking...
		//---------------------------
		if ( _camera.getIsTracking() )
        {
            if ( _clock % CAMERA_TRACKING_UPDATE_PERIOD === 0 )
            {
            
/*            
//testing this...make sure it works!            
if ( _selectedSwimbot != NULL_INDEX )
{
    _camera.setTrackingPosition( _viewControl.getTrackingPosition( _selectedSwimbot ) );
}            
else
{
    _camera.stopTracking();
}
*/                 
                 //this is a test...don't delete yet...
                 //_camera.setTrackingScale( _viewControl.getTrackingScale() );                                     
            }
            
            
            
            
            //console.log( "t" );
            
            // I think here I should check to see if the selected swimbot is no longer valid, and then stop tracking...
        }
        
		//----------------------------------
		// apply touch to camera navigation
		//----------------------------------
		this.updateCameraNavigation();
    
        //-------------------------------------------------------------
        // update touch state 
        // (important for generating state for touch velocity, etc.)
        // also, important to call this after updateCameraNavigation
        //-------------------------------------------------------------
        _touch.update();

		//---------------------------
		// render everything...
		//---------------------------
		this.render();
        
		//---------------------------
		// trigger next update...
		//---------------------------
        this.timer = setTimeout( "genePool.update()", MILLISECONDS_PER_UPDATE );
	}




	
	//--------------------------------
	this.updateSwimbots = function()
	{		
        for (let s=0; s<MAX_SWIMBOTS; s++)
        {
            if ( _swimbots[s].getAlive() )
            {
                _swimbots[s].update();
                
                //-----------------------------------------------------------------
                // provide aspects of the environment for the swimbot to perceive
                //-----------------------------------------------------------------
                if ( _swimbots[s].getIsLookingForSensoryInput() )
                {
                    this.giveSwimbotNearbyEnvironmentalStimuli(s);
                }

                //--------------------------------------------------------------------------------------------------------
                // check for obstacle collision....
                //--------------------------------------------------------------------------------------------------------
                if ( _obstacle.getCollision( _swimbots[s].getPosition(), _swimbots[s].getBoundingRadius() * ONE_HALF ) )
                {
                    // only call this IMMEDIATELY after calling "_obstacle.getCollision"...
                    _vectorUtility = _obstacle.getCurrentCollisionForce();
                    _vectorUtility.scale( 1.2 );
                    _swimbots[s].addForce( _vectorUtility );
                }

                //-------------------------------------
                // eating
                //-------------------------------------
                if ( _swimbots[s].getIsTryingToEat() )
                {
                    let eatenFoodBit = _swimbots[s].eatChosenFoodBit();
                }
                
                //----------------------------------------
                // giving birth to a new swimbot
                //----------------------------------------
                if ( _swimbots[s].getIsTryingToMate() )
                {
                    let newBornSwimbotIndex = this.findLowestDeadSwimbotInArray();

                    //---------------------------------------
                    // a few quick reality checks here...
                    //---------------------------------------
                    if (( newBornSwimbotIndex != NULL_INDEX )
                    &&  ( _swimbots[s].getChosenMateIndex() != NULL_INDEX ))
                    {
                        let chosenMateIndex = _swimbots[s].getChosenMateIndex();
                        //console.log( " chosenMateIndex = " + chosenMateIndex );

                        _potentialMate = _swimbots[ chosenMateIndex ];

                        assert( _potentialMate != null, "genepool: updateSwimbots: _potentialMate != null" );

                        if ( _potentialMate.getAlive() )
                        {
                            assert( _myGenotype    != null, "genepool: updateSwimbots: _myGenotype    != null" );
                            assert( _mateGenotype  != null, "genepool: updateSwimbots: _mateGenotype  != null" );

                            //------------------------------------------------
                            // collect genes from me and my chosen mate 
                            //------------------------------------------------
                            _myGenotype = _swimbots[s].getGenotype();
                            _mateGenotype = _potentialMate.getGenotype();
                            
                            //console.log( "NON_REPRODUCING_JUNK_DNA_LIMIT = " + NON_REPRODUCING_JUNK_DNA_LIMIT );                            
                            
                            if ( this.getJunkDnaSimilarity( _myGenotype, _mateGenotype ) > NON_REPRODUCING_JUNK_DNA_LIMIT )
                            {
                                //-----------------------------------
                                // recombine genes for the child 
                                //-----------------------------------
                                assert( _childGenotype != null, "_childGenotype != null" );

                                _childGenotype.setAsOffspring( _myGenotype, _mateGenotype );

                                //------------------------------------------------
                                // collect energy from parents for child energy
                                //------------------------------------------------
                                let myEnergyContribution    = _swimbots[s].contributeToOffspring();
                                let mateEnergyContribution  = _potentialMate.contributeToOffspring();
                                let energyToOffspring       = myEnergyContribution + mateEnergyContribution;     
                            
                                //console.log( "energyToOffspring = " + energyToOffspring );
                                //assert( energyToOffspring <= DEFAULT_SWIMBOT_HUNGER_THRESHOLD, "energyToOffspring <= DEFAULT_SWIMBOT_HUNGER_THRESHOLD" );                       

                                //----------------------------------------------------------------------------------------
                                // set birth position
                                //----------------------------------------------------------------------------------------
                                let diffX = _potentialMate.getGenitalPosition().x - _swimbots[s].getGenitalPosition().x;
                                let diffY = _potentialMate.getGenitalPosition().y - _swimbots[s].getGenitalPosition().y;
                            
                                _vectorUtility.x = _swimbots[s].getGenitalPosition().x + diffX * ONE_HALF;
                                _vectorUtility.y = _swimbots[s].getGenitalPosition().y + diffY * ONE_HALF;

                                //---------------------------------------------
                                // pool effect
                                //---------------------------------------------
                                _pool.endTouch( _vectorUtility, _seconds );
                                                        
                                //--------------------------------------------
                                // create the child swimbot
                                //--------------------------------------------
                                let initialAngle = getRandomAngleInDegrees();                                                        
                                _swimbots[ newBornSwimbotIndex ].create( newBornSwimbotIndex, 0, _vectorUtility, initialAngle, energyToOffspring, _childGenotype, _embryology )
 
                                //--------------------------------------------------
                                // add the new swimbot to the family tree
                                //--------------------------------------------------
                                _familyTree.addNode( newBornSwimbotIndex, s, chosenMateIndex, _clock, this.getSwimbotGenes( newBornSwimbotIndex ) );
                    
                            } // if ( getJunkDnaDistance( _myGenotype, _mateGenotype ) > NON_REPRODUCING_JUNK_DNA_LIMIT )
                         }   // if ( _potentialMate.getAlive() )                     
                    }       //  if (( newBornSwimbotIndex != -1 ) &&  ( swimbot[s].getChosenMateIndex() != -1 ))
                }          //   if ( swimbot[s].isTryingToMate() )
            }             //    if ( _swimbots[s].getAlive() )
            else
            {
                //-------------------------------------------------------------
                // In case the selected swimbot has just died, de-select it!
                //-------------------------------------------------------------
                if ( _selectedSwimbot === s )
                {
                    setSelectedSwimbot( NULL_INDEX );
                }                     
            }
        } // for (let s=0; s<MAX_SWIMBOTS; s++)
        
        //-------------------------------------------------
        // if showing mutual love....
        //-------------------------------------------------
        if ( _viewControl.getMode() === ViewMode.MUTUAL )
        {
            let lover1 = _viewControl.getLover1Index();
            let lover2 = _viewControl.getLover2Index();
            
            if (( lover1 != NULL_INDEX )
            &&  ( lover2 != NULL_INDEX ))
            {                
                //---------------------------------------------
                // show the mouths and genitals
                //---------------------------------------------
                _swimbots[ lover1 ].setRenderingGoals( true );
                _swimbots[ lover2 ].setRenderingGoals( true );

                //-----------------------------------------------------------------------------------
                // if either of the lovers stop pursuing the other then cancel mutual view mode
                //-----------------------------------------------------------------------------------
                if (( _swimbots[ lover1 ].getChosenMateIndex() != lover2 )
                ||  ( _swimbots[ lover2 ].getChosenMateIndex() != lover1 ))
                {
                    //_viewControl.setMode( ViewMode.NULL, 0 );
//this.clearViewMode();
_camera.stopTracking();
                }
            }	
            else
            {
                _camera.stopTracking();
            }
        }
    }
    
    
    
    
    //--------------------------------------------------------
	this.getJunkDnaSimilarity = function( genotype1, genotype2 )
	{		
	    let diff = ZERO;
	    let num = 0;
        for (let g=NUM_GENES_USED; g<NUM_GENES; g++)
        {
            diff += Math.abs( genotype1.getGeneValue(g) - genotype2.getGeneValue(g) ) / BYTE_SIZE;
            num ++;
        }          
        
        let similarity = ONE - ( diff / num );  
        
        //console.log( similarity );
        
	    return similarity;
	}
    
    
    
    
    //---------------------------------------------
	this.findLowestDeadSwimbotInArray = function()
	{		
        let s = NULL_INDEX;
        let t = NULL_INDEX;

        let looking = true;
        while ( looking )
        {
            t++;

            if ( ! _swimbots[t].getAlive() )
            {
                s = t;
                assert( s < MAX_SWIMBOTS, "s < MAX_SWIMBOTS" );
                looking = false;
            }

            if ( t >= MAX_SWIMBOTS - 1 )
            {
                looking = false;
            }
        }

        return s;
    }


    //--------------------------------------------------------
	this.giveSwimbotNearbyEnvironmentalStimuli = function(s)
	{		
	    //------------------------------------------------------
	    // collect the array of nearby visible swimbots...
	    //------------------------------------------------------
        _numNearbySwimbots = 0;
        for (let o=0; o<MAX_SWIMBOTS; o++)
        {
            if (( s != o )
            && ( _swimbots[o].getAlive() )
            && ( _numNearbySwimbots < BRAIN_MAX_PERCEIVED_NEARBY_SWIMBOTS ))
            {
                let distanceSquared = _swimbots[s].getGenitalPosition().getDistanceSquaredTo( _swimbots[o].getGenitalPosition() );
                
                if ( distanceSquared < SWIMBOT_VIEW_RADIUS * SWIMBOT_VIEW_RADIUS )
                {                
                    if ( !_obstacle.getObstruction( _swimbots[s].getGenitalPosition(), _swimbots[o].getGenitalPosition() ) )
                    { 
                        _nearbySwimbotsArray[ _numNearbySwimbots ] = _swimbots[o];
                        _numNearbySwimbots ++;
                    }
                }
            }
        }

        //------------------------------------------------------
        // find the closest food bit
        //------------------------------------------------------
        let foundFoodBit = false;
        let smallestDistance = Number.MAX_SAFE_INTEGER;
        for (let f=0; f<MAX_FOODBITS; f++)
        { 
            let nutritionOK = true;

            if ( _foodBits[f].getNutrition() != _swimbots[s].getPreferredNutrition() )
            {
//if ( Math.random() < SWIMBOT_NUTRITION_PICKINESS )
                {
                    nutritionOK = false;
                }
            }

            if ( nutritionOK )
            {
                if ( _foodBits[f].getAlive() )
                {
                    let viewDistance = _swimbots[s].getMouthPosition().getDistanceTo( _foodBits[f].getPosition() );
                
                    if ( viewDistance < SWIMBOT_VIEW_RADIUS )
                    {                                
                        let distance = viewDistance / SWIMBOT_VIEW_RADIUS;
                    
                        if ( distance < smallestDistance )
                        {
                            if ( !_obstacle.getObstruction( _swimbots[s].getMouthPosition(), _foodBits[f].getPosition() ) )
                            { 
                                smallestDistance = distance;
                                _chosenFoodBit = _foodBits[f];
                                foundFoodBit = true;
                            }
                        }
                    }
                }
            }
        }

	    //------------------------------------------------------------------------------
	    // pass these environmental stimuli along to the swimbot...
	    //------------------------------------------------------------------------------
        _swimbots[s].setEnvironmentalStimuli( _numNearbySwimbots, _nearbySwimbotsArray, foundFoodBit, _chosenFoodBit );
     }
     
    
    
    
	//----------------------------
	this.updateFood = function()
	{		
        //-------------------------------------
        // general update for all food bits
        //-------------------------------------
        for (let f=0; f<MAX_FOODBITS; f++)
        {
            if ( _foodBits[f].getAlive() )
            {
                _foodBits[f].update();
            }
	    }
	    
        //-------------------------------------
        // periodically regenerate food
        //-------------------------------------
        assert( _foodRegenerationPeriod > 0, "GenePool:updateFood:_foodRegenerationPeriod > 0"  );
        
        if ( _clock % _foodRegenerationPeriod == 0 )
        {
            let childFoodBitIndex = this.findLowestDeadFoodBitInArray();
            
            if ( childFoodBitIndex != NULL_INDEX )
            {
                //console.log( childFoodBit );

                assert( ! _foodBits[ childFoodBitIndex ].getAlive(), "GenePool:updateFood: ! _foodBits[ childFoodBit ].getAlive" );

                let parentFoodBitIndex = this.findRandomLivingFoodBit();
                if ( parentFoodBitIndex != NULL_INDEX )
                {
                    //console.log( parentFoodBitIndex );

                    assert( childFoodBitIndex != _foodBits[ parentFoodBitIndex ].getIndex(), "genepool.js: updateFood: childFoodBitIndex != _foodBits[ parentFoodBitIndex ].getIndex()" );
                    
                    //-------------------------------------------------------------------
                    // make sure the new food bit position is not obscured by
                    // the obstacle. If it is, keep trying new spawn positions...
                    //-------------------------------------------------------------------
                    let looking = true;
                    let num = 0;
                    while ( looking )                    
                    {
                        //---------------------------------------------------
                        // spawn the child to new position near parent...
                        //---------------------------------------------------
                        _foodBits[ childFoodBitIndex ].spawnFromParent( _foodBits[ parentFoodBitIndex ], childFoodBitIndex );

                        if ( !_obstacle.getObstruction( _foodBits[ parentFoodBitIndex ].getPosition(), _foodBits[ childFoodBitIndex ].getPosition() ) )
                        {
                            looking = false;
                        }
                        
                        num ++;
                        if ( num > 10 )
                        {
                            looking = false;
                        }                        
                    }
                }
            }
        }
    }
    
	//--------------------------------
	this.setFoodSpread = function(s)
	{
	    //console.log( "setFoodSpread: " + s );
	    
        assert( s >= MIN_FOOD_BIT_MAX_SPAWN_RADIUS, "GenePool: setFoodSpread: s >= MIN_FOOD_BIT_MAX_SPAWN_RADIUS" )
        assert( s <= MAX_FOOD_BIT_MAX_SPAWN_RADIUS, "GenePool: setFoodSpread: s <= MAX_FOOD_BIT_MAX_SPAWN_RADIUS" )

        _foodSpread = s;

        for (let f=0; f<MAX_FOODBITS; f++)
        {
            _foodBits[f].setMaxSpawnRadius( _foodSpread );
        }
    }
    
	//--------------------------------
	this.setFoodBitEnergy = function(e)
	{
	    //console.log( "setFoodBitEnergy: " + e );	

        assert( e >= MIN_FOOD_BIT_ENERGY, "GenePool: setFoodBitEnergy: e >= MIN_FOOD_BIT_ENERGY" );
        assert( e <= MAX_FOOD_BIT_ENERGY, "GenePool: setFoodBitEnergy: e <= MAX_FOOD_BIT_ENERGY" );

        _foodBitEnergy = e;

        for (let f=0; f<MAX_FOODBITS; f++)
        {
            _foodBits[f].setEnergy( _foodBitEnergy );
        }
    }
    
	//--------------------------------
	this.setHungerThreshold = function(h)
	{
	    //console.log( "setHungerThreshold: " + h );	

        assert( h >= MIN_SWIMBOT_HUNGER_THRESHOLD, "GenePool: setHungerThreshold: h >= MIN_SWIMBOT_HUNGER_THRESHOLD" );
        assert( h <= MAX_SWIMBOT_HUNGER_THRESHOLD, "GenePool: setHungerThreshold: h <= MAX_SWIMBOT_HUNGER_THRESHOLD" );

	    _hungerThreshold = h;
	    
        for (let s=0; s<MAX_SWIMBOTS; s++)
        {
			_swimbots[s].setHungerThreshold( _hungerThreshold );
        }        	
    }
    
	//--------------------------------------
	this.setOffspringEnergyRatio = function(e)
	{
        //console.log( "setOffspringEnergyRatio: " + e );
	    
        assert( e >= MIN_CHILD_ENERGY_RATIO, "GenePool: setOffspringEnergyRatio: e >= MIN_CHILD_ENERGY_RATIO" );
        assert( e <= MAX_CHILD_ENERGY_RATIO, "GenePool: setOffspringEnergyRatio: e <= MAX_CHILD_ENERGY_RATIO" );
	    
	    GLOBAL_childEnergyRatio = e;
    }
    
	//----------------------------------
	this.setFoodGrowthDelay = function(d)
	{
	    //console.log( "setFoodGrowthDelay: " + d );
	
        assert( d >= MIN_FOOD_REGENERATION_PERIOD, "setFoodGrowthDelay: d >= MIN_FOOD_REGENERATION_PERIOD" )
        assert( d <= MAX_FOOD_REGENERATION_PERIOD, "setFoodGrowthDelay: d <= MAX_FOOD_REGENERATION_PERIOD" )

	    _foodRegenerationPeriod = d;
    }

	
	//---------------------------------------
	this.findRandomLivingFoodBit = function()
	{		
        let f = NULL_INDEX;
        let numTimesLooking = 200;
        let i = 0;
        let looking = true;
        
        while ( looking )
        {
            let testIndex = Math.floor( Math.random() * ( MAX_FOODBITS - 1 ) );
            
            assert( testIndex < MAX_FOODBITS, "Genepool.js: testIndex < MAX_FOODBITS" );
            
            if ( _foodBits[ testIndex ].getAlive() )
            {
                f = testIndex;
                looking = false;
            }

            i ++;
            if ( i > numTimesLooking )
            {
                looking = false;
                //console.log( "failed to findRandomLivingFoodBit" );
            }
        }

        assert( f < MAX_FOODBITS, "Genepool.js: f < MAX_FOODBITS" );

        return f;
    }
    

	
	//----------------------------------------
	this.findLowestDeadFoodBitInArray = function()
	{		
        let f = NULL_INDEX;
        let t = NULL_INDEX;

        let looking = true;
        
        while ( looking )
        {
            t ++;

            if ( t < MAX_FOODBITS )
            {
                if ( ! _foodBits[t].getAlive() )
                {
                    f = t;
                    assert( f < MAX_FOODBITS, "Genepool.js: findLowestDeadFoodBitInArray: f < MAX_FOODBITS" );
                    looking = false;
                }
            }
            else
            {
                looking = false;
            }
         }

        return f;
    }

    
	//-------------------------------------------------
    this.createNewSwimbotWithGenes = function( genes )
    {
        let index = this.findLowestDeadSwimbotInArray();

        assert( index != NULL_INDEX, "GenePool.createNewSwimbotWithGenes: index != NULL_INDEX" );
           
        _myGenotype.setGenes( genes );
    
        let initialAge      = FULLY_GROWN_AGE;          
        let initialAngle    = ZERO;
        let initialEnergy   = DEFAULT_SWIMBOT_HUNGER_THRESHOLD;
        
        _swimbots[ index ].create( index, initialAge, _camera.getPosition(), initialAngle, initialEnergy, _myGenotype, _embryology );			

        //-------------------------------------------------------
        // add the new swimbot to the family tree
        //-------------------------------------------------------
        _familyTree.addNode( index, NULL_INDEX, NULL_INDEX, _clock, this.getSwimbotGenes( index ) );

        setSelectedSwimbot( index );
    }


	//--------------------------------
    this.setPoolData = function( data )
    {
        //console.log( "loading pool file:" );
        //console.log( data );
                
        //-------------------------------------------
        // frozen or running?
        //-------------------------------------------
        _simulationRunning = data.simulationRunning;
        
        //-------------------------------
        // load food
        //-------------------------------
        _numFoodBits = data.numFoodBits;
        
        for (let f=0; f<MAX_FOODBITS; f++)
        {
            _foodBits[f].kill();
        }        

        for (let f=0; f<data.numFoodBits; f++)
        {
            let id = data.foodBitArray[f].id;
            
            _foodBits[ id ].initialize();
                
            let foodBitPosition = new Vector2D();
            foodBitPosition.setXY( data.foodBitArray[f].x, data.foodBitArray[f].y );
            _foodBits[ id ].setPosition( foodBitPosition );                
        }        

        //---------------------------------
        // load swimbots 
        //---------------------------------
        _numSwimbots = data.numSwimbots;

        for (let s=0; s<MAX_SWIMBOTS; s++)
        {
            _swimbots[s].die();
        }
       
        //----------------------------------------
        // reset family tree array
        //----------------------------------------  
        _familyTree.reset();

        //----------------------------------------
        // create the swimbots
        //----------------------------------------  
        for (let s=0; s<data.numSwimbots; s++)
        {
            let id = data.swimbotArray[s].id;
            
            let swimbotPosition = new Vector2D();
            swimbotPosition.setXY( data.swimbotArray[s].x, data.swimbotArray[s].y );  

            let loadedGenotype = new Genotype();
            loadedGenotype.setGenes( data.swimbotArray[s].genes );
            
            assert( id === s, "assert: id === s" );

            _swimbots[ id ].create
            ( 
                //s,
                id, 
                data.swimbotArray[s].age, 
                swimbotPosition, 
                data.swimbotArray[s].angle, 
                data.swimbotArray[s].energy, 
                loadedGenotype,
                _embryology 
            );		
            
            //------------------------------------------------------------------------------------
            // add the new swimbot to the family tree
            //------------------------------------------------------------------------------------
            _familyTree.addNode( id, NULL_INDEX, NULL_INDEX, _clock, this.getSwimbotGenes( id ) );
        }
        
        //----------------------------------------
        // camera
        //----------------------------------------        
        let cameraPosition = new Vector2D();
        cameraPosition.setXY( data.cameraX, data.cameraY );
        _camera.setPosition( cameraPosition );
        _camera.setScale( data.cameraScale );
        
        //------------------------
        // set view control
        //------------------------          
        _viewControl.reset();
                
        //--------------------------------------------------------------
        // set tweakers
        //--------------------------------------------------------------           
        this.setFoodGrowthDelay     ( data.foodRegenerationPeriod   );
        this.setFoodSpread          ( data.foodSpread               );
        this.setFoodBitEnergy       ( data.foodBitEnergy            );
        this.setHungerThreshold     ( data.hungerThreshold          );
        this.setAttraction          ( data.attractionCriterion      );
        this.setOffspringEnergyRatio( data.childEnergyRatio         );
        
        _renderingGoals = data.renderingGoals;        


        //--------------------------------------------------------------
        // set obstacle
        //--------------------------------------------------------------   
        //to do        
		let end1 = new Vector2D();
		let end2 = new Vector2D();

		if ( data.obstacleEnd1X === undefined ) { console.log( data.obstacleEnd1X ); }
		if ( data.obstacleEnd1Y === undefined ) { console.log( data.obstacleEnd1Y ); }
		if ( data.obstacleEnd2X === undefined ) { console.log( data.obstacleEnd2X ); }
		if ( data.obstacleEnd2Y === undefined ) { console.log( data.obstacleEnd2Y ); }
		
		if (( data.obstacleEnd1X != undefined )
		&&  ( data.obstacleEnd1Y != undefined )
		&&  ( data.obstacleEnd2X != undefined )
		&&  ( data.obstacleEnd2Y != undefined ))
		{
    		end1.setXY( data.obstacleEnd1X, data.obstacleEnd1Y );
    		end2.setXY( data.obstacleEnd2X, data.obstacleEnd2Y );
        }
        else
        {
            //console.log( data.obstacleEnd1X + ", " + data.obstacleEnd1Y );		
            //console.log( data.obstacleEnd2X + ", " + data.obstacleEnd2Y );		

    		end1.setXY( 100, 100 );
    		end2.setXY( 200, 100 );
        }
        		
		
        _obstacle.setEndpointPositions( end1, end2 );
        
		//---------------------------------
		// start time
		//---------------------------------
		_startTime = (new Date).getTime();

		//----------------------------------
		// get seconds
		//----------------------------------
		_seconds = ( (new Date).getTime() - _startTime ) / MILLISECONDS_PER_SECOND;

		//----------------------------------
		// initialize pool
		//----------------------------------
	    _pool.initialize( _seconds );
	    
		//---------------------------------
		// clear this!
		//---------------------------------
        setSelectedSwimbot( NULL_INDEX );
        
		//---------------------------------
		// set clock to 0
		//---------------------------------
		_clock = 0;
    }
    
    //--------------------------------------
    // set selected swimbot
    //--------------------------------------
    function setSelectedSwimbot( index )
    {
        _selectedSwimbot = index;
        
// hey...maybe I need to turn off any other things that assume there is a selected swimbot...here        
        
    }
    
    
    
	//-------------------------------------
	this.makeNewRandomSwimbot = function()
	{		
	    let index = this.findLowestDeadSwimbotInArray();
	    
	    if ( index != NULL_INDEX )
	    {
            let initialAge      = FULLY_GROWN_AGE;          
            let initialAngle    = getRandomAngleInDegrees(); //-180.0 + Math.random() * 360.0;
            let initialEnergy   = DEFAULT_SWIMBOT_HUNGER_THRESHOLD;
        
            _myGenotype.randomize();
        
            _swimbots[ index ].create( index, initialAge, _camera.getPosition(), initialAngle, initialEnergy, _myGenotype, _embryology );			

            //--------------------------------------------------
            // add the new swimbot to the family tree
            //--------------------------------------------------
            _familyTree.addNode( index, NULL_INDEX, NULL_INDEX, _clock, this.getSwimbotGenes( index ) );

            setSelectedSwimbot( index )
        }
        else
        {
            console.log( "cannot make random swimbot" );
        }
    }

	//---------------------------------------
	this.zapSwimbot = function( ID, amount )
	{		
        assert( ID != NULL_INDEX, "genepool: zapSwimbot: ID != NULL_INDEX" );
        _swimbots[ ID ].zap( _embryology, amount );
        _pool.endTouch( _swimbots[ ID ].getPosition(), _seconds );
    }

	//------------------------------------
	this.randomizeSwimbot = function( ID )
	{	
        assert( ID != NULL_INDEX, "genepool: randomizeSwimbot: ID != NULL_INDEX" );
	    this.zapSwimbot( ID, ONE );
	    _pool.endTouch( _swimbots[ ID ].getPosition(), _seconds );
	}
	
	
	//----------------------------------
	this.cloneSwimbot = function( ID )
	{		
        assert( ID != NULL_INDEX, "genepool: cloneSwimbot: ID != NULL_INDEX" );

        let index = this.findLowestDeadSwimbotInArray();
        
        if ( index != NULL_INDEX )
        {
            //let initialAge      = FULLY_GROWN_AGE;          
            let initialAge      = _swimbots[ ID ].getAge();
            let initialAngle    = _swimbots[ ID ].getAngle();
            let initialEnergy   = _swimbots[ ID ].getEnergy() * ONE_HALF;
            let genotype        = _swimbots[ ID ].getGenotype();

            let initialPosition = new Vector2D();
            let p = new Vector2D();
            initialPosition.copyFrom( _swimbots[ ID ].getPosition() );
            p.copyFrom( initialPosition );
        
            initialPosition.x += CLONE_SEPARATION;
            p.x -= CLONE_SEPARATION;
        
            _swimbots[ ID ].setPosition(p);
            _swimbots[ ID ].setEnergy( initialEnergy ); // the clonee gets its energy halved as well as the cloned
            _swimbots[ index ].create( index, initialAge, initialPosition, initialAngle, initialEnergy, genotype, _embryology );			

            //--------------------------------------------------
            // add the new swimbot to the family tree
            //--------------------------------------------------
            _familyTree.addNode( index, NULL_INDEX, NULL_INDEX, _clock, this.getSwimbotGenes( index ) );

            setSelectedSwimbot( index )
        }
    }


	//------------------------------------
	this.killSwimbot = function( ID )
	{		
        assert( ID != NULL_INDEX, "genepool: killSwimbot: ID != NULL_INDEX" );

        //---------------------------------------------------------------------------
        // if this swimbot is one of the mutal lovers, then turn off mutal mode....
        //---------------------------------------------------------------------------
        if ( _viewControl.getMode() === ViewMode.MUTUAL )
        {
            //console.log( "yea" );
            if (( _viewControl.getLover1Index() === ID )             
            ||  ( _viewControl.getLover2Index() === ID ))
            {   
                //_viewControl.setMode( ViewMode.NULL );
                this.clearViewMode();
             }
        }
  
        //------------------------------
        // deselect, if selected....
        //------------------------------
        if ( _selectedSwimbot === ID )
        {
            setSelectedSwimbot( NULL_INDEX );
        }

        //------------------------------
        // kill that mofo....
        //------------------------------
        _swimbots[ ID ].die();
        
        //------------------------------
        // add a pool effect....
        //------------------------------
        _pool.endTouch( _swimbots[ ID ].getPosition(), _seconds );
    }
    
    
	//----------------------------------------
	this.updateCameraNavigation = function()
	{		
        if ( _panningLeft  ) {  _camera.panLeft (); }	
        if ( _panningRight ) {  _camera.panRight(); }	
        if ( _panningUp    ) {  _camera.panUp   (); }	
        if ( _panningDown  ) {  _camera.panDown (); }	
        if ( _zoomingIn    ) {  _camera.zoomIn  (); }	
        if ( _zoomingOut   ) {  _camera.zoomOut (); }	
	}
	


	//-----------------------------------------
	this.setSimulationRunning = function(s)
	{	
        _simulationRunning = s;
    }
    

	//-----------------------------------
	this.toggleGoalOverlay = function()
	{	
        if ( _renderingGoals )
        {
            _renderingGoals = false;
        }
        else
        {
            _renderingGoals = true;
        }
        
        for (let s=0; s<MAX_SWIMBOTS; s++)
        {
            _swimbots[s].setRenderingGoals( _renderingGoals );
        }
    }    
    
	//---------------------------------------------------------------------
	// shift any food bit that maye be overlapping with the obstacle...
	//---------------------------------------------------------------------
    function moveFoodBitsFromObstacle()
    {
        for (let f=0; f<MAX_FOODBITS; f++)
        {
            if ( _foodBits[f].getAlive() )
            {
                if ( _obstacle.getCollision( _foodBits[f].getPosition(), 30 ) )
                {
                    _vectorUtility = _obstacle.getCurrentCollisionForce();
                    _vectorUtility.scale( 5 );
                    _foodBits[f].shiftPosition( _vectorUtility );

                }
            }                        
        }             
    }

	
	//-------------------------
	this.render = function()
	{
		//----------------------------------------------------------
		// set transform according to camera
		//----------------------------------------------------------
        let nx = _camera.getPosition().x / _camera.getXDimension();
        let ny = _camera.getPosition().y / _camera.getYDimension();

		let xTranslation = ( ONE_HALF - nx ) * _canvasWidth;
		let yTranslation = ( ONE_HALF - ny ) * _canvasHeight;

        let xScale = _canvasWidth  / _camera.getXDimension();
        let yScale = _canvasHeight / _camera.getYDimension();

		_canvas.translate( xTranslation, yTranslation );
        _canvas.scale( xScale, yScale ); 

		//----------------------------------
		// render the pool
		//----------------------------------
        _pool.render( _seconds, _camera );
        
		//-------------------------
		// render obstacle
		//-------------------------
		_obstacle.render( _camera );

		//-------------------------
		// render food
		//-------------------------
		this.renderFoodBits();

		//----------------------------------
		// render swimbots
		//----------------------------------
        for (let s=0; s<MAX_SWIMBOTS; s++)
        {
			if ( _swimbots[s].getAlive() )
			{			
                if ( _camera.getWithinView( _swimbots[s].getPosition(), _swimbots[s].getBoundingRadius() ) )
				{ 
                    _swimbots[s].render( _levelOfDetail );

                    if (( s === _mousedOverSwimbot )
                    ||  ( s === _selectedSwimbot   ))
                    {
                        if ( s === _selectedSwimbot )
                        {
                            //_swimbots[s].renderSelectOutline( _camera.getScale() );
                            //renderSwimbotSelectCircle( s, false );
                            renderSelectCircle( _swimbots[s].getPosition().x, _swimbots[s].getPosition().y, _swimbots[s].getSelectRadius(), false );
                        }
                        else
                        {
                            //_swimbots[s].renderMousedOverOutline( _camera.getScale() );
                            //renderSwimbotSelectCircle( s, true );
                            renderSelectCircle( _swimbots[s].getPosition().x, _swimbots[s].getPosition().y, _swimbots[s].getSelectRadius(), true );
                        }

                        _swimbots[s].setRenderingGoals( true );

                        if ( DEBUG_SHOW_SWIMBOT_TRAIL )
                        {
                            this.showSwimbotTrail(s);
                        }
                    }
                    else
                    {
                        if ( ! _renderingGoals )
                        {
                            _swimbots[s].setRenderingGoals( false );
                        }
					}
				}
			}
		}
		
		//-----------------------------------------------------------------------
		// when view is in mutual love mode, show a line between the lovers...
		//-----------------------------------------------------------------------
        if ( _viewControl.getMode() === ViewMode.MUTUAL )
        {
            //console.log( "mutual" );            
            //console.log( _viewControl.getLover1Index() + ", " + _viewControl.getLover2Index() );            
            if (( _viewControl.getLover1Index() != NULL_INDEX )
            &&  ( _viewControl.getLover2Index() != NULL_INDEX ))
            {
                _canvas.lineCap = "round";
                _canvas.lineWidth = 5; 
                _canvas.strokeStyle = "rgba( 200, 200, 200, 0.06 )";   
                _canvas.moveTo( _swimbots[ _viewControl.getLover1Index() ].getGenitalPosition().x, _swimbots[ _viewControl.getLover1Index() ].getGenitalPosition().y );
                _canvas.lineTo( _swimbots[ _viewControl.getLover2Index() ].getGenitalPosition().x, _swimbots[ _viewControl.getLover2Index() ].getGenitalPosition().y );
                _canvas.stroke();

                _canvas.lineWidth = 2; 
                _canvas.strokeStyle = "rgba( 255, 255, 200, 0.06 )";   
                _canvas.moveTo( _swimbots[ _viewControl.getLover1Index() ].getGenitalPosition().x, _swimbots[ _viewControl.getLover1Index() ].getGenitalPosition().y );
                _canvas.lineTo( _swimbots[ _viewControl.getLover2Index() ].getGenitalPosition().x, _swimbots[ _viewControl.getLover2Index() ].getGenitalPosition().y );
                _canvas.stroke();
            }		
        }

		//---------------------
		// render camera
		//---------------------
		//renderCamera();

		//---------------------
		// reset transform
		//---------------------
        _canvas.resetTransform();
		
        /*
		//----------------------------------
		// render framerate
		//----------------------------------
        _canvas.font = "14px Arial";
		_canvas.fillStyle = "rgba( 255, 255, 255, 0.5 )";		
        _canvas.fillText( "framerate = " + _frameRate.toString(), _canvasWidth - 200, 20 );        
        */
        
		//---------------------------
		// render touch state
		//---------------------------
		//_touch.render();
		
		//---------------------------
		// render border
		//---------------------------
        _canvas.lineWidth = 1; 
        _canvas.strokeStyle = "rgb( 0, 0, 0 )";   
		_canvas.strokeRect( 0, 0, _canvasWidth, _canvasHeight );
		/*     
        //_canvas.strokeStyle = "rgb( 220, 230, 240 )";
        _canvas.beginPath();
        _canvas.moveTo( 0, _canvasHeight );
        _canvas.lineTo( _canvasWidth, _canvasHeight );
        _canvas.closePath();
        _canvas.stroke();
        
        _canvas.beginPath();
        _canvas.moveTo( _canvasWidth, _canvasHeight );
        _canvas.lineTo( _canvasWidth, 0 );
        _canvas.closePath();
        _canvas.stroke();

        
        _canvas.beginPath();
        _canvas.moveTo( 0, 0 );
        _canvas.lineTo( 0, _canvasHeight );
        _canvas.closePath();
        _canvas.stroke();
        
        _canvas.beginPath();
        _canvas.moveTo( 0, 0 );
        _canvas.lineTo( _canvasWidth, 0 );
        _canvas.closePath();
        _canvas.stroke();
        */
	}
	
	
	/*
	//----------------------------------------
	function renderSwimbotSelectCircle( s, m )
	{
	    let lineWidth = 1.6 + 0.005 * _camera.getScale(); 	
	    let alpha = 0.07;	
	    	    
        if ( m )
        {
    	    alpha = 0.03;	
        }
        
        canvas.lineWidth = lineWidth;
        canvas.strokeStyle = "rgba( 255, 255, 255, " + alpha + " )";	
        canvas.beginPath();
        canvas.arc( _swimbots[s].getPosition().x, _swimbots[s].getPosition().y, _swimbots[s].getSelectRadius(), 0, PI2, false );
        canvas.stroke();
        canvas.closePath();	

        canvas.lineWidth = lineWidth * 0.4;
        canvas.strokeStyle = "rgba( 255, 255, 255, " + alpha + " )";
        canvas.beginPath();
        canvas.arc( _swimbots[s].getPosition().x, _swimbots[s].getPosition().y, _swimbots[s].getSelectRadius(), 0, PI2, false );
        canvas.stroke();
        canvas.closePath();		    
	}
	*/


	//----------------------------------------
	function renderSelectCircle( x, y, r, m )
	{
	    let lineWidth = 1.6 + 0.005 * _camera.getScale(); 	
	    let alpha = 0.07;	
	    	    
        if ( m )
        {
    	    alpha = 0.03;	
        }
        
        canvas.lineWidth = lineWidth;
        canvas.strokeStyle = "rgba( 255, 255, 255, " + alpha + " )";	
        canvas.beginPath();
        canvas.arc( x, y, r, 0, PI2, false );
        canvas.stroke();
        canvas.closePath();	

        canvas.lineWidth = lineWidth * 0.4;
        canvas.strokeStyle = "rgba( 255, 255, 255, " + alpha + " )";
        canvas.beginPath();
        canvas.arc( x, y, r, 0, PI2, false );
        canvas.stroke();
        canvas.closePath();		    
	}

	
	
	//-------------------------------
	function renderCamera()
	{
		_canvas.strokeStyle = "rgb( 255, 255, 255 )";		
		_canvas.lineWidth = _camera.getScale() * 0.007; 
		
		let spacing = 15;
		
		let x = _camera.getPosition().x - _camera.getXDimension() * ONE_HALF;
		let y = _camera.getPosition().y - _camera.getYDimension() * ONE_HALF;
		let w = _camera.getXDimension();
		let h = _camera.getYDimension();
		
		_canvas.strokeRect( x + spacing * ONE_HALF, y + spacing * ONE_HALF, w - spacing, h - spacing );

		_canvas.fillStyle = "rgb( 255, 255, 255 )";		
		_canvas.strokeRect
		( 
			_camera.getPosition().x - _camera.getXDimension() * 0.01, 
			_camera.getPosition().y - _camera.getYDimension() * 0.01, 0.01, 0.01
		);
    }
            		



	
	//-------------------------------
	this.renderFoodBits = function()
	{
        for (let f=0; f<MAX_FOODBITS; f++)
        {
            if ( _foodBits[f].getAlive() )
            {
                if ( _camera.getWithinView( _foodBits[f].getPosition(), FOOD_BIT_GRAB_RADIUS ) )
                {
                    _foodBits[f].render( _camera.getScale() );
                    
                    if ( f === _selectedFoodBit )
                    {
                        _foodBits[f].renderSelectOutline( _camera.getScale() );
                    }
                    
                    if ( f === _mousedOverFoodBit )
                    {
                        _foodBits[f].renderMousedOverOutline( _camera.getScale() );
                    }
                }
            }
        }
    }
 
	//--------------------------------------
	this.initializeDebugTrail = function(s)
	{
        for (let t=0; t<TRAIL_LENGTH; t++)
        {
            _debugTrail[t].set( _swimbots[s].getPosition() );
        }	
    }
 

	//-----------------------------------
	this.showSwimbotTrail = function(s)
	{
        //------------------------------------
        // update trail
        //------------------------------------
        if ( _clock % 20 == 0 )
        {
            for (let t=TRAIL_LENGTH-1; t>0; t--)
            {
                _debugTrail[t].set( _debugTrail[t-1] ); 
            }	

           _debugTrail[0].set( _swimbots[s].getPosition() ); 
        }

        //------------------------------------
        // render trail
        //------------------------------------
        _canvas.lineWidth = 2; 
        _canvas.strokeStyle = "rgb( 255, 255, 255 )";

        for (let t=1; t<TRAIL_LENGTH; t++)
        {
            _canvas.beginPath();
            _canvas.moveTo( _debugTrail[t-1].x, _debugTrail[t-1].y );
            _canvas.lineTo( _debugTrail[t].x, _debugTrail[t].y );
            _canvas.closePath();
            _canvas.stroke();
        }	
	}

	
	//--------------------------------
	this.touchDown = function( x, y )
	{
        _touch.setToDown( x, y ); 	
       this.handleNonUITouchDownActions( x, y );
	}
	
	//--------------------------------------------------------------
	this.convertScreenCoordinatesToPoolPosition = function( x, y )
	{	
	    _vectorUtility.x = _camera.getPosition().x - _camera.getXDimension() * ONE_HALF + ( x / _canvasWidth  ) * _camera.getXDimension();
    	_vectorUtility.y = _camera.getPosition().y - _camera.getYDimension() * ONE_HALF + ( y / _canvasHeight ) * _camera.getYDimension(); 

	    return _vectorUtility;
    }
    	
	
	//-------------------------------
	this.touchMove = function( x, y )
	{	
        if (( x < _canvasWidth  )
        &&  ( y < _canvasHeight ))
    	{		
            _touch.setToMove( x, y );

            _vectorUtility = this.convertScreenCoordinatesToPoolPosition( x, y );
            _pool.moveTouch( _vectorUtility, _seconds );

            if (( _touch.getState() === TOUCH_JUST_DOWN )
            ||  ( _touch.getState() === TOUCH_BEEN_DOWN ))
            {
                //-----------------------------
                // dragging a swimbot around
                //-----------------------------
                if (( _swimbotBeingDragged )
                &&  ( _selectedSwimbot != NULL_INDEX ))
                {
                    _vectorUtility = this.convertScreenCoordinatesToPoolPosition( x, y );
                    _swimbots[ _selectedSwimbot ].setPosition( _vectorUtility );
                    
                    _vectorUtility.setXY( ZERO, ZERO );
                    _swimbots[ _selectedSwimbot ].setVelocity( _vectorUtility );
                }
                else if (( _foodBitBeingDragged )
                     &&  ( _selectedFoodBit != NULL_INDEX ))
                {
                    //-----------------------------
                    // dragging a fodbit around
                    //-----------------------------
                    _vectorUtility = this.convertScreenCoordinatesToPoolPosition( x, y );
                    _foodBits[ _selectedFoodBit ].setPosition( _vectorUtility );
                }
                else
                {
                    if ( _obstacle.getBeingMoved() )        
                    {
                        //--------------------------------------
                        // set the new moved position       
                        //--------------------------------------
                        _vectorUtility = this.convertScreenCoordinatesToPoolPosition( x, y );
                        
                        let buffer = 20;
                        if ( _vectorUtility.x > POOL_RIGHT  - buffer ) { _vectorUtility.x = POOL_RIGHT  - buffer; }
                        if ( _vectorUtility.x < POOL_LEFT   + buffer ) { _vectorUtility.x = POOL_LEFT   + buffer; }
                        if ( _vectorUtility.y > POOL_BOTTOM - buffer ) { _vectorUtility.y = POOL_BOTTOM - buffer; }
                        if ( _vectorUtility.y < POOL_TOP    + buffer ) { _vectorUtility.y = POOL_TOP    + buffer; }
                        
                        _obstacle.setMovePosition( _vectorUtility );
                        
                        //--------------------------------------
                        // keep food away from obstacle       
                        //--------------------------------------
                        moveFoodBitsFromObstacle();
                    }    
                    else
                    {
                        let x = _touch.getVelocityX();
                        let y = _touch.getVelocityY();
                        _camera.drag( x, y );
                    }
                }
            }
            else
            {
                //throttle
                //if ( _clock % 4 == 0 )
                
                _vectorUtility = this.convertScreenCoordinatesToPoolPosition( x, y );

                //------------------------------------------------------------------------
                // check to see if the mouse if hovering over a swimbot or food bit
                //------------------------------------------------------------------------
                _mousedOverSwimbot = this.indexOfClosestSwimbotToScreenPosition( x, y );
                _mousedOverFoodBit = this.indexOfClosestFoodBitToScreenPosition( x, y );

                //------------------------------------------------------------
                // check to see if the mouse if hovering over the obstacle
                //------------------------------------------------------------
                _obstacle.detectHover( _vectorUtility )                 
            }		
        }
	}

	
	//-------------------------------
	this.touchUp = function( x, y )
	{
    	_touch.setToUp( x, y );
		
        _swimbotBeingDragged = false;
		_foodBitBeingDragged = false;
		
        //-----------------------------------------------------
        // if no button or swimbot or food bit was un-clicked
        //-----------------------------------------------------
		if (( _selectedSwimbot === NULL_INDEX )
        &&  ( _selectedFoodBit === NULL_INDEX ))
        {
            if ( _obstacle.getBeingMoved() )        
            {
                _obstacle.stopMoving();
            }    
        
            _vectorUtility = this.convertScreenCoordinatesToPoolPosition( x, y );
    		_pool.endTouch( _vectorUtility, _seconds );
	    }
    }

	
	//-------------------------------
	this.touchOut = function( x, y )
	{
        this.touchUp( x, y );
    }

	//------------------------------------
	this.touchTwoFingerMove = function(e)
	{
        if (( e.x < _canvasWidth  )
        &&  ( e.y < _canvasHeight ))
    	{		
            _camera.drag( -e.deltaX, -e.deltaY );  
            this.clearViewMode();
        }
    }
    
	//--------------------------------
	// start camera Navigation
	//--------------------------------
    this.startCameraNavigation = function( action )
    {
        _camera.stopTracking();
        
             if ( action === CameraNavigationAction.LEFT  ) { _panningLeft  = true; }
        else if ( action === CameraNavigationAction.RIGHT ) { _panningRight = true; }
        else if ( action === CameraNavigationAction.DOWN  ) { _panningDown  = true; }
        else if ( action === CameraNavigationAction.UP    ) { _panningUp    = true; }
        else if ( action === CameraNavigationAction.IN    ) { _zoomingIn    = true; }
        else if ( action === CameraNavigationAction.OUT   ) { _zoomingOut   = true; }
	}
	
	//-----------------------------------------------
	// stop camera Navigation
	//-----------------------------------------------
    this.stopCameraNavigation = function( action )
    {
        _panningLeft    = false;	
        _panningRight   = false;
        _panningUp      = false;	
        _panningDown    = false;	
        _zoomingIn      = false;
        _zoomingOut     = false;
	}

	//-------------------------------
	this.clearViewMode = function()
	{
        this.setViewMode( ViewMode.NULL );
	}
	
	//--------------------------------------
	this.setViewMode = function( viewMode )
	{
        //console.log( "setViewMode to " + viewMode );
	
	    let selectedSwimbot = _viewControl.setMode( viewMode, _selectedSwimbot );
	    setSelectedSwimbot( selectedSwimbot );
	}
	
	//--------------------------------------------------
	this.handleNonUITouchDownActions = function( x, y )
	{
        if (( x < _canvasWidth  )
        &&  ( y < _canvasHeight ))
        {
            //----------------------------------------
            // in case camera tracking is on, stop it...
            //----------------------------------------
            _camera.stopTracking();
                            
            //------------------------------------------
            // has a swimmer been clicked?
            //------------------------------------------
            setSelectedSwimbot( this.indexOfClosestSwimbotToScreenPosition( x, y ) );
        
            //------------------------------------------
            // a swimmer is clicked
            //------------------------------------------
            if ( _selectedSwimbot != NULL_INDEX )
            {
                _swimbotBeingDragged = true;
                this.initializeDebugTrail( _selectedSwimbot );
            }

            //--------------------------------------
            // find out if a foodbit was clicked
            //--------------------------------------
            if ( _selectedSwimbot === NULL_INDEX )
            {
                _selectedFoodBit = this.indexOfClosestFoodBitToScreenPosition( x, y );
                //console.log( _selectedFoodBit );
            
                if ( _selectedFoodBit != NULL_INDEX )
                {
                    _foodBitBeingDragged = true;
                }
            }
            else
            {
                _mousedOverFoodBit = NULL_INDEX;
            }
        
            //----------------------------------------
            // if no swimbot or food bit was clicked
            //----------------------------------------
            if (( _selectedSwimbot == NULL_INDEX )
            &&  ( _selectedFoodBit == NULL_INDEX ))
            {
                _vectorUtility = this.convertScreenCoordinatesToPoolPosition( x, y );
                
                //--------------------------------------
                // did the obstacle get touched?
                //--------------------------------------
                if ( _obstacle.detectHover( _vectorUtility ) )
                {
                    _obstacle.startMoving( _vectorUtility );
                }
                else
                {
                    //--------------------------------------
                    // touch the pool!
                    //--------------------------------------
                    _pool.startTouch( _vectorUtility, _seconds );
                }
            }
        }
    }	
	


	//----------------------------------------------
	this.indexOfClosestSwimbotToScreenPosition = function( x, y )
	{
        let indexOfClosest = NULL_INDEX;
        let closestDistance = 1000.0;
        
        for (let s=0; s<MAX_SWIMBOTS; s++)
        {
            if ( _swimbots[s].getAlive() )
            {
                _vectorUtility = this.convertScreenCoordinatesToPoolPosition( x, y );
                
                let distanceSquared = _swimbots[s].getPosition().getDistanceSquaredTo( _vectorUtility );
                if ( distanceSquared < _swimbots[s].getSelectRadius() * _swimbots[s].getSelectRadius() )
                {
                    if ( distanceSquared < closestDistance )
                    {
                        indexOfClosest = s;
                        closestDistance = distanceSquared;
                    }
                }
             }
        }
                
        return indexOfClosest;
    }
    
    


	//------------------------------------------------------------
	this.indexOfClosestFoodBitToScreenPosition = function( x, y )
	{
        let indexOfClosest = NULL_INDEX;
        let closestDistance = 1000.0;
        
        for (let f=0; f<MAX_FOODBITS; f++)
        {
            if ( _foodBits[f].getAlive() )
            {
                _vectorUtility = this.convertScreenCoordinatesToPoolPosition( x, y );
                
                let distanceSquared = _foodBits[f].getPosition().getDistanceSquaredTo( _vectorUtility );
                if ( distanceSquared < FOOD_BIT_GRAB_RADIUS * FOOD_BIT_GRAB_RADIUS )
                {
                    if ( distanceSquared < closestDistance )
                    {
                        indexOfClosest = f;
                        closestDistance = distanceSquared;
                    }
                }
             }
        }

        return indexOfClosest;
    }
    
    
    
	//------------------------------------------------------------------------------------
	// get functions....
	//------------------------------------------------------------------------------------
    
	
	//----------------------------------------------------------------------------
	// various quickie getters...
	//----------------------------------------------------------------------------
	this.getFoodGrowthDelay     = function() { return _foodRegenerationPeriod;  }
	this.getFoodSpread          = function() { return _foodSpread;              }
    this.getFoodBitEnergy       = function() { return _foodBitEnergy;           }
    this.getHungerThreshold     = function() { return _hungerThreshold;         }
    this.getEnergyToOffspring   = function() { return GLOBAL_childEnergyRatio;  }
    this.getTimeStep            = function() { return _clock;                   }    
	this.getRenderingGoals      = function() { return _renderingGoals;          }
	this.getSimulationRunning   = function() { return _simulationRunning;       }
	this.getSelectedSwimbotID   = function() { return _selectedSwimbot;         }
	this.getViewMode            = function() { return _viewControl.getMode();   }
    
	//--------------------------------------------------
	// check to see if the camera navigation is active
	//--------------------------------------------------
    this.getCameraNavigationActive = function( action )
	{
	    let result = false;
	    
	    if ( ( action === CameraNavigationAction.LEFT  ) && ( _panningLeft  ) ) { result = true; } 
	    if ( ( action === CameraNavigationAction.RIGHT ) && ( _panningRight ) ) { result = true; } 
	    if ( ( action === CameraNavigationAction.DOWN  ) && ( _panningDown  ) ) { result = true; } 
	    if ( ( action === CameraNavigationAction.UP    ) && ( _panningUp    ) ) { result = true; } 
	    if ( ( action === CameraNavigationAction.IN    ) && ( _zoomingIn    ) ) { result = true; } 
	    if ( ( action === CameraNavigationAction.OUT   ) && ( _zoomingOut   ) ) { result = true; } 

        return result;
	}
	
	//----------------------------------------
	this.getASwimbotIsSelected = function()
	{
        if ( _selectedSwimbot != NULL_INDEX )
        {
            return true;
        }
	
	    return false;
    }	    

	//-----------------------------------
    this.getPresetGenotype = function(p)
    {
        _myGenotype.setToPreset(p);
            
        return _myGenotype.getGenes();
    }

	//------------------------------
	this.getNumFoodBits = function()
	{       
        let num = 0;
        
        for (let f=0; f<MAX_FOODBITS; f++)
        {
            if ( _foodBits[f].getAlive() )
            {
                num ++;
            }
        }
                    
	    return num;	
	}

	//------------------------------
	this.getNumSwimbots = function()
	{       
        let num = 0;
        
        for (let s=0; s<MAX_SWIMBOTS; s++)
        {
            if ( _swimbots[s].getAlive() )
            {
                num ++;
            }
        }
                    
	    return num;	
	}
	

	//----------------------------
	this.getPoolData = function()
	{
	    //-----------------------------
	    // create foodbit array
	    //-----------------------------
        function FoodBitData()
        {
            this.id     = NULL_INDEX;
            this.x      = ZERO;
            this.y      = ZERO;
        }
        
	    let foodBitDataArray = new Array();
        
        let numFoodbits = 0;
        for (let f=0; f<MAX_FOODBITS; f++)
        {
            if ( _foodBits[f].getAlive() )
            {
                foodBitDataArray[ numFoodbits ] = new FoodBitData();
                foodBitDataArray[ numFoodbits ].id = f;
                foodBitDataArray[ numFoodbits ].x = _foodBits[f].getPosition().x;
                foodBitDataArray[ numFoodbits ].y = _foodBits[f].getPosition().y;

                numFoodbits ++;
            }
        }
 
	    //-------------------------
	    // create swimbot array
	    //-------------------------
        function SwimbotData()
        {
            this.x      = ZERO;
            this.y      = ZERO;
            this.angle  = ZERO;
            this.energy = ZERO;
            this.age    = 0;
            this.id     = 0;
            this.genes  = new Array();
        }
        
	    let swimbotDataArray = new Array();
	    
        let numSwimbots = 0;
        for (let s=0; s<MAX_SWIMBOTS; s++)
        {
            if ( _swimbots[s].getAlive() )
            {
                swimbotDataArray[ numSwimbots ] = new SwimbotData();
                swimbotDataArray[ numSwimbots ].id      = s;
                swimbotDataArray[ numSwimbots ].x       = _swimbots[s].getPosition().x;
                swimbotDataArray[ numSwimbots ].y       = _swimbots[s].getPosition().y;
                swimbotDataArray[ numSwimbots ].angle   = _swimbots[s].getAngle();
                swimbotDataArray[ numSwimbots ].age     = _swimbots[s].getAge();
                swimbotDataArray[ numSwimbots ].energy  = _swimbots[s].getEnergy();
                swimbotDataArray[ numSwimbots ].genes   = this.getSwimbotGenes(s);



//_myGenotype.randomize();   
//swimbotDataArray[ numSwimbots ].genes = _myGenotype;               
  
/*
for (let g=0; g<NUM_GENES; g++)
{
    swimbotDataArray[ numSwimbots ].genes[g] = Math.floor( Math.random() * 256.0 );               
}
*/
//data.swimbotArray[s].genes = _myGenotype;
      
//console.log( swimbotDataArray[ numSwimbots ].genes );          

//_myGenotype.randomize();     
//_myGenotype.copyFromGenotype( data.swimbotArray[s].genes );               


//swimbotDataArray[ numSwimbots ].genes = _swimbots[s].getGenotype();            


//console.log( swimbotDataArray[ numSwimbots ].genes );          

//_myGenotype.randomize();     

//data.swimbotArray[s].genes = _myGenotype;
      
//console.log( data.swimbotArray[s].genes );          

//swimbotDataArray[ numSwimbots ].genes = _myGenotype;

//_myGenotype.randomize();     
//data.swimbotArray[ numSwimbots ].genes = _myGenotype;
  
//_myGenotype.randomize();  //this.getSwimbotGenes(s);
//swimbotDataArray[ numSwimbots ].genes   = _myGenotype;
                
                
                
                numSwimbots ++;
            }
        }
	    
        let poolData = 
        { 
            "simulationRunning"         : _simulationRunning, 
            "numFoodBits"               : numFoodbits, 
            "numSwimbots"               : numSwimbots, 
            "foodBitArray"              : foodBitDataArray,
            "swimbotArray"              : swimbotDataArray,
            "cameraX"                   : _camera.getPosition().x,
            "cameraY"                   : _camera.getPosition().y,
            "cameraScale"               : _camera.getScale(),
            "foodRegenerationPeriod"    : _foodRegenerationPeriod,
            "foodSpread"                : _foodSpread,
            "foodBitEnergy"             : _foodBitEnergy,
            "hungerThreshold"           : _hungerThreshold,
            "attractionCriterion"       : _attractionCriterion,
            "childEnergyRatio"          : GLOBAL_childEnergyRatio,
            "renderingGoals"            : _renderingGoals,
            "obstacleEnd1X"             : _obstacle.getEnd1Position().x,
            "obstacleEnd1Y"             : _obstacle.getEnd1Position().y,
            "obstacleEnd2X"             : _obstacle.getEnd2Position().x,
            "obstacleEnd2Y"             : _obstacle.getEnd2Position().y
        }
        
        return poolData;
    }

    
	//------------------------------------
	this.getSwimbotGenes = function( ID )
	{		
        let genotype = _swimbots[ ID ].getGenotype();
        return genotype.getGenes();
    }	
    
	//----------------------------------
	this.getFamilyTree = function()
	{		
	    return _familyTree;
    }	
    
    
	//------------------------------
	this.getAttraction = function()
	{		
        return _attractionCriterion;
    }	
	
	//----------------------------------------------------------------------------------------------------------------
	// swimbot getters...
	//----------------------------------------------------------------------------------------------------------------
	this.getSwimbotIndex                    = function( ID ) {	return _swimbots[ ID ].getIndex                 (); }
    this.getSwimbotBrainState               = function( ID ) {	return _swimbots[ ID ].getBrainState            (); }
    this.getSwimbotChosenMate               = function( ID ) {	return _swimbots[ ID ].getChosenMateIndex       (); }
    this.getSwimbotAge                      = function( ID ) {	return _swimbots[ ID ].getAge                   (); }
    this.getSwimbotEnergy                   = function( ID ) {	return _swimbots[ ID ].getEnergy                (); }
    this.getSwimbotNumFoodBitsEaten         = function( ID ) {	return _swimbots[ ID ].getNumFoodBitsEaten      (); }
    this.getSwimbotNumOffspring             = function( ID ) {	return _swimbots[ ID ].getNumOffspring          (); }
    this.getSwimbotAttractionDescription    = function( ID ) {	return _swimbots[ ID ].getAttractionDescription (); }
    
    // this is now being initialized from the index.html...
	//--------------------------------
	// start this puppy
	//--------------------------------
    //this.initialize();
}
