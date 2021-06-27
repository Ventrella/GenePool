"use strict";


const FOOD_BIT_SIZE                     = 1.5; //default size
const MIN_FOOD_BIT_MAX_SPAWN_RADIUS     = 10;
const MAX_FOOD_BIT_MAX_SPAWN_RADIUS     = 4000.0;
const DEFAULT_FOOD_BIT_MAX_SPAWN_RADIUS = 4000.0; //max distance for spawned child
const MIN_FOOD_BIT_ENERGY               = 0.0; 
const MAX_FOOD_BIT_ENERGY               = 100.0; 
//const FOOD_BIT_NUTRITION_ENERGY         = 50.0;
const DEFAULT_FOOD_BIT_ENERGY           = 50.0;  //when eaten, swimbot gets this much energy
const FOOD_BIT_SIZE_VIEW_SCALE          = 0.03; //increase with view scale (a kind of LOD)
const FOOD_BIT_GRAB_RADIUS              = 20.0;  // radius for grabbing food bit
const FOOD_BIT_BOUNDARY_MARGIN          = POOL_WIDTH * 0.01; // important value - creates empty space from wall
const FOOD_BIT_COLOR_COMPONENTS         = "100, 200, 100";	
const FOOD_BIT_ROLLOVER_COLOR           = "rgba( 100, 200, 100, 0.5 )";	
const FOOD_BIT_SELECT_COLOR             = "rgba( 200, 200, 200, 1.0 )";	
const FOOD_OPACITY_INCREMENT            = 0.01;

//------------------------
// Food bit
//------------------------
function FoodBit()
{
    let _position       = new Vector2D();
    let _energy         = ZERO;
    let _nutrition      = ZERO;
    let _red            = ZERO;
    let _green          = ZERO;
    let _blue           = ZERO;
    let _opacity        = ZERO;
    let _index          = NULL_INDEX;
    let _maxSpawnRadius = DEFAULT_FOOD_BIT_MAX_SPAWN_RADIUS;

    //--------------------------------------------------------
    // initialize
    //--------------------------------------------------------
	this.initialize = function(f)
	{
        _index      = f;
        _energy     = DEFAULT_FOOD_BIT_ENERGY;  
        _opacity    = ZERO      
		
        //--------------------------------------------------------
        // place randomly in a disk in the middle of the pool
        //--------------------------------------------------------
        let poolCenter = new Vector2D();
		poolCenter.x = POOL_LEFT + POOL_WIDTH  * ONE_HALF; 
		poolCenter.y = POOL_TOP  + POOL_HEIGHT * ONE_HALF; 
		
        _position.setToRandomLocationInDisk( poolCenter, GARDEN_OF_EDEN_RADIUS ); 

//_position.x = POOL_LEFT + Math.random() * POOL_WIDTH;
//_position.y = POOL_TOP  + Math.random() * POOL_HEIGHT;

        this.randomizeNutrition();
    }




    //--------------------------------------
	this.randomizeNutrition = function()
	{
	    //console.log( "randomizeNutrition" ) ;
	    
	    _nutrition = Math.floor( Math.random() * 2 );
	    
        this.setColorAccordingToNutrition();
	}
	

    //--------------------------------------
	this.setNutrition = function(n)
	{
	    assert ( ( n === 0 ) || ( n === 1 ), "Foodbit.js: setNutrition: ( n === 0 ) || ( n === 1 )" );
	    
	    _nutrition = n;
	    
        this.setColorAccordingToNutrition();
	}

    /*
    //-------------------------------------------------
	this.setNutritionAccordingToPosition = function()
	{
        _nutrition1 = ( _position.x - POOL_LEFT ) / POOL_WIDTH;
        _nutrition2 = ( _position.y - POOL_TOP  ) / POOL_HEIGHT;
         
        assert( _nutrition1 >  ZERO, "foodbit.js: _nutrition1 >  ZERO" );
        assert( _nutrition2 >  ZERO, "foodbit.js: _nutrition2 >  ZERO" );        
        assert( _nutrition1 <= ONE,  "foodbit.js: _nutrition1 <= ONE"  );
        assert( _nutrition2 <= ONE,  "foodbit.js: _nutrition2 <= ONE"  );  

        this.setColorAccordingToNutrition();
	}
    */
    

    //------------------------------------------------
	this.setColorAccordingToNutrition = function()
	{
	    if ( _nutrition === 0 ) { _red = 0.5; _green = 0.5; _blue = 1.0; }
	    if ( _nutrition === 1 ) { _red = 0.9; _green = 0.9; _blue = 0.3; }

        /*	
        let redX    = 0.0; 
        let greenX  = 0.0; 
        let blueX   = 0.0; 
        let redY    = 0.0; 
        let greenY  = 0.0; 
        let blueY   = 0.0; 
        let redC    = 0.0; 
        let greenC  = 0.0; 
        let blueC   = 0.0; 
        
        let xx = ( _nutrition1 - ONE_HALF ) * 1.5;
        let yy = ( _nutrition2 - ONE_HALF ) * 1.5;
        
        let distance = Math.sqrt( xx * xx + yy * yy );
        
        let centerIntensity = ONE - distance;
        
        redC    = 0.0 * centerIntensity;
        greenC  = 1.0 * centerIntensity;
        blueC   = 0.0 * centerIntensity;
        
        if ( _nutrition1 < ONE_HALF ) 
        { 
            let n = ONE - _nutrition1 * 2;
            
            redX   = n * 1.0;//2.0; 
            greenX = n * 0.0;//0.2; 
            blueX  = n * 0.0;//0.2; 
        }
        else
        {
            let n = ( _nutrition1 - ONE_HALF ) * 2;
            
            redX   = n * 0.0;//0.4; 
            greenX = n * 0.0;//0.4; 
            blueX  = n * 1.0;//2.0; 
        }

        if ( _nutrition2 < ONE_HALF ) 
        { 
            let n = ONE - _nutrition2 * 2;
            
            redY   = n * 0.5;//2.0; 
            greenY = n * 1.0;//2.0; 
            blueY  = n * 0.5;//0.2; 
        }
        else
        {
            let n = ( _nutrition2 - ONE_HALF ) * 2;
            
            redY   = n * 1.0;//0.4; 
            greenY = n * 0.0;//2.0; 
            blueY  = n * 0.0;//2.0; 
        }
        
        _red   = redX   + redY   + redC;   
        _green = greenX + greenY + greenC;   
        _blue  = blueX  + blueY  + blueC; 
        
        if ( _red   > ONE ) { _red      = ONE; }  
        if ( _green > ONE ) { _green    = ONE; }  
        if ( _blue  > ONE ) { _blue     = ONE; }  
        */
    }
    
        
    
    //--------------------------------------------------------------------------------------------------
	this.setSpawnPositionRelativeToParent = function( parentFoodBit, childIndex, childNutritionType )
	{
        //console.log( parentFoodBit.index + ", " + childIndex );
        	
        assert( parentFoodBit.getIndex() != NULL_INDEX, "foodbit.js: setSpawnPositionRelativeToParent: parentFoodBit.index != NULL_INDEX" );
        assert( parentFoodBit.getAlive(), "foodbit.js: setSpawnPositionRelativeToParent: parentFoodBit.getAlive()" );
        assert( childIndex != NULL_INDEX, "foodbit.js: setSpawnPositionRelativeToParent: childIndex != NULL_INDEX" );
        
        if ( childIndex === parentFoodBit.getIndex() )
        {
            console.log( "warning: foodbit.js: setSpawnPositionRelativeToParent: childIndex = " + childIndex + " and parentFoodBit.getIndex() = " + parentFoodBit.getIndex() );
        }
        
        //assert( childIndex != parentFoodBit.getIndex(), "foodbit.js: setSpawnPositionRelativeToParent: childIndex != parentFoodBit.index" );

        _index      = childIndex;
        _opacity    = ZERO;
        _energy     = parentFoodBit.getEnergy();
        _nutrition  = childNutritionType;
                
        this.setColorAccordingToNutrition();
        
        //-----------------------------
        // set the position
        //-----------------------------      
        _position.set( parentFoodBit.getPosition() );

        let xx = Math.random() * Math.random();
        let yy = Math.random() * Math.random();

        if ( Math.random() < ONE_HALF ) { xx *= -ONE; }
        if ( Math.random() < ONE_HALF ) { yy *= -ONE; }

        _position.x += xx *= _maxSpawnRadius;
        _position.y += yy *= _maxSpawnRadius;

        //-----------------------------
        // pool boundary collisions
        //-----------------------------      
        let pb = POOL_TOP       + FOOD_BIT_BOUNDARY_MARGIN;
        let pt = POOL_BOTTOM    - FOOD_BIT_BOUNDARY_MARGIN;
        let pl = POOL_LEFT	    + FOOD_BIT_BOUNDARY_MARGIN;
        let pr = POOL_RIGHT	    - FOOD_BIT_BOUNDARY_MARGIN;
        
        //console.log( "before:" + _position.y );
        
                if ( _position.y < pb ) { _position.y += ( ( pb - _position.y ) * 2 ); }
        else	if ( _position.y > pt ) { _position.y += ( ( pt - _position.y ) * 2 ); }
                if ( _position.x > pr ) { _position.x += ( ( pr - _position.x ) * 2 ); }
        else	if ( _position.x < pl ) { _position.x += ( ( pl - _position.x ) * 2 ); }
        
        //console.log( "after:" + _position.y );        
        
        if ( SPAWN_FOOD_RANDOMLY_IN_POOL )
        {
            _position.x = POOL_LEFT + Math.random() * POOL_WIDTH;
            _position.y = POOL_TOP  + Math.random() * POOL_HEIGHT;
        }   
        

        assert( _position.x < POOL_RIGHT,   "foodbit.js: setSpawnPositionRelativeToParent: _position.x < POOL_RIGHT"  );
        assert( _position.x > POOL_LEFT,    "foodbit.js: setSpawnPositionRelativeToParent: _position.x > POOL_LEFT"   );
        assert( _position.y > POOL_TOP,     "foodbit.js: setSpawnPositionRelativeToParent: _position.y < POOL_TOP"	);
        assert( _position.y < POOL_BOTTOM,  "foodbit.js: setSpawnPositionRelativeToParent: _position.y > POOL_BOTTOM" );
    }




    //-----------------------------
	this.setPosition = function(p)
	{
        _position.set(p);
        
                if ( _position.y < POOL_TOP    ) { _position.y = POOL_TOP    + FOOD_BIT_SIZE; }
        else	if ( _position.y > POOL_BOTTOM ) { _position.y = POOL_BOTTOM - FOOD_BIT_SIZE; }
                if ( _position.x > POOL_RIGHT  ) { _position.x = POOL_RIGHT  - FOOD_BIT_SIZE; }
        else	if ( _position.x < POOL_LEFT   ) { _position.x = POOL_LEFT   + FOOD_BIT_SIZE; }

        assert( _position.x < POOL_RIGHT,   "foodbit.js: setPosition: _position.x < POOL_RIGHT"  );
        assert( _position.x > POOL_LEFT,    "foodbit.js: setPosition: _position.x > POOL_LEFT"   );
        assert( _position.y > POOL_TOP,     "foodbit.js: setPosition: _position.y < POOL_TOP"	);
        assert( _position.y < POOL_BOTTOM,  "foodbit.js: setPosition: _position.y > POOL_BOTTOM" );
    }



    //-------------------------------
	this.shiftPosition = function(s)
	{
	    _position.x += s.x;
	    _position.y += s.y;
    }
        
    //-----------------------------------
	this.setMaxSpawnRadius = function(r)
	{
	    _maxSpawnRadius = r;
	    	    
	    assert( _maxSpawnRadius <= MAX_FOOD_BIT_MAX_SPAWN_RADIUS, "FoodBit: setMaxSpawnRadius: _maxSpawnRadius <= MAX_FOOD_BIT_MAX_SPAWN_RADIUS" );
	    
	    assert( _maxSpawnRadius >= MIN_FOOD_BIT_MAX_SPAWN_RADIUS, "FoodBit: setMaxSpawnRadius: _maxSpawnRadius >= MIN_FOOD_BIT_MAX_SPAWN_RADIUS" );
    }
    
        
    //----------------------------------
	this.getMaxSpawnRadius = function()
	{
	    return _maxSpawnRadius;	    
    }

    //----------------------------
	this.setEnergy = function(e)
	{
	    _energy = e;	

	    assert( _energy <= MAX_FOOD_BIT_ENERGY, "FoodBit:getMaxSpawnRadius setEnergy: _energy <= MAX_FOOD_BIT_ENERGY" );
	    assert( _energy >= MIN_FOOD_BIT_ENERGY, "FoodBit:getMaxSpawnRadius setEnergy: _energy >= MIN_FOOD_BIT_ENERGY" );
    }

    //----------------------
    this.kill = function()
    {	
        _index = NULL_INDEX;
    }
    
	//----------------------------
	// getters
	//---------------------------
	this.getPosition    = function() { return _position;    }
	this.getEnergy      = function() { return _energy;      }
	this.getNutrition   = function() { return _nutrition;   }
	this.getIndex       = function() { return _index;       }
    this.getAlive       = function() { return ( _index != NULL_INDEX ); }

	//----------------------------
	// update
	//----------------------------
	this.update = function()
	{
        //----------------------------------------------------------
        // foodbits are born transparent...they become more opaque 
        // and then reach max visability within a few seconds
        //----------------------------------------------------------
	    if ( _opacity < ONE )
	    {
    	    _opacity += FOOD_OPACITY_INCREMENT;
	        if ( _opacity > ONE )
	        {
	            _opacity = ONE;
	        }
        }	
    }
    
    
	//--------------------------------
	// render
	//--------------------------------
	this.render = function( vewScale )
	{
        //canvas.fillStyle = "rgba( " + FOOD_BIT_COLOR_COMPONENTS + ", " + _opacity + ")";	    

        canvas.fillStyle 
        = "rgba( " 
        + Math.floor( _red   * 255 ) + ", " 
        + Math.floor( _green * 255 ) + ", " 
        + Math.floor( _blue  * 255 ) + ", "
        + _opacity + ")";	    
	    
	    let radius = FOOD_BIT_SIZE + vewScale * FOOD_BIT_SIZE_VIEW_SCALE * FOOD_BIT_SIZE_VIEW_SCALE;
	    
        canvas.beginPath();
        canvas.arc( _position.x, _position.y, radius, 0, PI2, false );
        canvas.fill();
        canvas.closePath();	
    }

	//----------------------------
	// render moused-over outline
	//---------------------------
	this.renderMousedOverOutline = function( viewScale )
	{
	    this.showSelectCircle( viewScale, FOOD_BIT_ROLLOVER_COLOR );
    }

	//----------------------------
	// render select outline
	//---------------------------
	this.renderSelectOutline = function( viewScale )
	{
	    this.showSelectCircle( viewScale, FOOD_BIT_SELECT_COLOR );
    }
    
	//-----------------------------------------------------
	this.showSelectCircle = function( viewScale, color )
    {
	    let lineWidth = 1.0 + 0.005 * viewScale; 	
        
        canvas.lineWidth = lineWidth;
        canvas.strokeStyle = "rgba( 100, 200, 100, 0.05 )";	
        canvas.beginPath();
        canvas.arc( _position.x, _position.y, FOOD_BIT_GRAB_RADIUS, 0, PI2, false );
        canvas.stroke();
        canvas.closePath();	

        canvas.lineWidth = lineWidth * 0.3;
        canvas.strokeStyle = "rgba( 100, 200, 100, 0.1 )";	
        canvas.beginPath();
        canvas.arc( _position.x, _position.y, FOOD_BIT_GRAB_RADIUS, 0, PI2, false );
        canvas.stroke();
        canvas.closePath();		    
     }
       
}