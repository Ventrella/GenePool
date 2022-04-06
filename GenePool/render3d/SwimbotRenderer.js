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

function SwimbotRenderer()
{
	let _canvas = null;		// set during initialization

	//---------------------------------
	//  colors 
	//---------------------------------
	const COLOR_WHITENESS   = 0.4; // 0.0 = normal-saturated color; 0.5 = white-washed; 1.0 = pure white
	const DEAD_COLOR_RED    = 0.2;
	const DEAD_COLOR_GREEN  = 0.25;
	const DEAD_COLOR_BLUE   = 0.3;
	const ROLLOVER_COLOR    = "rgba( 180, 190, 200, 0.7 )";	
	const SELECT_COLOR      = "rgba( 255, 255, 255, 0.8 )";	
	const OUTLINE_COLOR     = "rgba( 0, 0, 0, 0.4 )";	
 
	//---------------------------------
	//  spline 
	//---------------------------------
	const DEFAULT_SPLINE_FACTOR = 0.4;

	//---------------------------------
	//  egg size 
	//---------------------------------
	const EGG_SIZE = 5.0;

	//	for debug trails
	const TRAIL_LENGTH = 100;

	//--------------------------------
	// variables from swimbot
	//--------------------------------
	let _phenotype      = new Phenotype(); 
	let _growthScale    = ZERO;
	let _focusDirection = new Vector2D();
	let _brain          = new Brain();
	let _age            = 1000;
	let _energy         = ZERO;
	let _parentPosition = new Vector2D();

	//--------------------------------
	// local variables
	//--------------------------------
	let _colorUtility   = new Color( ZERO, ZERO, ZERO, ONE );
	let _splineFactor   = ZERO;
	let _renderingGenitalsAndMouths = false;
	let _debugTrail     = new Array( TRAIL_LENGTH ); 

	//	renderMode - 0: dont't render, 1: render 2d (canvas), 2: render 3d (AlfEngine)
	var _renderModeNormal = 1;
	var _renderModeSplined = 1;

	//-------------------------------------------
	// set rendering goals
	//-------------------------------------------
	this.setRenderingGoals = function( r )
	{
		_renderingGenitalsAndMouths = r;
	}

	//-----------------------------------------
	//	renderMode - 0: dont't render
	//               1: render 2d (canvas)
	//               2: render 3d (AlfEngine)
	//-----------------------------------------
	this.cycleNormalRenderMode = function()
	{
		//	If prev mode was '3d render', then hide all (dev hack to enable cycling between 2d and 3d render)
		if (_renderModeNormal == 2) {
			genePool3D.setAllNormalSwimmerVisibility( false );
		}

		_renderModeNormal++;
		if ( _renderModeNormal > 2 ) {
			_renderModeNormal = 0;
		}

		console.log( "###### SwimbotRenderer::cycleNormalRenderMode: " + _renderModeNormal );
	}

	this.cycleSplinedRenderMode = function()
	{
		//	If prev mode was '3d render', then hide all (dev hack to enable cycling between 2d and 3d render)
		if (_renderModeSplined == 2) {
			genePool3D.setAllSplinedSwimmerVisibility( false );
		}

		_renderModeSplined++;
		if ( _renderModeSplined > 2 ) {
			_renderModeSplined = 0;
		}

		console.log( "###### SwimbotRenderer::cycleSplinedRenderMode: " + _renderModeSplined );
	}


	//-------------------------------------
	// initialize - one time setup
	//-------------------------------------
	this.initialize = function( canvas )
	{
		_canvas = canvas;

		//-------------------------------------
		// create trail array
		//-------------------------------------
		for (let t=0; t<TRAIL_LENGTH; t++)
		{
			_debugTrail[t] = new Vector2D(); 
		}	
	}

	//------------------------------------------------
	//	dispose of render assets for a given swimmer
	//------------------------------------------------
	this.releaseRenderAssets = function( swimmer ) {
		genePool3D.deleteSwimmer( swimmer );
	}

	//-----------------------
	// render
	//-----------------------
	this.render = function( swimbot, levelOfDetail )
	{
    	_phenotype      = swimbot.getPhenotype();
    	_brain          = swimbot.getBrain();
    	_age            = swimbot.getAge();
    	_energy         = swimbot.getEnergy();
    	_growthScale    = swimbot.getGrowthScale();
    	_focusDirection = swimbot.getFocusDirection();
        
		if ( levelOfDetail == SWIMBOT_LEVEL_OF_DETAIL_DOT )
		{
			this.render2d_lod_dot( _phenotype.parts[1].position, SWIMBOT_DOT_RENDER_RADIUS );
		}
		else if ( levelOfDetail == SWIMBOT_LEVEL_OF_DETAIL_LOW )
		{
			this.render2d_lod_low( swimbot );
		}
		else if ( levelOfDetail == SWIMBOT_LEVEL_OF_DETAIL_HIGH )
		{ 
			this.render_lod_high( swimbot );
		}	
	}


	//-----------------------------------
	//
	//	Original 2D rendering code from GenePool - 4/2/22
	//
	//-----------------------------------
	this.render2d_lod_dot = function( position, radius )
	{
		if (_renderModeNormal == 1 || _renderModeNormal == 2)	// use for both 2 & 3d for now
		{
			let p = 1;
			_colorUtility = this.calculatePartColor(p);  
			_canvas.fillStyle = _colorUtility.rgba();	
		    
			_canvas.beginPath();
			_canvas.arc( position.x, position.y, radius, 0, PI2, false );
			_canvas.fill();
			_canvas.closePath();
		}
	}

	//
	//	Original 2D rendering code from GenePool - 4/2/22
	//
	this.render2d_lod_low = function( swimbot )
	{
		if (_renderModeNormal == 1 || _renderModeNormal == 2)	// use for both 2 & 3d for now
		{
			for (let p=1; p<_phenotype.numParts; p++)
			{
				_parentPosition = swimbot.getPartParentPosition(p);

				_colorUtility = this.calculatePartColor(p);
				_canvas.strokeStyle = _colorUtility.rgba();	
				_canvas.lineWidth = _phenotype.parts[p].width * 2.0; 

				_canvas.beginPath();
				_canvas.moveTo( _parentPosition.x, _parentPosition.y );
				_canvas.lineTo( _phenotype.parts[p].position.x, _phenotype.parts[p].position.y );
				_canvas.closePath();
				_canvas.stroke();
			}
		}
	}

	this.render_lod_high = function( swimbot )
	{ 
		for (let p=1; p<_phenotype.numParts; p++)
		{
			_parentPosition = swimbot.getPartParentPosition(p);
			if ( _phenotype.parts[p].length > ZERO )
			{
				//--------------------------------------------
				// render the part
				//--------------------------------------------
				_splineFactor = DEFAULT_SPLINE_FACTOR; 	
				if ( _phenotype.parts[p].splined )
				{
					switch (_renderModeSplined) {
						case 0 : break;
						case 1 : this.renderPartSplined2d(p); break;
						case 2 : break;
					}
				}
				else
				{
					switch (_renderModeNormal) {
						case 0 : break;
						case 1 : this.renderPartNormal2d(p); break;
						case 2 : break;
					}
				}

				//--------------------------------------------
				// if p is mouth part, render mouth!
				//--------------------------------------------
				if ( p === 1 )
				{
					if ( _renderingGenitalsAndMouths )
					{
						if (( _brain.getState() == BRAIN_STATE_LOOKING_FOR_FOOD	)
						||  ( _brain.getState() == BRAIN_STATE_PURSUING_FOOD ))
						{	
							this.renderMouth2d();
						}
					}
				}

				//	misc debug
				this.renderSwimmerDebug2d();
			}
		}

		if ( _renderingGenitalsAndMouths )
		{
			//--------------------------------------------
			// render genital!
			//--------------------------------------------
			if (( _brain.getState() == BRAIN_STATE_LOOKING_FOR_MATE	)
			||  ( _brain.getState() == BRAIN_STATE_PURSUING_MATE ))
			{
				this.renderGenital2d();
			}
		}
	}

	//------------------------------------------------------
	// calculate part color 
	//------------------------------------------------------
	this.calculatePartColor = function(p)
	{
	    _colorUtility.red   = _phenotype.parts[p].red;
	    _colorUtility.green = _phenotype.parts[p].green;
	    _colorUtility.blue  = _phenotype.parts[p].blue;
        
        if ( _age < globalTweakers.maximumLifeSpan - OLD_AGE_DURATION )
        {
            if ( _age < YOUNG_AGE_DURATION )
            {
                //------------------------------
                // newborns start white...
                //------------------------------
                _colorUtility.red   = ( ONE - _growthScale ) + ( _colorUtility.red	 * _growthScale );
                _colorUtility.green = ( ONE - _growthScale ) + ( _colorUtility.green * _growthScale );
                _colorUtility.blue  = ( ONE - _growthScale ) + ( _colorUtility.blue	 * _growthScale );
            }
            else
            {
                if ( _energy < STARVING )
                {
                    assert( _energy >= ZERO, "_energy >= ZERO" );

                    let f = ONE - ( _energy / STARVING );
            
                    _colorUtility.red   = DEAD_COLOR_RED    * f + _phenotype.parts[p].red   * ( ONE - f );
                    _colorUtility.green = DEAD_COLOR_GREEN  * f + _phenotype.parts[p].green * ( ONE - f );
                    _colorUtility.blue  = DEAD_COLOR_BLUE   * f + _phenotype.parts[p].blue  * ( ONE - f );
                 }
            }
        }
        else
        {
            let oldAgeThreshold = globalTweakers.maximumLifeSpan - OLD_AGE_DURATION;
        
            let f = ( _age - oldAgeThreshold ) / OLD_AGE_DURATION;
            
            assert( f >= ZERO, "SwibotRenderer:renderPartSplined: f >= ZERO" );
            assert( f <= ONE,  "SwibotRenderer:renderPartSplined: f <= ONE"  );
        
            // I had an assert before, but this is just graphics, and 
            // I assume if it is above 1, it's only by a tiny amount.
            if ( f > ONE )
            {
                f = ONE;
            }
        
            _colorUtility.red   = DEAD_COLOR_RED    * f + _phenotype.parts[p].red   * ( ONE - f );
            _colorUtility.green = DEAD_COLOR_GREEN  * f + _phenotype.parts[p].green * ( ONE - f );
            _colorUtility.blue  = DEAD_COLOR_BLUE   * f + _phenotype.parts[p].blue  * ( ONE - f );
        }
        
        assert( _colorUtility.red   >= ZERO, "_colorUtility.red   >= ZERO" );
        assert( _colorUtility.red   <= ONE,  "_colorUtility.red   <= ONE"  );

        assert( _colorUtility.green >= ZERO, "_colorUtility.green >= ZERO" );
        assert( _colorUtility.green <= ONE,  "_colorUtility.green <= ONE"  );

        assert( _colorUtility.blue  >= ZERO, "_colorUtility.blue  >= ZERO" );
        assert( _colorUtility.blue  <= ONE,  "_colorUtility.blue  <= ONE"  );
        
	    return _colorUtility;
	}


	//=======================================================================================================
	//
	//	2D rendering (copied from Canvas renderer 4/2/22) is order to support 2D/3D render toggle 
	//	for side by side comparison
	//
	//=======================================================================================================

	//-----------------------------------
	// render part normal (not splined)
	//
	//	Original 2D rendering code from GenePool - 4/2/22
	//-----------------------------------
	this.renderPartNormal2d = function(p)
	{			
        let width     = _phenotype.parts[p].width;
        let position  = _phenotype.parts[p].position;
        
        //---------------------------
        // baby growing...
        //---------------------------
        if ( _growthScale < ONE )        
        {
            width = width * _growthScale + EGG_SIZE * ( ONE - _growthScale );
        }

        let pp0x = _phenotype.parts[p].perpendicular.x * width;
        let pp0y = _phenotype.parts[p].perpendicular.y * width;

        let pp1x = _phenotype.parts[p].perpendicular.x * width;
        let pp1y = _phenotype.parts[p].perpendicular.y * width;

        let x0 = _parentPosition.x - pp1x;
        let y0 = _parentPosition.y - pp1y;

        let x1 = _parentPosition.x + pp1x;
        let y1 = _parentPosition.y + pp1y;

        let x2 = position.x + pp0x;
        let y2 = position.y + pp0y;

        let x3 = position.x - pp0x;
        let y3 = position.y - pp0y;		
    
        _colorUtility = this.calculatePartColor(p);
		_canvas.fillStyle = _colorUtility.rgba();	

        _canvas.beginPath();
        _canvas.moveTo( x0, y0 );
        _canvas.lineTo( x1, y1 );
        _canvas.lineTo( x2, y2 );
        _canvas.lineTo( x3, y3 );
        _canvas.closePath();
        _canvas.fill();
        
        let radius = width;

        _canvas.beginPath();
        _canvas.arc( position.x, position.y, radius, 0, PI2, false );
        _canvas.fill();
        _canvas.closePath();	

        _canvas.beginPath();
        _canvas.arc( _parentPosition.x, _parentPosition.y, radius, 0, PI2, false );								
        _canvas.fill();
        _canvas.closePath();	

        //--------------------------------
        // outline
        //--------------------------------
        _canvas.lineWidth = 1.0; 
        _canvas.strokeStyle = OUTLINE_COLOR

        let radian = _phenotype.parts[p].currentAngle * PI_OVER_180;

        _canvas.beginPath();
        _canvas.arc( _parentPosition.x, _parentPosition.y, radius, Math.PI - radian, Math.PI - radian + Math.PI, false );
        _canvas.stroke();
        _canvas.closePath();	    

        _canvas.beginPath();
        _canvas.moveTo( x1, y1 );
        _canvas.lineTo( x2, y2 );
        _canvas.arc( position.x, position.y, radius, -radian, -radian + Math.PI, false );
        _canvas.moveTo( x0, y0 );
        _canvas.lineTo( x3, y3 );
        _canvas.stroke();
        _canvas.closePath();	
    }

	//------------------------------------
	// render part splined 
	//
	//	Original 2D rendering code from GenePool - 4/2/22
	//
	//------------------------------------
	this.renderPartSplined2d = function(p)
	{
	    let parentIndex     = _phenotype.parts[p].parent;
        let position 		= _phenotype.parts[p].position;
        let width           = _phenotype.parts[p].width;
        let parentWidth     = _phenotype.parts[ parentIndex ].width;

        //---------------------------
        // baby growing...
        //---------------------------
        if ( _growthScale < ONE )        
        {
            width       = width         * _growthScale + EGG_SIZE * ( ONE - _growthScale );
            parentWidth = parentWidth   * _growthScale + EGG_SIZE * ( ONE - _growthScale );
        }

        let perpStartX  = _phenotype.parts[p].perpendicular.x;
        let perpStartY  = _phenotype.parts[p].perpendicular.y;
        let perpEndX    = _phenotype.parts[p].perpendicular.x;
        let perpEndY    = _phenotype.parts[p].perpendicular.y;

        let controlVectorLength = _phenotype.parts[p].length * _splineFactor;

        //-------------------------------------------------------------------------------
        // blend the two perpendiculars to represent the perpendicular of the joint
        //-------------------------------------------------------------------------------
        if (( p > 1 ) && ( ! _phenotype.parts[p].branch ))
        {
            perpStartX += _phenotype.parts[ parentIndex ].perpendicular.x;
            perpStartY += _phenotype.parts[ parentIndex ].perpendicular.y;
    
            let length = Math.sqrt( perpStartX * perpStartX + perpStartY * perpStartY );
            perpStartX /= length;
            perpStartY /= length;
        }

        
        if ( _phenotype.parts[p].child != NULL_INDEX )
        {
            perpEndX += _phenotype.parts[ _phenotype.parts[p].child ].perpendicular.x;
            perpEndY += _phenotype.parts[ _phenotype.parts[p].child ].perpendicular.y;

            let length = Math.sqrt( perpEndX * perpEndX + perpEndY * perpEndY );
            perpEndX /= length;
            perpEndY /= length;
        }

        //--------------------------------------
        // determine the two control vectors
        //--------------------------------------
        let control1DirectionX = -perpStartY;
        let control1DirectionY =  perpStartX;

        let control2DirectionX =  perpEndY;
        let control2DirectionY = -perpEndX;

        let control1VectorX = control1DirectionX * controlVectorLength;
        let control1VectorY = control1DirectionY * controlVectorLength;

        let control2VectorX = control2DirectionX * controlVectorLength;
        let control2VectorY = control2DirectionY * controlVectorLength;

        //--------------------------------------
        // scale the two perpendiculars
        //--------------------------------------
        perpEndX *= width;
        perpEndY *= width;

        if ( p === 1 ) 
        {
            perpStartX  *= width;
            perpStartY  *= width;
        }
        else
        {
            perpStartX  *= parentWidth;
            perpStartY  *= parentWidth;
        }

        //---------------------------------------------------------------------------------------
        // create the start and end points and the control points for the Bezier curve...
        //---------------------------------------------------------------------------------------
        let startLeftX      = _parentPosition.x  - perpStartX;
        let startLeftY      = _parentPosition.y  - perpStartY;
        let startRightX     = _parentPosition.x  + perpStartX;
        let startRightY     = _parentPosition.y  + perpStartY;
        let control1X       = _parentPosition.x                  + control1VectorX;
        let control1Y       = _parentPosition.y                  + control1VectorY;
        let control1LeftX   = _parentPosition.x  - perpStartX    + control1VectorX;
        let control1LeftY   = _parentPosition.y  - perpStartY    + control1VectorY;
        let control1RightX  = _parentPosition.x  + perpStartX    + control1VectorX;
        let control1RightY  = _parentPosition.y  + perpStartY    + control1VectorY;

        let endLeftX        = position.x        - perpEndX;
        let endLeftY        = position.y        - perpEndY;
        let endRightX       = position.x        + perpEndX;
        let endRightY       = position.y        + perpEndY;
        let control2X       = position.x                        + control2VectorX;
        let control2Y       = position.y                        + control2VectorY;
        let control2LeftX   = position.x        - perpEndX      + control2VectorX;
        let control2LeftY   = position.y        - perpEndY      + control2VectorY;
        let control2RightX  = position.x        + perpEndX      + control2VectorX;
        let control2RightY  = position.y        + perpEndY      + control2VectorY;

        //---------------------------------------
        // get color
        //---------------------------------------
        _colorUtility = this.calculatePartColor(p);
		_canvas.fillStyle = _colorUtility.rgba();	
        _canvas.strokeStyle = OUTLINE_COLOR;

        //---------------------------------------
        // the beginning of a series of parts
        //---------------------------------------
        if ( p === 1 )
        {
            _canvas.beginPath();
            _canvas.arc( _phenotype.parts[ parentIndex ].position.x, _phenotype.parts[ parentIndex ].position.y, width, 0, PI2, false );
            _canvas.fill();
            _canvas.closePath();	
            
            let radian = _phenotype.parts[ parentIndex ].currentAngle * PI_OVER_180;
            
            _canvas.beginPath();
            _canvas.arc
            ( 
                _phenotype.parts[ parentIndex ].position.x, 
                _phenotype.parts[ parentIndex ].position.y, 
                width, 
                
                Math.PI - radian, 
                Math.PI - radian + Math.PI, 
                
                false 
            );
            
            _canvas.stroke();
            _canvas.closePath();	    
        }

        //---------------------------------------
        // a terminating end part
        //---------------------------------------
        if ( _phenotype.parts[p].child === NULL_INDEX )
        {        
            let s =  width * _phenotype.parts[p].endCapSpline;
            let f = -1.0; // basically, a pixel's width...I think
            
            let axisNormalX = _phenotype.parts[p].axis.x / _phenotype.parts[p].length;
            let axisNormalY = _phenotype.parts[p].axis.y / _phenotype.parts[p].length;
            
//the perpendicular of the perpendicular!!!!            
//axisNormalX = -_phenotype.parts[p].perpendicular.y;
//axisNormalY =  _phenotype.parts[p].perpendicular.x;
            
            let startx  = endLeftX  + axisNormalX * f;
            let starty  = endLeftY  + axisNormalY * f;
            let endx    = endRightX + axisNormalX * f;
            let endy    = endRightY + axisNormalY * f;
            let c1x     = endLeftX  + axisNormalX * s;
            let c1y     = endLeftY  + axisNormalY * s;
            let c2x     = endRightX + axisNormalX * s;
            let c2y     = endRightY + axisNormalY * s;

            _canvas.beginPath();
            _canvas.moveTo( startx, starty );
            _canvas.bezierCurveTo( c1x, c1y, c2x, c2y, endx, endy );
            _canvas.closePath();	    
            _canvas.fill();

            _canvas.moveTo( startx, starty );
            _canvas.bezierCurveTo( c1x, c1y, c2x, c2y, endx, endy );
            _canvas.stroke();

            /*
            _canvas.fillStyle = "rgb( 255, 255, 0 )";
            _canvas.beginPath();
            _canvas.arc( startx, starty, 1.5, 0, PI2, false );
            _canvas.fill();
            _canvas.closePath();	    

            _canvas.fillStyle = "rgb( 255, 255, 0 )";
            _canvas.beginPath();
            _canvas.arc( endx, endy, 1.5, 0, PI2, false );
            _canvas.fill();
            _canvas.closePath();	    

            _canvas.fillStyle = "rgb( 255, 0, 0 )";
            _canvas.beginPath();
            _canvas.arc( c1x, c1y, 0.5, 0, PI2, false );
            _canvas.fill();
            _canvas.closePath();	    

            _canvas.fillStyle = "rgb( 255, 0, 0 )";
            _canvas.beginPath();
            _canvas.arc( c2x, c2y, 0.5, 0, PI2, false );
            _canvas.fill();
            _canvas.closePath();	    
            */


            /*
            _canvas.beginPath();
            _canvas.arc( position.x, position.y, width, 0, PI2, false );
            _canvas.fill();
            _canvas.closePath();	
            
            let radian = ( _phenotype.parts[p].currentAngle + 180 ) * PI_OVER_180;
            
            _canvas.beginPath();
            _canvas.arc( position.x, position.y, width, Math.PI - radian, Math.PI - radian + Math.PI, false );
            _canvas.stroke();
            _canvas.closePath();	 
            */
             
        }
        
        //---------------------------------------
        // fill interior
        //---------------------------------------
        _canvas.beginPath();
        _canvas.moveTo( startLeftX, startLeftY );
        _canvas.bezierCurveTo( control1LeftX, control1LeftY, control2LeftX, control2LeftY, endLeftX, endLeftY );
        _canvas.lineTo( endRightX, endRightY );
        _canvas.bezierCurveTo( control2RightX, control2RightY, control1RightX, control1RightY, startRightX, startRightY );
        _canvas.lineTo( startLeftX, startLeftY );
        _canvas.closePath();	    
        _canvas.fill();	

        _canvas.beginPath();
        _canvas.arc( _parentPosition.x, _parentPosition.y, parentWidth * 0.9, 0, PI2, false );								
        _canvas.fill();
        _canvas.closePath();	

        //---------------------------------------
        // draw outline
        //---------------------------------------
        _canvas.lineWidth = 1.0;       	
        _canvas.beginPath();
        _canvas.moveTo( startLeftX, startLeftY );
        _canvas.bezierCurveTo( control1LeftX, control1LeftY, control2LeftX, control2LeftY, endLeftX, endLeftY );
        _canvas.moveTo( endRightX, endRightY );
        _canvas.bezierCurveTo( control2RightX, control2RightY, control1RightX, control1RightY, startRightX, startRightY );
        _canvas.stroke();								
        _canvas.closePath();	



        /*
        _canvas.fillStyle = "rgb( 0, 0, 0 )";
        _canvas.beginPath();
        _canvas.arc( position.x, position.y, 1.0, 0, PI2, false );
        _canvas.fill();
        _canvas.closePath();	    

        _canvas.fillStyle = "rgb( 0, 0, 0 )";
        _canvas.beginPath();
        _canvas.arc( _parentPosition.x, _parentPosition.y, 1.0, 0, PI2, false );
        _canvas.fill();
        _canvas.closePath();	    
        */


        /*
        _canvas.lineWidth = 0.5; 

        _canvas.strokeStyle = "rgb( 255, 255, 255 )";
        _canvas.beginPath();
        _canvas.arc( startLeftX, startLeftY, 1.0, 0, PI2, false );
        _canvas.stroke();
        _canvas.closePath();	   					

        _canvas.strokeStyle = "rgb( 255, 255, 255 )";
        _canvas.beginPath();
        _canvas.arc( startRightX, startRightY, 1.0, 0, PI2, false );
        _canvas.stroke();
        _canvas.closePath();	   					

        _canvas.strokeStyle = "rgb( 255, 255, 255 )";
        _canvas.beginPath();
        _canvas.arc( endLeftX, endLeftY, 1.0, 0, PI2, false );
        _canvas.stroke();
        _canvas.closePath();	   					

        _canvas.strokeStyle = "rgb( 255, 255, 255 )";
        _canvas.beginPath();
        _canvas.arc( endRightX, endRightY, 1.0, 0, PI2, false );
        _canvas.stroke();
        _canvas.closePath();	   					
        */


        /*
        _canvas.fillStyle = "rgb( 255, 0, 255 )";
        _canvas.beginPath();
        _canvas.arc( control1X, control1Y, 0.5, 0, PI2, false );
        _canvas.fill();
        _canvas.closePath();	    

        _canvas.fillStyle = "rgb( 255, 0, 255 )";
        _canvas.beginPath();
        _canvas.arc( control2X, control2Y, 0.5, 0, PI2, false );
        _canvas.fill();
        _canvas.closePath();	    

        _canvas.fillStyle = "rgb( 255, 255, 0 )";
        _canvas.beginPath();
        _canvas.arc( control1LeftX, control1LeftY, 0.5, 0, PI2, false );
        _canvas.fill();
        _canvas.closePath();	    

        _canvas.fillStyle = "rgb( 255, 255, 255 )";
        _canvas.beginPath();
        _canvas.arc( control1RightX, control1RightY, 0.5, 0, PI2, false );
        _canvas.fill();
        _canvas.closePath();	   					

        _canvas.fillStyle = "rgb( 255, 255, 0 )";
        _canvas.beginPath();
        _canvas.arc( control2LeftX, control2LeftY, 0.5, 0, PI2, false );
        _canvas.fill();
        _canvas.closePath();	    

        _canvas.fillStyle = "rgb( 255, 255, 255 )";
        _canvas.beginPath();
        _canvas.arc( control2RightX, control2RightY, 0.5, 0, PI2, false );
        _canvas.fill();
        _canvas.closePath();	   					
        */



        /*
        _canvas.lineWidth = 0.5; 
        _canvas.strokeStyle = "rgba( 100, 255, 100, 0.9 )";
        _canvas.beginPath();
        _canvas.moveTo( _parentPosition.x, _parentPosition.y );
        _canvas.bezierCurveTo( control1X, control1Y, control2X, control2Y, position.x, position.y );
        _canvas.stroke();								


        _canvas.lineWidth = 0.5; 
        _canvas.strokeStyle = "rgba( 100, 255, 100, 0.9 )";
        _canvas.beginPath();
        _canvas.moveTo( startLeftX, startLeftY );
        _canvas.bezierCurveTo( control1LeftX, control1LeftY, control2LeftX, control2LeftY, endLeftX, endLeftY );
        _canvas.stroke();								

        _canvas.lineWidth = 0.5; 
        _canvas.strokeStyle = "rgba( 100, 255, 100, 0.9 )";
        _canvas.beginPath();
        _canvas.moveTo( startRightX, startRightY );
        _canvas.bezierCurveTo( control1RightX, control1RightY, control2RightX, control2RightY, endRightX, endRightY );
        _canvas.stroke();								
        */

        // show main axis
        /*
        _canvas.lineWidth = 0.5; 
        _canvas.strokeStyle = "rgba( 100, 100, 200, 0.6 )";
        _canvas.beginPath();
        _canvas.moveTo( _parentPosition.x, _parentPosition.y );
        _canvas.lineTo( position.x, position.y );
        _canvas.stroke();								
        */


        // show block outline
        /*
        _canvas.lineWidth = 0.5; 
        _canvas.strokeStyle = "rgba( 100, 0, 0, 0.6 )";
        _canvas.beginPath();
        _canvas.moveTo( startLeftX, startLeftY );
        _canvas.lineTo( startRightX, startRightY );
        _canvas.stroke();								

        _canvas.lineWidth = 0.5; 
        _canvas.strokeStyle = "rgba( 100, 0, 0, 0.6 )";
        _canvas.beginPath();
        _canvas.moveTo( startRightX, startRightY );
        _canvas.lineTo( endRightX,   endRightY   );
        _canvas.stroke();								

        _canvas.lineWidth = 0.5; 
        _canvas.strokeStyle = "rgba( 100, 0, 0, 0.6 )";
        _canvas.beginPath();
        _canvas.moveTo( endRightX,   endRightY   );
        _canvas.lineTo( endLeftX,    endLeftY    );
        _canvas.stroke();								

        _canvas.lineWidth = 0.5; 
        _canvas.strokeStyle = "rgba( 100, 0, 0, 0.6 )";
        _canvas.beginPath();
        _canvas.moveTo( endLeftX,    endLeftY   );
        _canvas.lineTo( startLeftX,  startLeftY  );
        _canvas.stroke();								
        */
    }


	this.renderSwimmerDebug2d = function()
	{
		/*
		//------------------------------------------
		// show part mid position 
		//------------------------------------------
		_canvas.fillStyle = "rgb( 244, 244, 244 )";	
		_canvas.beginPath();
		_canvas.arc( _phenotype.parts[p].midPosition.x, _phenotype.parts[p].midPosition.y, 0.05, 0, PI2, false );
		_canvas.fill();
		_canvas.closePath();	
					

		//------------------------------------------
		// show part velocity
		//------------------------------------------
		let scale = 12.0;
		_canvas.strokeStyle = "rgb( 255, 255, 0 )";	
		_canvas.beginPath();
		_canvas.moveTo( _phenotype.parts[p].midPosition.x, _phenotype.parts[p].midPosition.y );
		_canvas.lineTo( _phenotype.parts[p].midPosition.x - _phenotype.parts[p].velocity.x * scale, _phenotype.parts[p].midPosition.y - _phenotype.parts[p].velocity.y * scale );
                    
		// just show displacement of mid position
		//_canvas.lineTo( _phenotype.parts[p].previousMid.x, _phenotype.parts[p].previousMid.y );
		_canvas.stroke();
		_canvas.closePath();	

		//------------------------------------------
		// show part perpendicular
		//------------------------------------------
		scale = 10.0;
		_canvas.strokeStyle = "rgb( 0, 255, 0 )";	
		_canvas.beginPath();
		_canvas.moveTo( _phenotype.parts[p].midPosition.x, _phenotype.parts[p].midPosition.y );
		_canvas.lineTo( _phenotype.parts[p].midPosition.x + _phenotype.parts[p].perpendicular.x * scale, _phenotype.parts[p].midPosition.y + _phenotype.parts[p].perpendicular.y * scale );
		_canvas.stroke();
		_canvas.closePath();	
		*/
	}




    
	//--------------------------------
	// render genital
	//--------------------------------
	this.renderGenital2d = function()
	{	
        let genitalLength = SWIMBOT_GENITAL_LENGTH * _growthScale;
        
        let x = _phenotype.parts[ GENITAL_INDEX ].position.x + _focusDirection.x * genitalLength;
        let y = _phenotype.parts[ GENITAL_INDEX ].position.y + _focusDirection.y * genitalLength;
        
		_canvas.lineWidth = 1.0; 
        _canvas.strokeStyle = "rgba( 255, 255, 255, 0.7 )";	
        _canvas.beginPath();
        _canvas.moveTo( _phenotype.parts[ GENITAL_INDEX ].position.x, _phenotype.parts[ GENITAL_INDEX ].position.y );
        _canvas.lineTo( x, y );
        _canvas.stroke();
        _canvas.closePath();			
        
        //--------------------------------------------------------
        // if pursuing a mate, show arrow head
        //--------------------------------------------------------
        if ( _brain.getState() === BRAIN_STATE_PURSUING_MATE )
        {
            let arrowLength = genitalLength * 0.4;
            let arrowWidth  = genitalLength * 0.25;
            let xLeft  = x - _focusDirection.y * arrowWidth - _focusDirection.x * arrowLength;
            let yLeft  = y + _focusDirection.x * arrowWidth - _focusDirection.y * arrowLength;

            let xRight = x + _focusDirection.y * arrowWidth - _focusDirection.x * arrowLength;
            let yRight = y - _focusDirection.x * arrowWidth - _focusDirection.y * arrowLength;
            
            _canvas.beginPath();
            _canvas.lineTo( x, y );
            _canvas.lineTo( xRight, yRight );
            _canvas.stroke();
            _canvas.closePath();			
        }
	}





	//--------------------------------
	// render mouth
	//--------------------------------
	this.renderMouth2d = function()
	{		    
// older version	
/*
let mouthLength = SWIMBOT_MOUTH_LENGTH * _growthScale;
let mouthEndX = _phenotype.parts[ MOUTH_INDEX ].position.x + _focusDirection.x * mouthLength;
let mouthEndY = _phenotype.parts[ MOUTH_INDEX ].position.y + _focusDirection.y * mouthLength;

_canvas.lineWidth = SWIMBOT_MOUTH_WIDTH; 
_canvas.strokeStyle = "rgb( 50, 200, 50 )";	

//--------------------------------------------------------
// if pursuing a food bit, show jaws
//--------------------------------------------------------
if ( _brain.getState() === BRAIN_STATE_PURSUING_FOOD )
{
    let px = _focusDirection.y * mouthLength * 0.4;
    let py = _focusDirection.x * mouthLength * 0.4;
    let fx = _focusDirection.x * mouthLength * 0.6;
    let fy = _focusDirection.y * mouthLength * 0.6;
    
    let leftJawX  = mouthEndX - px + fx;
    let leftJawY  = mouthEndY + py + fy;
    let rightJawX = mouthEndX + px + fx;
    let rightJawY = mouthEndY - py + fy;

    _canvas.beginPath();            
    _canvas.moveTo( leftJawX,  leftJawY  );
    _canvas.lineTo( _phenotype.parts[ MOUTH_INDEX ].position.x, _phenotype.parts[ MOUTH_INDEX ].position.y );
    _canvas.lineTo( rightJawX, rightJawY );
    _canvas.stroke();
    _canvas.closePath();		
}
else
{
    _canvas.beginPath();
    _canvas.moveTo( _phenotype.parts[ MOUTH_INDEX ].position.x, _phenotype.parts[ MOUTH_INDEX ].position.y );
    _canvas.lineTo( mouthEndX, mouthEndY );
    _canvas.stroke();
    _canvas.closePath();						
}	
*/        
        // new version
        
	    let mouthLength = _phenotype.parts[1].width * 2.5;
	    if ( mouthLength < SWIMBOT_MIN_MOUTH_LENGTH )
	    {
	        mouthLength = SWIMBOT_MIN_MOUTH_LENGTH;
	    }
	    	    
	    let mouthWidth = _phenotype.parts[1].width;
	    if ( mouthWidth < SWIMBOT_MIN_MOUTH_WIDTH )
	    {
	        mouthWidth = SWIMBOT_MIN_MOUTH_WIDTH;
	    }
	    
	    mouthLength *= _growthScale;
	    mouthWidth  *= _growthScale;
	    
	    let baseX = _phenotype.parts[ MOUTH_INDEX ].position.x;
	    let baseY = _phenotype.parts[ MOUTH_INDEX ].position.y;

        let mouthStartX = baseX + _focusDirection.x * mouthLength * 0.3;
        let mouthStartY = baseY + _focusDirection.y * mouthLength * 0.3;

        let mouthEndX = baseX + _focusDirection.x * mouthLength;
        let mouthEndY = baseY + _focusDirection.y * mouthLength;
        
        let basePerpX =  _focusDirection.y * _phenotype.parts[1].width * 0.5;
        let basePerpY = -_focusDirection.x * _phenotype.parts[1].width * 0.5;

        let endPerpX  =  _focusDirection.y * mouthWidth;
        let endPerpY  = -_focusDirection.x * mouthWidth;
        
        let leftJawX  = baseX - basePerpX;
        let leftJawY  = baseY - basePerpY;
        let rightJawX = baseX + basePerpX;
        let rightJawY = baseY + basePerpY;
        
        let leftEndX  = mouthEndX;
        let leftEndY  = mouthEndY;
        let rightEndX = mouthEndX;
        let rightEndY = mouthEndY;
            
		_canvas.lineWidth = SWIMBOT_MOUTH_WIDTH; 
        
        _colorUtility = this.calculatePartColor(1);  
		_canvas.fillStyle = _colorUtility.rgba();	
        
        //--------------------------------------------------------
        // open jaws
        //--------------------------------------------------------
        if ( _brain.getState() === BRAIN_STATE_PURSUING_FOOD )
        {
            leftEndX  -= endPerpX;
            leftEndY  -= endPerpY;
            rightEndX += endPerpX;
            rightEndY += endPerpY;
        }        

        _canvas.beginPath();
        _canvas.moveTo( mouthStartX, mouthStartY );
        _canvas.lineTo( leftJawX,    leftJawY    );
        _canvas.lineTo( leftEndX,    leftEndY    );
        _canvas.lineTo( mouthStartX, mouthStartY );
        _canvas.lineTo( rightEndX,   rightEndY   );
        _canvas.lineTo( rightJawX,   rightJawY   );
        _canvas.lineTo( leftJawX,    leftJawY    );
        _canvas.fill();
        _canvas.closePath();	
        
        _canvas.strokeStyle = "rgba( 255, 255, 255, 0.7 )";	
        _canvas.beginPath();
        _canvas.moveTo( rightEndX,   rightEndY  );
        _canvas.lineTo( mouthStartX, mouthStartY );
        _canvas.lineTo( leftEndX,    leftEndY );
        _canvas.stroke();
        _canvas.closePath();	     
               					
        _canvas.strokeStyle = OUTLINE_COLOR; 
        _canvas.beginPath();
        _canvas.moveTo( leftJawX, leftJawY );
        _canvas.lineTo( leftEndX, leftEndY );
        _canvas.stroke();
        _canvas.closePath();	            					

        _canvas.beginPath();
        _canvas.moveTo( rightJawX, rightJawY );
        _canvas.lineTo( rightEndX, rightEndY );
        _canvas.stroke();
        _canvas.closePath();	 
                   					
    }
    

	//---------------------------------------------------------------------------------------------
	//	Trails!
	//---------------------------------------------------------------------------------------------
	this.initializeDebugTrail = function( position )
	{
        for (let t=0; t<TRAIL_LENGTH; t++)
        {
            _debugTrail[t].set( position );
        }	
    }

	//-----------------------------------
	this.showSwimbotTrail = function( position, clock )
	{
        //------------------------------------
        // update trail
        //------------------------------------
        if ( clock % 5 == 0 )
        {
            for (let t=TRAIL_LENGTH-1; t>0; t--)
            {
                _debugTrail[t].set( _debugTrail[t-1] ); 
            }	

           _debugTrail[0].set( position ); 
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
}

