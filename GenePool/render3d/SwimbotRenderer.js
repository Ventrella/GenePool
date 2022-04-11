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
	const OUTLINE_COLOR = "rgba( 0, 0, 0, 0.4 )";	// for 2d comparison code
 
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
	//	function pointers for 2D/3D render cycling (debug)
	this.renderPartNormalOFF   = function(p) {}
	this.renderPartSplinedOFF  = function(p) {}
	this.renderSwimmerDebugOFF = function(p) {}
	this.renderGenitalOFF      = function(p) {}
	this.renderMouthOFF        = function(p) {}
	this.renderPartNormalFunc;
	this.renderPartSplinedFunc;
	this.renderSwimmerDebugFunc;
	this.renderGenitalFunc;
	this.renderMouthFunc;
	var _renderModeNormal;
	var _renderModeSplined;

	this.cycleNormalRenderMode = function()
	{
		//	If prev mode was '3d render', then hide all (dev hack to enable cycling between 2d and 3d render)
		if (_renderModeNormal == 2) {
			//genePool3D.setAllNormalSwimmerVisibility( false );
			globalGenepool3Dcpp.setAllNormalSwimmerVisibility( false );
		}

		_renderModeNormal++;
		if ( _renderModeNormal > 2 ) {
			_renderModeNormal = 0;
		}

		let state = 'foo';
		switch (_renderModeNormal) {
			case 0 : state = 'OFF'; this.renderPartNormalFunc = this.renderPartNormalOFF; break;
			case 1 : state = '2D' ; this.renderPartNormalFunc = this.renderPartNormal2d; break;
			case 2 : state = '3D' ; this.renderPartNormalFunc = this.renderPartNormal3d; break;
		}

		genePool3D.displayPopupMsg( 'Normal Swimmer part render : ', state, 500 );
	}

	this.cycleSplinedRenderMode = function()
	{
		//	If prev mode was '3d render', then hide all (dev hack to enable cycling between 2d and 3d render)
		if (_renderModeSplined == 2) {
			//genePool3D.setAllSplinedSwimmerVisibility( false );
			globalGenepool3Dcpp.setAllSplinedSwimmerVisibility( false );
		}

		_renderModeSplined++;
		if ( _renderModeSplined > 2 ) {
			_renderModeSplined = 0;
		}

		let state = 'foo';
		switch (_renderModeSplined) {
			case 0 : state = 'OFF'; this.renderPartSplinedFunc = this.renderPartSplinedOFF; break;
			case 1 : state = '2D' ; this.renderPartSplinedFunc = this.renderPartSplined2d;  break;
			case 2 : state = '3D' ; this.renderPartSplinedFunc = this.renderPartSplined3d;  break;
		}

		genePool3D.displayPopupMsg( 'Splined Swimmer part render : ', state, 500 );
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

		//	function pointers for 2D/3D render cycling (debug)
		//	renderMode - 0: dont't render, 1: render 2d (canvas), 2: render 3d (AlfEngine)
		_renderModeNormal = 1;
		_renderModeSplined = 1;
		this.renderPartNormalFunc    = this.renderPartNormal2d;
		this.renderPartSplinedFunc   = this.renderPartSplined2d;
		this.renderSwimmerDebugFunc  = this.renderSwimmerDebug2d;
		this.renderGenitalFunc       = this.renderGenital2d;
		this.renderMouthFunc         = this.renderMouth2d;
	}

	//------------------------------------------------
	//	dispose of render assets for a given swimmer
	//------------------------------------------------
	this.releaseRenderAssets = function( swimmer ) {
		//genePool3D.deleteSwimmer( swimmer );
		if ( "meshId" in swimmer )
		{
			globalGenepool3Dcpp.deleteSwimmer( swimmer.meshId );	// kill the 3D assets
			delete swimmer.meshId;									// remove the ID key from the js object
		}
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
			this.render2d_lod_dot( swimbot, SWIMBOT_DOT_RENDER_RADIUS );
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
	this.render2d_lod_dot = function( swimbot, radius )
	{
		if (_renderModeNormal == 1 || _renderModeNormal == 2)	// use for both 2 & 3d for now
		{
			let partNum = 1;
			let position = swimbot._phenotype.parts[ partNum ].position;
			_colorUtility = swimbot.calculatePartColor( partNum );

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

				_colorUtility = swimbot.calculatePartColor(p);
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

	//
	this.render_lod_high = function( swimbot )
	{ 
		for (let p=1; p<_phenotype.numParts; p++)
		{
			_parentPosition = swimbot.getPartParentPosition( p );
			_colorUtility   = swimbot.calculatePartColor( p );
			if ( _phenotype.parts[p].length > ZERO )
			{
				//--------------------------------------------
				// render the part
				//--------------------------------------------
				_splineFactor = DEFAULT_SPLINE_FACTOR; 	
				if ( _phenotype.parts[p].splined )
				{
					this.renderPartSplinedFunc(p);
				}
				else
				{
					this.renderPartNormalFunc(p);
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
							_colorUtility = swimbot.calculatePartColor(1);  
							this.renderMouthFunc();
						}
					}
				}

				//	misc debug
				this.renderSwimmerDebugFunc();
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
				this.renderGenitalFunc();
			}
		}
	}


	//=======================================================================================================
	//
	//	3D rendering
	//
	//=======================================================================================================
	this.renderPartNormal3d = function( partNum )
	{
		let part = _phenotype.parts[ partNum ];
		let width		= part.width;
		let position 	= part.position;
		let length		= part.length;
		let angle		= part.currentAngle;
		let depth		= width;
		let scale		= _growthScale;

		//	create the mesh if it doesn't already exist
		if ( !("meshId" in part) ) {
			part.meshId = globalGenepool3Dcpp.createNormalSwimmer( width, depth, length, part.baseColor.red, part.baseColor.green, part.baseColor.blue, scale );
		}

		//	render existing mesh
		globalGenepool3Dcpp.renderNormalSwimmer( part.meshId, position.x, position.y, partNum, angle, scale, part.blendColor.red, part.blendColor.green, part.blendColor.blue, part.blendPct );
	}

	this.renderSwimmerDebug3d = function()
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
	this.renderGenital3d = function()
	{	
	/*
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
	*/
	}


	//--------------------------------
	// render mouth
	//--------------------------------
	this.renderMouth3d = function()
	{
	/*
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
	*/
    }






	this.renderPartSplined3d = function( partNum )
	{
		let splineData = this.renderPartSplined( partNum );
		this._renderSplined2D( partNum, splineData );
	}


	this.renderPartSplined = function( partNum )
	{
	    let parentIndex     = _phenotype.parts[partNum].parent;
        let position 		= _phenotype.parts[partNum].position;
        let width           = _phenotype.parts[partNum].width;
        let parentWidth     = _phenotype.parts[ parentIndex ].width;

        //---------------------------
        // baby growing...
        //---------------------------
        if ( _growthScale < ONE )        
        {
            width       = width         * _growthScale + EGG_SIZE * ( ONE - _growthScale );
            parentWidth = parentWidth   * _growthScale + EGG_SIZE * ( ONE - _growthScale );
        }

        let perpStartX  = _phenotype.parts[partNum].perpendicular.x;
        let perpStartY  = _phenotype.parts[partNum].perpendicular.y;
        let perpEndX    = _phenotype.parts[partNum].perpendicular.x;
        let perpEndY    = _phenotype.parts[partNum].perpendicular.y;

        let controlVectorLength = _phenotype.parts[partNum].length * _splineFactor;

        //-------------------------------------------------------------------------------
        // blend the two perpendiculars to represent the perpendicular of the joint
        //-------------------------------------------------------------------------------
        if (( partNum > 1 ) && ( ! _phenotype.parts[partNum].branch ))
        {
            perpStartX += _phenotype.parts[ parentIndex ].perpendicular.x;
            perpStartY += _phenotype.parts[ parentIndex ].perpendicular.y;
    
            let length = Math.sqrt( perpStartX * perpStartX + perpStartY * perpStartY );
            perpStartX /= length;
            perpStartY /= length;
        }

        
        if ( _phenotype.parts[partNum].child != NULL_INDEX )
        {
            perpEndX += _phenotype.parts[ _phenotype.parts[partNum].child ].perpendicular.x;
            perpEndY += _phenotype.parts[ _phenotype.parts[partNum].child ].perpendicular.y;

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

        if ( partNum === 1 ) 
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
		var splineData = {
			startLeftX      : _parentPosition.x  - perpStartX,
			startLeftY      : _parentPosition.y  - perpStartY,
			startRightX     : _parentPosition.x  + perpStartX,
			startRightY     : _parentPosition.y  + perpStartY,
			control1LeftX   : _parentPosition.x  - perpStartX    + control1VectorX,
			control1LeftY   : _parentPosition.y  - perpStartY    + control1VectorY,
			control1RightX  : _parentPosition.x  + perpStartX    + control1VectorX,
			control1RightY  : _parentPosition.y  + perpStartY    + control1VectorY,
			endLeftX        :  position.x        - perpEndX,
			endLeftY        :  position.y        - perpEndY,
			endRightX       :  position.x        + perpEndX,
			endRightY       :  position.y        + perpEndY,
			control2LeftX   :  position.x        - perpEndX      + control2VectorX,
			control2LeftY   :  position.y        - perpEndY      + control2VectorY,
			control2RightX  :  position.x        + perpEndX      + control2VectorX,
			control2RightY  :  position.y        + perpEndY      + control2VectorY
		}

		return splineData;
	};


	this._renderSplined2D = function( partNum, splineData )
	{
		let curPart			= _phenotype.parts[partNum];
		let parentIndex		= _phenotype.parts[partNum].parent;
        let position 		= _phenotype.parts[partNum].position;
        let width           = _phenotype.parts[partNum].width;
		let parentPart		= _phenotype.parts[parentIndex];
        let parentWidth     = _phenotype.parts[parentIndex].width;

        //---------------------------------------
        // get color
        //---------------------------------------
		_canvas.fillStyle = _colorUtility.rgba();	
        _canvas.strokeStyle = OUTLINE_COLOR;

        //---------------------------------------
        // the beginning of a series of parts
        //---------------------------------------
        if ( partNum === 1 )
        {
            _canvas.beginPath();
            _canvas.arc( parentPart.position.x, parentPart.position.y, width, 0, PI2, false );
            _canvas.fill();
            _canvas.closePath();	
            
            let radian = parentPart.currentAngle * PI_OVER_180;
            
            _canvas.beginPath();
            _canvas.arc
            ( 
                parentPart.position.x, 
                parentPart.position.y, 
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
        if ( curPart.child === NULL_INDEX )
        {        
            let s =  width * curPart.endCapSpline;
            let f = -1.0; // basically, a pixel's width...I think
            
            let axisNormalX = curPart.axis.x / curPart.length;
            let axisNormalY = curPart.axis.y / curPart.length;

            let startx  = splineData.endLeftX  + axisNormalX * f;
            let starty  = splineData.endLeftY  + axisNormalY * f;
            let endx    = splineData.endRightX + axisNormalX * f;
            let endy    = splineData.endRightY + axisNormalY * f;
            let c1x     = splineData.endLeftX  + axisNormalX * s;
            let c1y     = splineData.endLeftY  + axisNormalY * s;
            let c2x     = splineData.endRightX + axisNormalX * s;
            let c2y     = splineData.endRightY + axisNormalY * s;

            _canvas.beginPath();
            _canvas.moveTo( startx, starty );
            _canvas.bezierCurveTo( c1x, c1y, c2x, c2y, endx, endy );
            _canvas.closePath();	    
            _canvas.fill();

            _canvas.moveTo( startx, starty );
            _canvas.bezierCurveTo( c1x, c1y, c2x, c2y, endx, endy );
            _canvas.stroke();

        }
        
        //---------------------------------------
        // fill interior
        //---------------------------------------
        _canvas.beginPath();
        _canvas.moveTo( splineData.startLeftX, splineData.startLeftY );
        _canvas.bezierCurveTo( splineData.control1LeftX, splineData.control1LeftY, splineData.control2LeftX, splineData.control2LeftY, splineData.endLeftX, splineData.endLeftY );
        _canvas.lineTo( splineData.endRightX, splineData.endRightY );
        _canvas.bezierCurveTo( splineData.control2RightX, splineData.control2RightY, splineData.control1RightX, splineData.control1RightY, splineData.startRightX, splineData.startRightY );
        _canvas.lineTo( splineData.startLeftX, splineData.startLeftY );
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
        _canvas.moveTo( splineData.startLeftX, splineData.startLeftY );
        _canvas.bezierCurveTo( splineData.control1LeftX, splineData.control1LeftY, splineData.control2LeftX, splineData.control2LeftY, splineData.endLeftX, splineData.endLeftY );
        _canvas.moveTo( splineData.endRightX, splineData.endRightY );
        _canvas.bezierCurveTo( splineData.control2RightX, splineData.control2RightY, splineData.control1RightX, splineData.control1RightY, splineData.startRightX, splineData.startRightY );
        _canvas.stroke();								
        _canvas.closePath();	
	}









	//===============================================================================================================================================
	//
	//	2D rendering (copied from Canvas renderer 4/2/22) is order to support 2D/3D render toggle 
	//	for side by side comparison
	//
	//===============================================================================================================================================

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
        //let control1X       = _parentPosition.x                  + control1VectorX;
        //let control1Y       = _parentPosition.y                  + control1VectorY;
        let control1LeftX   = _parentPosition.x  - perpStartX    + control1VectorX;
        let control1LeftY   = _parentPosition.y  - perpStartY    + control1VectorY;
        let control1RightX  = _parentPosition.x  + perpStartX    + control1VectorX;
        let control1RightY  = _parentPosition.y  + perpStartY    + control1VectorY;

        let endLeftX        = position.x        - perpEndX;
        let endLeftY        = position.y        - perpEndY;
        let endRightX       = position.x        + perpEndX;
        let endRightY       = position.y        + perpEndY;
        //let control2X       = position.x                        + control2VectorX;
        //let control2Y       = position.y                        + control2VectorY;
        let control2LeftX   = position.x        - perpEndX      + control2VectorX;
        let control2LeftY   = position.y        - perpEndY      + control2VectorY;
        let control2RightX  = position.x        + perpEndX      + control2VectorX;
        let control2RightY  = position.y        + perpEndY      + control2VectorY;

        //---------------------------------------
        // get color
        //---------------------------------------
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
