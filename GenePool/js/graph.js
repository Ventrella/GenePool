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

//const GRAPH_UPDATE_PERIOD = 50;


//------------------
function Graph()
{	
    const GRAPH_LEFT_MARGIN     = 20;
    const GRAPH_RIGHT_MARGIN    = 20;
    const GRAPH_BOTTOM_MARGIN   = 160;
    const GRAPH_TOP_MARGIN      = 40;
    const GRAPH_MAX_POPULATION  = 2000;
    const RECIPROCAL_OF_MAX_POP = 1 / GRAPH_MAX_POPULATION;
    const GRAPH_FOODBIT_COLOR   = "rgb( 20,  100,  20 )";
    const GRAPH_FOODBIT_1_COLOR = "rgb( 20,  100, 200 )";
    const GRAPH_SWIMBOT_COLOR   = "rgb( 200, 60,  20 )";
    //const GRAPH_SWIMBOT_1_COLOR = "rgb( 200,  20, 200 )";


//let _maxPopulationValue = 0;
	let _currentCount   = 0;
	let _left	        = 0;
	let _top            = 0;
	let _right	        = 0;
	let _bottom	        = 0;
	let _width	        = 0;
	let _height	        = 0;
	let _maxGraphCount  = 0;
    let _level1000      = 0;
    let _level0500      = 0;
    let _level0000      = 0;
    let _graphLeft	    = 0;
    let _graphRight	    = 0;
    let _graphBottom	= 0;
    let _graphTop	    = 0;
    let _graphWidth	    = 0;
    let _graphHeight    = 0;
	let _time           = new Array(); 
	let _numSwimbots    = new Array(); 
	//let _numSwimbots1   = new Array(); 
	let _numFoodBits    = new Array(); 
    let _numFoodBits1   = new Array(); //kind of a hack - but I wanna get it working first....
 

	//---------------------------
	this.initialize = function()
	{	
        //console.log( "initialize graph!" );	
	
    	_currentCount = 0;
    	_maxGraphCount = 20;
    	
	    _time.length = 0;
	    _numSwimbots.length  = 0;
	    //_numSwimbots1.length = 0;
        _numFoodBits.length  = 0;
        _numFoodBits1.length = 0;

	    _time = [];
	    _numSwimbots  = [];
	    //_numSwimbots1 = [];
        _numFoodBits  = [];
        _numFoodBits1 = [];
	}


	//---------------------------------------------------------------------
	this.update = function( time, numSwimbots, numFoodBits, numFoodBits1 )
	{	
        if ( _maxGraphCount	< 1000 )
        {
            _maxGraphCount ++;
        }	
	
        if ( _currentCount < _maxGraphCount )
        {
            _time		 [ _currentCount ] = time;
            _numSwimbots [ _currentCount ] = numSwimbots;
            //_numSwimbots1[ _currentCount ] = numSwimbots + 200;
            _numFoodBits [ _currentCount ] = numFoodBits;
            _numFoodBits1[ _currentCount ] = numFoodBits1;
        
            _currentCount ++;
        }
        else
        {
            _time		 [ _maxGraphCount ] = time;
            _numSwimbots [ _maxGraphCount ] = numSwimbots;
            //_numSwimbots1[ _maxGraphCount ] = numSwimbots + 200;
            _numFoodBits [ _maxGraphCount ] = numFoodBits;
            _numFoodBits1[ _maxGraphCount ] = numFoodBits1;
        
            this.scroll();
        }
    } 


	//-----------------------
	this.scroll = function()
	{	
        for (let c=0; c<_maxGraphCount; c++)
        {
            _time		 [c] = _time	    [c+1];
            _numSwimbots [c] = _numSwimbots	[c+1];
            //_numSwimbots1[c] = _numSwimbots	[c+1];
            _numFoodBits [c] = _numFoodBits	[c+1];
            _numFoodBits1[c] = _numFoodBits1[c+1];
        }
    }
    

	//------------------------
	this.clear = function()
	{	
        //console.log( "clear graph!" );	

        let graphCanvasID = document.getElementById( 'graphCanvas' );
        let graphCanvas   = graphCanvasID.getContext( '2d' );
    
        graphCanvas.clearRect( 0, 0, graphCanvasID.width, graphCanvasID.height );	    
	}
	
	
	//------------------------
	this.render = function()
	{	
let graphCanvasID = document.getElementById( 'graphCanvas' );
let graphCanvas   = graphCanvasID.getContext( '2d' );

_width  = graphCanvasID.width;
_height = graphCanvasID.height;

_left = 0;
_top = 0;
	    
	    _bottom = _top  + _height;
	    _right  = _left + _width;
	    
        _graphLeft	    = _left        + GRAPH_LEFT_MARGIN;
        _graphRight	    = _right       - GRAPH_RIGHT_MARGIN;
        _graphBottom	= _bottom	   - GRAPH_BOTTOM_MARGIN;
        _graphTop	    = _top		   + GRAPH_TOP_MARGIN;
        _graphWidth	    = _graphRight  - _graphLeft;
        _graphHeight    = _graphBottom - _graphTop;

        _level1000	= _graphBottom - ( 1000	* RECIPROCAL_OF_MAX_POP ) * _graphHeight;
        _level0500	= _graphBottom - ( 500	* RECIPROCAL_OF_MAX_POP ) * _graphHeight;
        _level0000	= _graphBottom - (   0	* RECIPROCAL_OF_MAX_POP ) * _graphHeight;

        //-------------------------------
        // draw the box
        //-------------------------------
		graphCanvas.lineWidth = 1; 
        graphCanvas.fillStyle   = "rgb( 240, 238, 230 )";
        graphCanvas.strokeStyle = "rgb( 0, 0, 0 )";
        graphCanvas.fillRect  ( _graphLeft, _graphTop, _graphWidth, _graphHeight );
        graphCanvas.strokeRect( _graphLeft, _graphTop, _graphWidth, _graphHeight );
        
        //------------------------------------------------
        // render the horizontal lines 
        //------------------------------------------------
		graphCanvas.lineWidth = 1.0; 
        graphCanvas.strokeStyle = "rgba( 100, 100, 100, 0.5 )";
        graphCanvas.beginPath();
        graphCanvas.moveTo( _graphLeft,  _level1000 );
        graphCanvas.lineTo( _graphRight, _level1000 );
        graphCanvas.stroke();
        graphCanvas.closePath();

        graphCanvas.beginPath();
        graphCanvas.moveTo( _graphLeft,  _level0500 );
        graphCanvas.lineTo( _graphRight, _level0500 );
        graphCanvas.stroke();
        graphCanvas.closePath();
        
        //-------------------------------
        // render the actual graph
        //-------------------------------
        this.renderPopulationLines();
        
        //-------------------------------
        // show data
        //-------------------------------  
        if ( _currentCount > 1 )
        {
            //let timeStepString = _time       [ _currentCount -1 ].toString();
            //let swimbotString  = _numSwimbots[ _currentCount -1 ].toString();
            //let foodbitString  = _numFoodBits[ _currentCount -1 ].toString();
            //let foodbit1String = _numFoodBits1[ _currentCount -1 ].toString();
            
            let timeStep  = _bottom - GRAPH_BOTTOM_MARGIN +  30;
            let swimbotY  = _bottom - GRAPH_BOTTOM_MARGIN +  50;
          //let swimbot1  = _bottom - GRAPH_BOTTOM_MARGIN +  70;
            let foodbitY  = _bottom - GRAPH_BOTTOM_MARGIN +  67;
            let foodbit1Y = _bottom - GRAPH_BOTTOM_MARGIN +  84;
            
            let left = _graphLeft + 30;
             
            graphCanvas.clearRect( _graphLeft, _bottom - GRAPH_BOTTOM_MARGIN, _graphWidth, GRAPH_BOTTOM_MARGIN );
            
            graphCanvas.font = "20px Times";
            graphCanvas.fillStyle = "rgb( 100, 100, 100 )";	
            	
            graphCanvas.fillText( "0",      left, _level0000 -  8 );        
            graphCanvas.fillText( "500",    left, _level0500 +  8 );        
            graphCanvas.fillText( "1000",   left, _level1000 + 18 );        
            
            graphCanvas.lineWidth = 2; 
            graphCanvas.strokeStyle = GRAPH_FOODBIT_COLOR;
            graphCanvas.beginPath();
            graphCanvas.moveTo( left + 140, foodbitY );
            graphCanvas.lineTo( left + 250, foodbitY );
            graphCanvas.stroke();
            graphCanvas.closePath();

            graphCanvas.lineWidth = 2; 
            graphCanvas.strokeStyle = GRAPH_FOODBIT_1_COLOR;
            graphCanvas.beginPath();
            graphCanvas.moveTo( left + 140, foodbit1Y );
            graphCanvas.lineTo( left + 250, foodbit1Y );
            graphCanvas.stroke();
            graphCanvas.closePath();

            graphCanvas.lineWidth = 2; 
            graphCanvas.strokeStyle = GRAPH_SWIMBOT_COLOR;
            graphCanvas.beginPath();
            graphCanvas.moveTo( left + 140, swimbotY );
            graphCanvas.lineTo( left + 250, swimbotY );
            graphCanvas.stroke();
            graphCanvas.closePath();

            /*
            graphCanvas.lineWidth = 2; 
            graphCanvas.strokeStyle = GRAPH_SWIMBOT_1_COLOR;
            graphCanvas.beginPath();
            graphCanvas.moveTo( left + 120, swimbot1 - 6 );
            graphCanvas.lineTo( left + 180, swimbot1 - 6 );
            graphCanvas.stroke();
            graphCanvas.closePath();
            */
        }
        
    
        /*
        int textSize = 14;
        graphics.setTextSize( textSize );

        //---------------------------------------------------------
        // render the label for 'population'
        //---------------------------------------------------------
        graphics.setColor( 0.9, 0.9, 0.9 ); 
        graphics.drawString( "Population Graph", graphLeft, graphTop - 5 );	
    
        //---------------------------------------------------------
        // render the labels for time
        //---------------------------------------------------------
        long startTime	= 0;
        long endTime		= GRAPH_TIME_SPAN;
    
        if ( time[ currentCount - 1 ] > GRAPH_TIME_SPAN )
        {
            startTime	= time[0];
            endTime		= time[ currentCount - 1 ];
        }
    
        sprintf( startTimeLabel,	"%ld", startTime	);
        sprintf( endTimeLabel,		"%ld", endTime	);

        graphics.setColor( 0.0, 0.0, 0.0 );
        graphics.drawString( startTimeLabel,	graphLeft,						graphBottom + textSize );	
        graphics.drawString( "time",			left + width * ONE_HALF - 10.0, graphBottom + textSize );	
        graphics.drawString( endTimeLabel,		graphRight - 60,				graphBottom + textSize );	
    
        //---------------------------------------------------------
        // render the numbers for the populations
        //---------------------------------------------------------
        if ( currentCount > 0 )
        {
            sprintf( timeLabel,		"time: %ld",		time		[ currentCount - 1 ] );
            sprintf( swimbotLabel,	"swimbots: %d",		numSwimbots	[ currentCount - 1 ] );
            sprintf( foodBitLabel,	"food bits: %d",	numFoodBits	[ currentCount - 1 ] );

            graphics.setColor( 0.8, 0.8, 0.8 ); graphics.drawString( timeLabel,		graphLeft,	bottom - textSize - textSize * 2.4 );	
            graphics.setColor( 1.0, 0.9, 0.8 );	graphics.drawString( swimbotLabel,	graphLeft,	bottom - textSize - textSize * 1.2 );	
            graphics.setColor( 0.4, 1.0, 0.4 );	graphics.drawString( foodBitLabel,	graphLeft,	bottom - textSize - textSize * 0.0 );	
        }
        */
    }
    
    

	//---------------------------------------
	this.renderPopulationLines = function()
	{	
        let graphCanvasID = document.getElementById( 'graphCanvas' );
        let graphCanvas   = graphCanvasID.getContext( '2d' );

        let xInc = _width / ( _maxGraphCount );

		graphCanvas.lineWidth = 1.0; 
		
		
//console.log( "_currentCount ' " + _currentCount );
		
        
        for (let g=1; g<_currentCount; g++ )
        {
            let xFraction = (g - 1 ) / _maxGraphCount;        
            let x1	= _graphLeft + xFraction * _graphWidth;
            let x2	= x1 + xInc;
            
            let foodY1      = _graphBottom - ( _numFoodBits [g-1] * RECIPROCAL_OF_MAX_POP ) * _graphHeight;
            let foodY2      = _graphBottom - ( _numFoodBits [g  ] * RECIPROCAL_OF_MAX_POP ) * _graphHeight;

            let food1Y1     = _graphBottom - ( _numFoodBits1[g-1] * RECIPROCAL_OF_MAX_POP ) * _graphHeight;
            let food1Y2     = _graphBottom - ( _numFoodBits1[g  ] * RECIPROCAL_OF_MAX_POP ) * _graphHeight;
            
            let swimbotY1   = _graphBottom - ( _numSwimbots [g-1] * RECIPROCAL_OF_MAX_POP ) * _graphHeight;
            let swimbotY2   = _graphBottom - ( _numSwimbots [g  ] * RECIPROCAL_OF_MAX_POP ) * _graphHeight;

            //let swimbot1Y1  = _graphBottom - ( _numSwimbots1[g-1] * RECIPROCAL_OF_MAX_POP ) * _graphHeight;
            //let swimbot1Y2  = _graphBottom - ( _numSwimbots1[g  ] * RECIPROCAL_OF_MAX_POP ) * _graphHeight;

            if ( foodY2 > _graphBottom - _graphHeight )
            {
                graphCanvas.strokeStyle = GRAPH_FOODBIT_COLOR;
                graphCanvas.beginPath();
                graphCanvas.moveTo( x1, foodY1 );
                graphCanvas.lineTo( x2, foodY2 );
                graphCanvas.stroke();
                graphCanvas.closePath();
            }
        
            if ( food1Y2 > _graphBottom - _graphHeight )
            {
                graphCanvas.strokeStyle = GRAPH_FOODBIT_1_COLOR;
                graphCanvas.beginPath();
                graphCanvas.moveTo( x1, food1Y1 );
                graphCanvas.lineTo( x2, food1Y2 );
                graphCanvas.stroke();
                graphCanvas.closePath();
            }
            
            if ( swimbotY2 > _graphBottom - _graphHeight )
            {
                graphCanvas.strokeStyle = GRAPH_SWIMBOT_COLOR;
                graphCanvas.beginPath();
                graphCanvas.moveTo( x1, swimbotY1 );
                graphCanvas.lineTo( x2, swimbotY2 );
                graphCanvas.stroke();
                graphCanvas.closePath();
            }
            
            /*
            if ( swimbot1Y2 > _graphBottom - _graphHeight )
            {
                graphCanvas.strokeStyle = GRAPH_SWIMBOT_1_COLOR;
                graphCanvas.beginPath();

                //graphCanvas.moveTo( x1, swimbot1Y1 );
                //graphCanvas.lineTo( x2, swimbot1Y2 );

                graphCanvas.moveTo( x1, swimbot1Y1 );
                graphCanvas.lineTo( x2, swimbot1Y2 );

                graphCanvas.stroke();
                graphCanvas.closePath();
            }
            */
        }
     }

}				
				
				
		