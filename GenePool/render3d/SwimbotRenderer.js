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

const DEBUG_AREA_X = 1000;
const DEBUG_AREA_Y = 1000;
const FORCE_ALL_3D = true;
const DEFAULT_WIREFRAME_MODE = false;

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

	//	The following objects are all created from classes that are exposed to .js from the engine
	//	via Embind. Allocation is deferred until the first BeginFrame because the methods that we
	//	need are not installed on the Module until *after* the .initialize() function call.  :-(
	let _baseColorEng  = null;
	let _perpStart = null, _perpEnd = null;

	let _rendLen = 0;
	let _rendBegRadius = 0;
	let _rendEndRadius = 0;

	//--------------------------------
	// local variables
	//--------------------------------
	let _simulationRunning	= false;
	let _colorUtility   = new Color( ZERO, ZERO, ZERO, ONE );
	let _splineFactor   = ZERO;
	let _renderingGenitalsAndMouths = false;
	let _debugTrail     = new Array( TRAIL_LENGTH );

	let _dbgAxisId_1	= ZERO;
	let _dbgAxisId_2	= ZERO;
	let _dbgAxisId_3	= ZERO;
	let _dbgAxisId_4	= ZERO;
	let _dbgAxisId_5	= ZERO;
	let _dbgAxisId_6	= ZERO;
	let _dbgAxisId_7	= ZERO;
	let _dbgAxisId_8	= ZERO;
	let _dbgAxisId_9	= ZERO;
	let _dbgAxisId_10	= ZERO;
	let _dbgAxisId_11	= ZERO;
	let _dbgAxisId_12	= ZERO;
	let _dbgRayId_1		= ZERO;
	let _dbgRayId_2		= ZERO;
	let _dbgRayId_3		= ZERO;
	let _dbgRayId_4		= ZERO;
	let _dbgRayId_5		= ZERO;
	let _dbgAxisId_Part	= ZERO;

	let _dumpSelectedPartData = false;
	let _debugRenderMode	= 0;
	let _wireframeMode		= DEFAULT_WIREFRAME_MODE;
	let _savedCamPos		= new Vector2D();
	let _savedCamScale		= 0;
	let _debugRenderCnt		= 0;
	let _normalRenderCnt	= 0;
	let _splinedRenderCnt	= 0;

	let _debugRenderActive	= false;
	let	_animPartAngleMin	= 0;
	let	_animPartAngleMax	= 0;
	let _animPartAngleRot	= 0;
	let _animPartAngleInc	= 0;
	let	_animPartAngle		= 0;
	let _animParentAngleMin	= 0;
	let _animParentAngleMax	= 0;
	let _animParentAngleRot	= 0;
	let _animParentAngleInc	= 0;
	let _animParentAngle	= 0;

	let _renderNormalMode	= 0;
	let _renderSplinedMode	= 0;
	let _swimmerIsSelected	= false;
	let _selectedPartIndex	= NULL_PART;
	let _swimmerPartIsSelected	= false;
	let _curSwimbotIndex	= NULL_INDEX;

	let _savedPartParameters = new Render3dData();

	//-------------------------------------------
	// set rendering goals
	//-------------------------------------------
	this.setRenderingGoals = function( r )
	{
		_renderingGenitalsAndMouths = r;
	}

	this.setSimulationRunning = function(s)
	{	
        _simulationRunning = s;
		console.log("++++++++++++++++++++++++++++++++++ SwimbotRenderer: simulationRunniong = " + _simulationRunning );
    }

	//-----------------------------------------
	//	renderMode - 0: dont't render
	//               1: render 2d (canvas)
	//               2: render 3d (AlfEngine)
	//-----------------------------------------
	//	function pointers for 2D/3D render cycling (debug)
	this.renderSwimmerDebugOFF = function(p) {}
	this.renderGenitalOFF      = function(p) {}
	this.renderMouthOFF        = function(p) {}
	this.renderSwimmerDebugFunc;
	this.renderGenitalFunc;
	this.renderMouthFunc;

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
		_renderNormalMode = 1;
		_renderSplinedMode = 1;
		this.renderSwimmerDebugFunc  = this.renderSwimmerDebug2d;
		this.renderGenitalFunc       = this.renderGenital2d;
		this.renderMouthFunc         = this.renderMouth2d;
	}

	//------------------------------------------------
	//	dispose of render assets for a given swimmer
	//------------------------------------------------
	this.releaseRenderAssets = function( swimmer )
	{
		_phenotype = swimmer.getPhenotype();
		for (let partNum=1; partNum < _phenotype.numParts; partNum++)
		{
			let renderData = _phenotype.parts[partNum].render3dData;

			//	It's possible for a swimbot to live it's entire life offscreen
			//	and die without ever getting rendered.
			if ( renderData == NULL_INDEX ) {
				//console.log("  ** no render data! **");
				continue;
			}

			let meshId = renderData.partId;
			if ( meshId != NULL_INDEX ) {
				if ( renderData.splined) {
					globalGenepool3Dcpp.deleteSplinedSwimbotPart( meshId, renderData.hasEndcap );
				}
				else {
					globalGenepool3Dcpp.deleteNormalSwimbotPart( meshId );
				}
			}

			_phenotype.parts[partNum].render3dData = NULL_INDEX;
		}
	}

	//-----------------------
	//	for 3d debug purposes
	//-----------------------
	this.beginFrame = function ()
	{
		_normalRenderCnt	= 0;
		_splinedRenderCnt	= 0;

		//	Module had not been completely intialized at the time of the .initialize() call.
		//	Assume that it is now ready and go ahead and allocate shared engine objects
		if ( _baseColorEng == null ) {
			_baseColorEng   = new Module.Color();
			_perpStart		= new Module.Vec2();
			_perpEnd		= new Module.Vec2();
			//globalGenepool3Dcpp.setWireframeMode( DEFAULT_WIREFRAME_MODE );

//globalGenepool3Dcpp.setWireframeMode(true);	// update morph matrices debug - TEMP
//if ( _debugRenderMode == 0 ) this.toggleDebugSwimbotRender();	//	<=== start out in debug mode
		}
	}

	//-----------------------------------------------------------------------------
	//	Useful hook for debugging the 3d code. The following places don't work for
	//	hooking in debug swimbot render for the following reasons...
	//
	//		this.beginFrame	- happens BEFORE the pool gets wiped
	//		this.endFrame	- happens AFTER globalRenderer.resetCoordSystem()
	//		this.render		- may not get called by GenePool::render if there
	//						  are no other (non-debug) swimbots being rendered.
	//
	//-----------------------------------------------------------------------------
	this.beginSwimbotRenderPhase = function() {
		if ( _debugRenderMode > 0 ) {
			this.renderDebugSwimbot();
		}
	}

	//
	//	Called at the very end of the GenePool.js/render loop.
	//	Note: The canvas 'resetTransform' has already been called at this point!
	//
	this.endFrame = function ()
	{
	}

	//-----------------------
	// render
	//-----------------------
	this.render = function( swimbot, levelOfDetail )
	{
    	_phenotype      = swimbot.getPhenotype();
    	_brain          = swimbot.getBrain();
    	//_age            = swimbot.getAge();
    	_energy         = swimbot.getEnergy();
    	_growthScale    = swimbot.getGrowthScale();
    	_focusDirection = swimbot.getFocusDirection();

		_swimmerIsSelected = swimbot.getIsSelected();
		_selectedPartIndex = swimbot.getSelectedPart();
		_curSwimbotIndex   = swimbot.getIndex();
		_swimmerPartIsSelected = false;

		//if ( levelOfDetail == SWIMBOT_LEVEL_OF_DETAIL_DOT )
		//{
		//	this.render_lod_dot( swimbot, SWIMBOT_DOT_RENDER_RADIUS );
		//}
		//else if ( levelOfDetail == SWIMBOT_LEVEL_OF_DETAIL_LOW )
		//{
		//	this.render_lod_low( swimbot );
		//}
		//else if ( levelOfDetail == SWIMBOT_LEVEL_OF_DETAIL_HIGH )
		//{ 
		//	this.render_lod_high( swimbot );
		//}	

		//	3d meshes don't have and may not really need a LOD
		this.render_lod_high( swimbot );
	}


	//-----------------------------------------------------------------------------------------------
	//
	//-----------------------------------------------------------------------------------------------
	this.render_lod_dot = function( swimbot, radius )
	{
		if ( _renderNormalMode != 0 )	// use for both 2 & 3d for now
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
	this.render_lod_low = function( swimbot )
	{
		if ( _renderNormalMode != 0 )	// use for both 2 & 3d for now
		{
			for (let p=1; p<_phenotype.numParts; p++)
			{
				let parentPosition = swimbot.getPartParentPosition(p);

				_colorUtility = swimbot.calculatePartColor(p);
				_canvas.strokeStyle = _colorUtility.rgba();	
				_canvas.lineWidth = _phenotype.parts[p].width * 2.0; 

				_canvas.beginPath();
				_canvas.moveTo( parentPosition.x, parentPosition.y );
				_canvas.lineTo( _phenotype.parts[p].position.x, _phenotype.parts[p].position.y );
				_canvas.closePath();
				_canvas.stroke();
			}
		}
	}

	//
	this.render_lod_high = function( swimbot )
	{
		//	Render a standard swimbot
		for (let partNum=1; partNum<_phenotype.numParts; partNum++)
		{
			_swimmerPartIsSelected = (partNum == _selectedPartIndex);
			if ( _phenotype.parts[partNum].length > ZERO )
			{
				//	fetch/create our extended phenotype data
				let renderData = _phenotype.parts[partNum].render3dData;
				if (renderData == NULL_INDEX) {
					renderData = new Render3dData();
					_phenotype.parts[partNum].render3dData = renderData;
					//console.log('created new Render3dData - index=', swimbot.getIndex(), ', partNum = ' + partNum );
					renderData.initialize( partNum, _phenotype.parts );
				}

				_parentPosition = swimbot.getPartParentPosition( partNum );
				_colorUtility   = swimbot.calculatePartColor( partNum );
				//if ( _swimmerIsSelected && _swimmerPartIsSelected ) {
				//	_colorUtility.set( 1.0, 0.5, 0.0, 1.0 );	// color the selected part
				//}


				//--------------------------------------------
				// render the part
				//--------------------------------------------
				_splineFactor = DEFAULT_SPLINE_FACTOR; 	
				if ( _phenotype.parts[ partNum ].splined )
				{
					renderData.updateSplined( partNum, _phenotype.parts );
					//this.splinedRenderSwitcher( renderData );
					this.splinedRenderMesh( renderData, renderData.parentPos.x, renderData.parentPos.y );
				}
				else
				{
					renderData.updateNormal( partNum, _phenotype.parts );
					//this.normalRenderSwitcher( renderData );
					this.renderNormalMesh( renderData, renderData.parentPos.x, renderData.parentPos.y );
				}

				//	dump parms for debug
				if ( _swimmerIsSelected && _swimmerPartIsSelected )
				{
					if ( _dumpSelectedPartData ) {
						console.log('+++++ part render data : swimbot = ' + _curSwimbotIndex + ', part = ' + _selectedPartIndex );
						renderData.dump();
						_dumpSelectedPartData = false;
					}
				}

				//--------------------------------------------
				// if p is mouth part, render mouth!
				//--------------------------------------------
				if ( partNum === 1 )
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

	this.splinedRenderSwitcher = function( partParms )
	{
		let isSel  = _swimmerIsSelected; //&& _swimmerPartIsSelected;
		let isMesh = FORCE_ALL_3D || ((_renderSplinedMode == 2) && isSel);

		if ( isMesh )
		{
			this.splinedRenderMesh( partParms, partParms.parentPos.x, partParms.parentPos.y );
			//	use a local 'isVis' flag on partParms to minimize calls to cpp code
			if ( partParms.partId != NULL_INDEX ) {
				if ( partParms.isMeshVisible == false ) {
					globalGenepool3Dcpp.setSplinedSwimbotPartVisible( partParms.partId, partParms.hasEndcap, true );
					partParms.isMeshVisible = true;
				}
			}
		}
		else
		{
			//	use a local 'isVis' flag on partParms to minimize calls to cpp code
			if ( partParms.partId != NULL_INDEX ) {
				if ( partParms.isMeshVisible == true ) {
					globalGenepool3Dcpp.setSplinedSwimbotPartVisible( partParms.partId, partParms.hasEndcap, false );
					partParms.isMeshVisible = false;
				}
			}
			if ( _renderSplinedMode != 0 ) {
				this.splinedRender2D( partParms );
			}
		}
	}

	this.normalRenderSwitcher = function( partParms )
	{
		let isSel  = _swimmerIsSelected; //&& _swimmerPartIsSelected;
		let isMesh = FORCE_ALL_3D || ((_renderNormalMode == 2) && isSel);
		if ( isMesh )
		{
			this.renderPartNormal3d( partParms, partParms.parentPos.x, partParms.parentPos.y );
			if ( partParms.partId != NULL_INDEX ) {
				if ( partParms.isMeshVisible == false ) {
					globalGenepool3Dcpp.setNormalSwimbotPartVisible( partParms.partId, true );
					partParms.isMeshVisible = true;
				}
			}
		}
		else
		{
			if ( partParms.partId != NULL_INDEX ) {
				if ( partParms.isMeshVisible == true ) {
					globalGenepool3Dcpp.setNormalSwimbotPartVisible( partParms.partId, false );
					partParms.isMeshVisible = false;
				}
			}
			if ( _renderNormalMode != 0 ) {
				this.renderPartNormal2d( partParms );
			}
		}
	}


	//=======================================================================================================
	//
	//	3D rendering
	//
	//=======================================================================================================
	this.renderPartNormal3d = function( partParms )
	{
		let parentPos = partParms.parentPos;
		this.renderNormalMesh( partParms, parentPos.x, parentPos.y )
	}

	this.renderNormalMesh = function( partParms, xpos, ypos )
	{
		//	create the mesh if it doesn't already exist
		if ( partParms.partId == NULL_INDEX ) {
			_baseColorEng.setRGBA( partParms.baseColor.red, partParms.baseColor.green, partParms.baseColor.blue, 1.0 );
			partParms.partId = globalGenepool3Dcpp.createNormalSwimbotPart( partParms.partIndex, partParms.width, partParms.length, _baseColorEng );

			//console.log("==== <renderNormalMesh> CREATE :  id = " + partParms.partId + ", width=" + partParms.width.toFixed(3) +
				//", partNum = " + partParms.partNum + ", id = " + partParms.partIndex );
				//", baseColor = ( " + partParms.baseColor.red.toFixed(3) + ", " + partParms.baseColor.green.toFixed(3) + ", " +	partParms.baseColor.blue.toFixed(3) + " )" );
		}

		//	render existing mesh
		globalGenepool3Dcpp.renderNormalSwimbotPart( partParms.partId, xpos, ypos, partParms.angle, _growthScale,
			partParms.blendColor.red, partParms.blendColor.green, partParms.blendColor.blue, partParms.blendPct );
		_normalRenderCnt++;
	}

	this.splinedRenderMesh = function( partParms, xpos, ypos )
	{
		let perpStartX  = partParms.perp.x;
		let perpStartY  = partParms.perp.y;
		if (( partParms.partIndex > 1 ) && ( ! partParms.branch ))
		{
			perpStartX += partParms.parentPerp.x;
			perpStartY += partParms.parentPerp.y;
		}

		partParms.blendAngle = (Math.atan2( -perpStartY, perpStartX ) / PI_OVER_180) - 90.0;
		if (partParms.blendAngle <= -180) partParms.blendAngle += 360.0;

		// scale the two perpendiculars
		let width		= partParms.width;
		let parentWidth	= partParms.parentWidth;
		if ( _growthScale < ONE ) {
			width       = width       * _growthScale + EGG_SIZE * ( ONE - _growthScale );
			parentWidth = parentWidth * _growthScale + EGG_SIZE * ( ONE - _growthScale );
		}

		_rendLen = partParms.length * _growthScale;
		_rendEndRadius = width;
		_rendBegRadius = width;
		if ( partParms.partIndex != 1 ) {
			_rendBegRadius = parentWidth;
		}

		//	create the mesh if it doesn't already exist
		if ( partParms.partId == NULL_INDEX ) {
			let hasEndcap = (partParms.childIndex == -1);
			_baseColorEng.setRGBA( partParms.baseColor.red, partParms.baseColor.green, partParms.baseColor.blue, 1.0 );
			partParms.hasEndcap = hasEndcap;
			partParms.partId = globalGenepool3Dcpp.createSplinedSwimbotPart( partParms.partIndex, partParms.parentWidth,
				partParms.width, partParms.length, _splineFactor, partParms.endCapSpline, hasEndcap, _baseColorEng );

			//console.log("==== <splinedRenderMesh> CREATE :  id = " + partParms.partId + ", width=" + partParms.width.toFixed(3) +
				//", partNum = " + partParms.partNum + ", id = " + partParms.partIndex );
				//", baseColor = ( " + partParms.baseColor.red.toFixed(3) + ", " + partParms.baseColor.green.toFixed(3) + ", " + partParms.baseColor.blue.toFixed(3) + " )" );
		}

		//	render existing mesh
		let blendAngle = partParms.blendAngle - 90.0;
		globalGenepool3Dcpp.renderSplinedSwimbotPart( partParms.partId, partParms.hasEndcap, xpos, ypos, partParms.angle, blendAngle, _rendLen,
			_rendBegRadius, _rendEndRadius, partParms.blendColor.red, partParms.blendColor.green, partParms.blendColor.blue, partParms.blendPct );
		_splinedRenderCnt++;
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



	//======================================================================================================================================================
	//======================================================================================================================================================
	//
	//
	//	2D rendering (copied from Canvas renderer 4/2/22) is order to support 2D/3D render toggle 
	//	for side by side comparison
	//
	//
	//======================================================================================================================================================
	//======================================================================================================================================================

	this.renderSwimmerDebug3d = function()
	{
	}
	this.renderGenital3d = function()
	{	
	}
	this.renderMouth3d = function()
	{
	}

	this.generateSplineData = function( partParms )
	{
		let partNum			= partParms.partIndex;
		let parentIndex		= partParms.parentIndex;	// _phenotype.parts[partNum].parent;
		let position 		= partParms.position;		// _phenotype.parts[partNum].position;
		let parentPos 		= partParms.parentPos;		// _phenotype.parts[parentIndex].position;
		let width			= partParms.width;			// _phenotype.parts[partNum].width;
		let length			= partParms.length;			// _phenotype.parts[partNum].length;
		let parentWidth		= partParms.parentWidth;	// _phenotype.parts[parentIndex].width;
		let perp			= partParms.perp;			// _phenotype.parts[partNum].perpendicular
		let childIndex		= partParms.childIndex;		// _phenotype.parts[partNum].child;
		let parentPerp		= partParms.parentPerp;		// _phenotype.parts[parentIndex].perpendicular;
		let childPerp		= partParms.childPerp;		// _phenotype.parts[childIndex].perpendicular
		let branch			= partParms.branch;			//  _phenotype.parts[partNum].branch

        //---------------------------
        // baby growing...
        //---------------------------
        if ( _growthScale < ONE )        
        {
            width       = width         * _growthScale + EGG_SIZE * ( ONE - _growthScale );
            parentWidth = parentWidth   * _growthScale + EGG_SIZE * ( ONE - _growthScale );
        }

        //-------------------------------------------------------------------------------
        // blend the two perpendiculars to represent the perpendicular of the joint
        //-------------------------------------------------------------------------------
        let perpStartX  = perp.x;
        let perpStartY  = perp.y;
        let perpEndX    = perp.x;
        let perpEndY    = perp.y;

        if (( partNum > 1 ) && ( ! branch ))
        {
            perpStartX += parentPerp.x;
            perpStartY += parentPerp.y;
    
            let length = Math.sqrt( perpStartX * perpStartX + perpStartY * perpStartY );
            perpStartX /= length;
            perpStartY /= length;
        }

        if (childIndex != NULL_INDEX )
        {
            perpEndX += childPerp.x;
            perpEndY += childPerp.y;

            let length = Math.sqrt( perpEndX * perpEndX + perpEndY * perpEndY );
            perpEndX /= length;
            perpEndY /= length;
        }

		//if ( partParms.partId != NULL_INDEX ) {
		//	console.log('perpStartX=(' + perpStartX.toFixed(3) + ',' + perpStartY.toFixed(3) +
		//		') : perpEndX=(' + perpEndX.toFixed(3) + ',' + perpEndY.toFixed(3) + ')' );
		//}

		//	need this angle for 3d renderer
		partParms.blendAngle = (Math.atan2( -perpStartY, perpStartX ) / PI_OVER_180) - 90.0;
		if (partParms.blendAngle <= -180) partParms.blendAngle += 360.0;


		if ( false ) { //partParms.partId != NULL_INDEX ) {
			let pang  = Math.atan2( -perp.y, perp.x ) / PI_OVER_180;
			let ppang = Math.atan2( -parentPerp.y, parentPerp.x ) / PI_OVER_180;
			let cpang = 0;
			if (childPerp.x != 0 || childPerp.y != 0) { cpang = Math.atan2( -childPerp.y, childPerp.x ) / PI_OVER_180; }
			let stang = Math.atan2( -perpStartY, perpStartX ) / PI_OVER_180;
			let enang = Math.atan2( -perpEndY, perpEndX ) / PI_OVER_180;
			console.log(
			"xperp  =(" + perp.x.toFixed(3)       + "," + perp.y.toFixed(3)       + ") [" + pang.toFixed(1)  + "],  " +
			"paPerp =(" + parentPerp.x.toFixed(3) + "," + parentPerp.y.toFixed(3) + ") [" + ppang.toFixed(1) + "],  " +
			"chPerp =(" + childPerp.x.toFixed(3)  + "," + childPerp.y.toFixed(3)  + ") [" + cpang.toFixed(1) + "], : " +
			"begPerp=(" + perpStartX.toFixed(3)   + "," + perpStartY.toFixed(3)   + ") [" + stang.toFixed(1) + "],  " +
			"endPerp=(" + perpEndX.toFixed(3)     + "," + perpEndY.toFixed(3)     + ") [" + enang.toFixed(1) + "], : " +
			"blend  = " + partParms.blendAngle.toFixed(3) );
		}


		let perpStartNormX = perpStartX;
		let perpStartNormY = perpStartY;
		let perpEndNormX   = perpEndX;
		let perpEndNormY   = perpEndY;

        //--------------------------------------
        // determine the two control vectors
        //--------------------------------------
        let controlVectorLength = length * _splineFactor;

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
			startLeftX      : parentPos.x  - perpStartX,
			startLeftY      : parentPos.y  - perpStartY,
			control1LeftX   : parentPos.x  - perpStartX    + control1VectorX,
			control1LeftY   : parentPos.y  - perpStartY    + control1VectorY,
			control2LeftX   : position.x   - perpEndX      + control2VectorX,
			control2LeftY   : position.y   - perpEndY      + control2VectorY,
			endLeftX        : position.x   - perpEndX,
			endLeftY        : position.y   - perpEndY,

			startRightX     : parentPos.x  + perpStartX,
			startRightY     : parentPos.y  + perpStartY,
			control1RightX  : parentPos.x  + perpStartX    + control1VectorX,
			control1RightY  : parentPos.y  + perpStartY    + control1VectorY,
			control2RightX  : position.x   + perpEndX      + control2VectorX,
			control2RightY  : position.y   + perpEndY      + control2VectorY,
			endRightX       : position.x   + perpEndX,
			endRightY       : position.y   + perpEndY,
		}

		//	save some data needed for 3d render
		_perpStart.set( perpStartNormX, perpStartNormY );
		_perpEnd.set( perpEndNormX, perpEndNormY );
		return splineData;
	};

	//-----------------------------------
	// render part normal (not splined)
	//	Original 2D rendering code from GenePool - 4/2/22
	//-----------------------------------
	this.renderPartNormal2d = function( partParms )
	{
		let partNum			= partParms.partIndex;
		//let parentIndex     = partParms.parentIndex;	// _phenotype.parts[partNum].parent;
		let position 		= partParms.position;		// _phenotype.parts[partNum].position;
		let parentPos 		= partParms.parentPos;		// _phenotype.parts[parentIndex].position;
		let color			= partParms.color;			// _colorUtility
		let angle			= partParms.angle;			// _phenotype.parts[partNum].currentAngle;
		let width			= partParms.width;			// _phenotype.parts[partNum].width;
		let length			= partParms.length;			// _phenotype.parts[partNum].length;
		//let endCapSpline	= partParms.endCapSpline;	// _phenotype.parts[partNum].endCapSpline;
		//let parentWidth	= partParms.parentWidth;	// _phenotype.parts[parentIndex].width;
		let perp			= partParms.perp;			// _phenotype.parts[partNum].perpendicular
		//let childIndex	= partParms.childIndex;		// _phenotype.parts[partNum].child;
		//let childPerp		= partParms.childPerp;		// _phenotype.parts[childIndex].perpendicular
		//let branch		= partParms.branch;			// _phenotype.parts[partNum].branch

		if ( _dumpSelectedPartData && _swimmerPartIsSelected ) {
			console.log('XXX Dumping render data for NORMAL-2D part : swimbot = ' + _curSwimbotIndex + ', part = ' + _selectedPartIndex );
			_dumpSelectedPartData = false;
		}

		//---------------------------
		// baby growing...
		//---------------------------
		//if ( _growthScale < ONE )        
		//{
		//	width = width * _growthScale + EGG_SIZE * ( ONE - _growthScale );
		//}
		//let pp0x = _phenotype.parts[p].perpendicular.x * width;
		//let pp0y = _phenotype.parts[p].perpendicular.y * width;
		//let pp1x = _phenotype.parts[p].perpendicular.x * width;
		//let pp1y = _phenotype.parts[p].perpendicular.y * width;
		//let x0   = _parentPosition.x - pp1x;
		//let y0   = _parentPosition.y - pp1y;
		//let x1   = _parentPosition.x + pp1x;
		//let y1   = _parentPosition.y + pp1y;
		//let x2   = position.x + pp0x;
		//let y2   = position.y + pp0y;
		//let x3   = position.x - pp0x;
		//let y3   = position.y - pp0y;		


		if ( _growthScale < ONE )        
		{
			width = width * _growthScale + EGG_SIZE * ( ONE - _growthScale );
		}
		let pp0x = perp.x * width;
		let pp0y = perp.y * width;
		let pp1x = perp.x * width;
		let pp1y = perp.y * width;
		let x0   = parentPos.x - pp1x;
		let y0   = parentPos.y - pp1y;
		let x1   = parentPos.x + pp1x;
		let y1   = parentPos.y + pp1y;
		let x2   = position.x + pp0x;
		let y2   = position.y + pp0y;
		let x3   = position.x - pp0x;
		let y3   = position.y - pp0y;


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
        //_canvas.arc( _parentPosition.x, _parentPosition.y, radius, 0, PI2, false );								
        _canvas.arc( parentPos.x, parentPos.y, radius, 0, PI2, false );								
        _canvas.fill();
        _canvas.closePath();	

        //--------------------------------
        // outline
        //--------------------------------
        _canvas.lineWidth = 1.0; 
        _canvas.strokeStyle = OUTLINE_COLOR

        //let radian = _phenotype.parts[p].currentAngle * PI_OVER_180;
        let radian = angle * PI_OVER_180;

        _canvas.beginPath();
        //_canvas.arc( _parentPosition.x, _parentPosition.y, radius, Math.PI - radian, Math.PI - radian + Math.PI, false );
        _canvas.arc( parentPos.x, parentPos.y, radius, Math.PI - radian, Math.PI - radian + Math.PI, false );
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

	//
	//
	this.splinedRender2D = function( partParms )
	{
		let partNum			= partParms.partIndex;
		let parentIndex     = partParms.parentIndex;	// _phenotype.parts[partNum].parent;
		let position 		= partParms.position;		// _phenotype.parts[partNum].position;
		let parentPos 		= partParms.parentPos;		// _phenotype.parts[parentIndex].position;
		let color			= partParms.color;			// _colorUtility
		let angle			= partParms.angle;			// _phenotype.parts[partNum].currentAngle;
		let width			= partParms.width;			// _phenotype.parts[partNum].width;
		let length			= partParms.length;			// _phenotype.parts[partNum].length;
		let endCapSpline	= partParms.endCapSpline;	// _phenotype.parts[partNum].endCapSpline;
		let parentWidth		= partParms.parentWidth;	// _phenotype.parts[parentIndex].width;
		let perp			= partParms.perp;			// _phenotype.parts[partNum].perpendicular
		let childIndex		= partParms.childIndex;		// _phenotype.parts[partNum].child;
		let childPerp		= partParms.childPerp;		// _phenotype.parts[childIndex].perpendicular
		let branch			= partParms.branch;			// _phenotype.parts[partNum].branch
		let axis			= partParms.axis;			// _phenotype.parts[partNum].axis

		let splineData = this.generateSplineData( partParms );

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
            _canvas.arc( parentPos.x, parentPos.y, width, 0, PI2, false );
            _canvas.fill();
            _canvas.closePath();	
            
            let radian = angle * PI_OVER_180;
            
            _canvas.beginPath();
            _canvas.arc
            ( 
                parentPos.x, 
                parentPos.y, 
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
        if ( childIndex === NULL_INDEX )
        {        
            let s =  width * endCapSpline;
            let f = -1.0; // basically, a pixel's width...I think
            
            let axisNormalX = axis.x / length;
            let axisNormalY = axis.y / length;
            
//the perpendicular of the perpendicular!!!!            
//axisNormalX = -_phenotype.parts[p].perpendicular.y;
//axisNormalY =  _phenotype.parts[p].perpendicular.x;
            
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
        _canvas.moveTo( splineData.startLeftX, splineData.startLeftY );
        _canvas.bezierCurveTo( splineData.control1LeftX, splineData.control1LeftY, splineData.control2LeftX, splineData.control2LeftY, splineData.endLeftX, splineData.endLeftY );
        _canvas.lineTo( splineData.endRightX, splineData.endRightY );
        _canvas.bezierCurveTo( splineData.control2RightX, splineData.control2RightY, splineData.control1RightX, splineData.control1RightY, splineData.startRightX, splineData.startRightY );
        _canvas.lineTo( splineData.startLeftX, splineData.startLeftY );
        _canvas.closePath();	    
        _canvas.fill();	

        _canvas.beginPath();
        _canvas.arc( parentPos.x, parentPos.y, parentWidth * 0.9, 0, PI2, false );								
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
    


	this.bezier = function(t, p0, p1, p2, p3)
	{
		var cX = 3 * (p1.x - p0.x),
		bX = 3 * (p2.x - p1.x) - cX,
		aX = p3.x - p0.x - cX - bX;

		var cY = 3 * (p1.y - p0.y),
		bY = 3 * (p2.y - p1.y) - cY,
		aY = p3.y - p0.y - cY - bY;

		var x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x;
		var y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y;
		return {x: x, y: y};
	}

	this.drawBezier = function( p0, p1, p2, p3 )
	{
		var accuracy = 0.05;
		
		//var accuracy = 0.01; //this'll give the bezier 100 segments
		//p0 = {x: 10, y: 10},
		//p1 = {x: 50, y: 100},
		//p2 = {x: 150, y: 200},
		//p3 = {x: 200, y: 75},
		//ctx = document.createElement('canvas').getContext('2d');
		//ctx.width = 500;
		//ctx.height = 500;
		//document.body.appendChild(ctx.canvas);

		_canvas.beginPath();
		_canvas.moveTo(p0.x, p0.y);
		for ( var i=0; i<1; i+=accuracy )
		{
			var p = this.bezier( i, p0, p1, p2, p3 );
			_canvas.lineTo(p.x, p.y);
		}

		_canvas.stroke()
		_canvas.closePath();
	}

	this.cycleNormalRenderMode = function()
	{
		_renderNormalMode++;
		if ( _renderNormalMode > 2 ) {
			_renderNormalMode = 0;
		}

		let modeDesc = ['OFF', '2D', '3D' ];
		let desc = modeDesc[_renderNormalMode];
		genePool3D.displayPopupMsg( 'Normal Swimmer part render : ', desc, 600 );
		console.log('SwimmerPart renderMode: normal : ' + desc + ' (splined=' + _renderSplinedMode + ')' );
	}

	this.cycleSplinedRenderMode = function()
	{
		_renderSplinedMode++;
		if ( _renderSplinedMode > 2 ) {
			_renderSplinedMode = 0;
		}

		let modeDesc = ['OFF', '2D', '3D' ];
		let desc = modeDesc[_renderSplinedMode];
		genePool3D.displayPopupMsg( 'Splined Swimmer part render : ', desc, 600 );
		console.log('SwimmerPart renderMode: splined : ' + desc + ' (normal=' + _renderNormalMode + ')' );
	}


	this.dumpSelectedPartData = function()
	{
		_dumpSelectedPartData = true;
		console.log('[SwimbotRenderer::dumpSelectedPartData]');
	}

	//
	this.toggleDebugSwimbotRender = function()
	{
		_debugRenderMode++;
		if ( _debugRenderMode == 2 ) _debugRenderMode = 0;
		console.log('[SwimbotRenderer::renderDebugSwimbot] : ' + _debugRenderMode);
		if ( _debugRenderMode == 1 )
		{
			this.beginDebugRender();
		}
		if ( _debugRenderMode == 0 )
		{
			this.endDebugRender();
		}
	}

	//
	this.toggleWireframe = function()
	{
		_wireframeMode = !_wireframeMode;
		console.log('[SwimbotRenderer::toggleWireframe] : wireFrame = ' + _wireframeMode);
		globalGenepool3Dcpp.setWireframeMode( _wireframeMode );
		let desc = "OFF";
		if (_wireframeMode) desc = "ON";
		genePool3D.displayPopupMsg( 'Wireframe mode : ', desc, 600 );
	}

	this.beginDebugRender = function()
	{
		if ( _debugRenderActive != true ) {
			_savedCamPos.copyFrom( genePool.getCamera().getPosition() );
			_savedCamScale = genePool.getCamera().getScale();
			genePool3D.forceZoomOverride();
			let dbgArea = new Vector2D();
			dbgArea.setXY( DEBUG_AREA_X, DEBUG_AREA_Y );

			//genePool.getCamera().setScale( 80 );
			genePool.getCamera().setScale( 100 );

			genePool.getCamera().setPosition( dbgArea );
			genePool.getViewTracking().setMode( ViewTrackingMode.NULL, genePool.getCamera().getPosition(), genePool.getCamera().getScale(), 0 );   

			_animPartAngleMin	= 180 - 60;
			_animPartAngleMax	= 180 + 60;
			_animPartAngleRot	= 0;
			let secPerCycle		= 4; //4; //sec
			let degPerSec		= 360 / secPerCycle;
//degPerSec = 0;
			_animPartAngleInc	= degPerSec / 30; // deg

			_animParentAngleMin	= 90 - 50;
			_animParentAngleMax	= 90 + 50;
			_animParentAngleRot	= 0;
			secPerCycle			= 9; //9; //sec
			degPerSec			= 540 / secPerCycle;
//degPerSec = 0;
			_animParentAngleInc	= degPerSec / 30; // deg

			//_age = 0;	//GROWTEST

			_debugRenderActive = true;
			_debugRenderCnt = 0;
		}
	}

	this.endDebugRender = function()
	{
		if ( _debugRenderActive == true ) {
			//_savedPartParameters.dump();
			genePool.getCamera().setScale( _savedCamScale );
			genePool.getCamera().setPosition( _savedCamPos );
			this.hideAllDebugHelpers();
			_debugRenderActive = false;
		}
	}


	this.renderDebugSwimbot = function()
	{
		//_savedPartParameters.setTest_a();		// fungi
		//_savedPartParameters.setTest_b() ;	// nocap
		_savedPartParameters.setTest_c() ;	// eggplant
		//_savedPartParameters.setTest_D() ;		// normal


		if ( _simulationRunning ) _debugRenderCnt++;

		_growthScale = 1.0;
		//let MAX_GROW_CNT = 800;
		//if ( _debugRenderCnt <= MAX_GROW_CNT ) {
		//	_growthScale = _debugRenderCnt / MAX_GROW_CNT;
		//}

		if ( _savedPartParameters.partIndex != NULL_INDEX )
		{
			if ( _simulationRunning )
			{
				let range = (_animPartAngleMax - _animPartAngleMin) / 2;
				let refAngle = _animPartAngleMin + range;
				_animPartAngleRot += _animPartAngleInc * PI_OVER_180;
				_animPartAngle = refAngle + (range *  Math.sin(_animPartAngleRot));
				range = (_animParentAngleMax - _animParentAngleMin) / 2;
				refAngle = _animParentAngleMin + range;
				_animParentAngleRot += _animParentAngleInc * PI_OVER_180;
				_animParentAngle = refAngle + (range *  Math.sin(_animParentAngleRot));

//_animPartAngle = 180.0;
//_animParentAngle = 90.0 + 0.0;
//_animPartAngle   = 125.0;
//_animParentAngle = 125.0;
//console.log( "_animPartAngle=" + _animPartAngle + ", _animParentAngle=" + _animParentAngle );
			}


			//_age = _age+1;	//GROWTEST
            //if ( _age > MAX_TEST_AGE ) { _age = MAX_TEST_AGE; }	//GROWTEST


			//	Render the javascript version of the swimbot - with debug visualization
			let xspace = 40;
			_savedPartParameters.setParentPos( DEBUG_AREA_X - (xspace/2), DEBUG_AREA_Y + 20 );
			_splineFactor = DEFAULT_SPLINE_FACTOR;
			let color = _savedPartParameters.color;
			color.opacity = 0.3;
			_savedPartParameters.color = color;

			if ( _savedPartParameters.splined )
			{
				//this.splinedRender2D( _savedPartParameters );
				this.splinedRender2dDebug( _animPartAngle, _animParentAngle, _savedPartParameters );

				//	draw the 3d mesh alongside
	//globalGenepool3Dcpp.renderSwimbotPartTemplates( DEBUG_AREA_X, DEBUG_AREA_Y );	

				this.splinedRenderMesh( _savedPartParameters, DEBUG_AREA_X + (xspace/2), DEBUG_AREA_Y + 20 );		// <----------------------------------------
	//this.renderNormalMesh( _savedPartParameters, DEBUG_AREA_X + (xspace/2), DEBUG_AREA_Y + 0 );		// <----------------------------------------
				globalGenepool3Dcpp.setDebugPart( _savedPartParameters.partId, _savedPartParameters.hasEndcap );
			}
			else
			{
				//console.log("[renderDebugSwimbot] : partId = " + _savedPartParameters.partId );
				this.renderNormalMesh( _savedPartParameters, DEBUG_AREA_X + (xspace/2), DEBUG_AREA_Y + 20 );

				//this.renderPartNormal2d( partParms );
			}
		}
	}

	//-------------------------------------------------------------------------------------------------------
	//	Special render with debug helpers - used by renderDebugSwimbot
	//-------------------------------------------------------------------------------------------------------
	this.splinedRender2dDebug = function( partAngle, parentAngle, partParms )
	{
		//	hmmm.. lets see how few parms we actually need
		partParms.angle = partAngle;
		let radian = partAngle * PI_OVER_180;
		let len = partParms.length * _growthScale;
		let x0 = len * Math.sin( radian );
		let y0 = len * Math.cos( radian );

		// re-calc from parentPos, length growth, and angle
		partParms.position.x = partParms.parentPos.x + x0;
		partParms.position.y = partParms.parentPos.y + y0;
		partParms.axis.x = partParms.position.x - partParms.parentPos.x;
		partParms.axis.y = partParms.position.y - partParms.parentPos.y;
		partParms.perp.setXY( partParms.axis.y / len, -partParms.axis.x / len );

		//parentAngle = 45;
		radian = parentAngle * PI_OVER_180;
		let x1 = Math.sin( radian );
		let y1 = Math.cos( radian );
		partParms.parentPerp.setXY( -x1, -y1 );

		//console.log('x0=' + x0.toFixed(3) + ', y0=' + y0.toFixed(3) + ', perp=(' + partParms.perp.x.toFixed(3) + ',' + partParms.perp.y.toFixed(3) +
		//	') : x1=' + x1.toFixed(3) + ', y1=' + y1.toFixed(3) + ', parerp=(' + partParms.parentPerp.x.toFixed(3) + ',' + partParms.parentPerp.y.toFixed(3) + ')' );

		//console.log('partAngle = ' + partAngle.toFixed(2) + ', parentAngle = ' + parentAngle.toFixed(2) );

		let partNum			= partParms.partIndex;
		let parentIndex     = partParms.parentIndex;	// _phenotype.parts[partNum].parent;
		let position 		= partParms.position;		// _phenotype.parts[partNum].position;
		let parentPos 		= partParms.parentPos;		// _phenotype.parts[parentIndex].position;
		let color			= partParms.color;			// _colorUtility
		let angle			= partParms.angle;			// _phenotype.parts[partNum].currentAngle;
		let width			= partParms.width;			// _phenotype.parts[partNum].width;
		let length			= partParms.length;			// _phenotype.parts[partNum].length;
		let endCapSpline	= partParms.endCapSpline;	// _phenotype.parts[partNum].endCapSpline;
		let parentWidth		= partParms.parentWidth;	// _phenotype.parts[parentIndex].width;
		let perp			= partParms.perp;			// _phenotype.parts[partNum].perpendicular
		let parentPerp		= partParms.parentPerp;
		let childIndex		= partParms.childIndex;		// _phenotype.parts[partNum].child;
		let childPerp		= partParms.childPerp;		// _phenotype.parts[childIndex].perpendicular
		let branch			= partParms.branch;			// _phenotype.parts[partNum].branch
		let axis			= partParms.axis;			// _phenotype.parts[partNum].axis

		//console.log("  parentPos  = ( " + partParms.parentPos.x.toFixed(5) + ", " + partParms.parentPos.y.toFixed(5) + " );" );
		//console.log("  angle      = "   + partParms.angle.toFixed(5) + ";" );
		//console.log("  length     = "   + partParms.length.toFixed(5) + ";" );
		//console.log("  position   = ( " + partParms.position.x.toFixed(5) + ", " + partParms.position.y.toFixed(5) + " );" );
		//console.log("  perp       = ( " + partParms.perp.x.toFixed(5) + ", " + partParms.perp.y.toFixed(5) + " );" );
		//console.log("  axis       = ( " + partParms.axis.x.toFixed(5) + ", " + partParms.axis.y.toFixed(5) + " );" );
		//console.log("* position   = ( " + newPos.x.toFixed(5) + ", " + newPos.y.toFixed(5) + " );" );
		//console.log("* axis       = ( " + newAxis.x.toFixed(5) + ", " + newAxis.y.toFixed(5) + " );" );
		//console.log("* perp       = ( " + newPerp.x.toFixed(5) + ", " + newPerp.y.toFixed(5) + " );" );

		let splineData = this.generateSplineData( partParms );

		_canvas.fillStyle = color.rgba();
		_canvas.strokeStyle = OUTLINE_COLOR;
		let fillOpacity = 0.25;
		let strokeOpacity = 0.25;

		let cap_startx  = 0;
		let cap_starty  = 0;
		let cap_endx    = 0;
		let cap_endy    = 0;
		let cap_c1x     = 0;
		let cap_c1y     = 0;
		let cap_c2x     = 0;
		let cap_c2y     = 0;

		//---------------------------------------
		// the beginning of a series of parts
		//
		//	1
		//
		partNum = 1;

		if ( partNum === 1 )
		{
			_canvas.fillStyle   = "rgba( 255, 255, 255, " + fillOpacity + " )";
			_canvas.strokeStyle = "rgba( 255, 0, 0, 255 )";

			//_canvas.beginPath();
			//_canvas.arc( parentPos.x, parentPos.y, width, 0, PI2, false );
			//_canvas.fill();
			//_canvas.closePath();	

			let radian = angle * PI_OVER_180;
			_canvas.beginPath();
			_canvas.arc( parentPos.x, parentPos.y, width, Math.PI - radian, Math.PI - radian + Math.PI,  false  );
			_canvas.stroke();
			_canvas.closePath();
		}

        //---------------------------------------
        // a terminating end part
		//
		//	2
		//
        if ( childIndex === NULL_INDEX )
        {
			_canvas.fillStyle   = "rgba( 255, 0, 0, " + fillOpacity + " )";
			_canvas.strokeStyle = "rgba( 255, 0, 0, " + strokeOpacity + " )";

            let s =  width * endCapSpline;
            let f = -1.0; // basically, a pixel's width...I think
            
            let axisNormalX = axis.x / length;
            let axisNormalY = axis.y / length;

            cap_startx  = splineData.endLeftX  + axisNormalX * f;
            cap_starty  = splineData.endLeftY  + axisNormalY * f;
            cap_endx    = splineData.endRightX + axisNormalX * f;
            cap_endy    = splineData.endRightY + axisNormalY * f;
            cap_c1x     = splineData.endLeftX  + axisNormalX * s;
            cap_c1y     = splineData.endLeftY  + axisNormalY * s;
            cap_c2x     = splineData.endRightX + axisNormalX * s;
            cap_c2y     = splineData.endRightY + axisNormalY * s;

            _canvas.beginPath();
            _canvas.moveTo( cap_startx, cap_starty );
            _canvas.bezierCurveTo( cap_c1x, cap_c1y, cap_c2x, cap_c2y, cap_endx, cap_endy );
            _canvas.closePath();	    
            _canvas.fill();

			//	outline
            _canvas.moveTo( cap_startx, cap_starty );
            _canvas.bezierCurveTo( cap_c1x, cap_c1y, cap_c2x, cap_c2y, cap_endx, cap_endy );
            _canvas.stroke();
        }
        
        //---------------------------------------
        // fill interior
		_canvas.fillStyle   = "rgba( 100, 255, 100, " + fillOpacity + " )";
		_canvas.strokeStyle = "rgba( 100, 255, 100, " + strokeOpacity + " )";

		_canvas.beginPath();
		_canvas.moveTo( splineData.startLeftX, splineData.startLeftY );
		_canvas.bezierCurveTo( splineData.control1LeftX, splineData.control1LeftY, splineData.control2LeftX, splineData.control2LeftY, splineData.endLeftX, splineData.endLeftY );
		_canvas.lineTo( splineData.endRightX, splineData.endRightY );
		_canvas.bezierCurveTo( splineData.control2RightX, splineData.control2RightY, splineData.control1RightX, splineData.control1RightY, splineData.startRightX, splineData.startRightY );
		_canvas.lineTo( splineData.startLeftX, splineData.startLeftY );
		_canvas.closePath();	    
		_canvas.fill();	

		//	ball joint at parentpos
		_canvas.fillStyle   = "rgba( 255, 0, 255, " + fillOpacity + " )";
		_canvas.strokeStyle = "rgba( 255, 0, 255, " + strokeOpacity + " )";
		_canvas.beginPath();
		_canvas.arc( parentPos.x, parentPos.y, parentWidth * 0.9, 0, PI2, false );
		_canvas.fill();
		_canvas.closePath();	

        //---------------------------------------
        // draw outline
		_canvas.fillStyle   = "rgba( 0, 0, 255, " + fillOpacity + " )";
		_canvas.strokeStyle = "rgba( 0, 0, 255, " + strokeOpacity + " )";

		_canvas.lineWidth = 1.0;       	
		_canvas.beginPath();
		_canvas.moveTo( splineData.startLeftX, splineData.startLeftY );
		_canvas.bezierCurveTo( splineData.control1LeftX, splineData.control1LeftY, splineData.control2LeftX, splineData.control2LeftY, splineData.endLeftX, splineData.endLeftY );
		_canvas.moveTo( splineData.endRightX, splineData.endRightY );
		_canvas.bezierCurveTo( splineData.control2RightX, splineData.control2RightY, splineData.control1RightX, splineData.control1RightY, splineData.startRightX, splineData.startRightY );
		_canvas.stroke();								
		_canvas.closePath();	

		//	Mimic bezierCurveTo using local function drawBezier
		//let xof = -10, yof = 0;
		//let p0=0, p1=0, p2=0, p3=0;
		//p0 = { x: splineData.endRightX      + xof,  y: splineData.endRightY      + yof };
		//p1 = { x: splineData.control2RightX + xof,  y: splineData.control2RightY + yof  };
		//p2 = { x: splineData.control1RightX + xof,  y: splineData.control1RightY + yof  };
		//p3 = { x: splineData.startRightX    + xof,  y: splineData.startRightY    + yof  };
		//_canvas.fillStyle   = "rgba( 255, 0, 1, 1.0 )";
		//_canvas.strokeStyle = "rgba( 255, 0, 1, 1.0 )";
		//this.drawBezier( p0, p1, p2, p3 )
		//xof = 10;
		//p0 = { x: splineData.endLeftX      + xof,  y: splineData.endLeftY      + yof  };
		//p1 = { x: splineData.control2LeftX + xof,  y: splineData.control2LeftY + yof  };
		//p2 = { x: splineData.control1LeftX + xof,  y: splineData.control1LeftY + yof  };
		//p3 = { x: splineData.startLeftX    + xof,  y: splineData.startLeftY    + yof  };
		//_canvas.fillStyle   = "rgba( 255, 1, 0, 1.0 )";
		//_canvas.strokeStyle = "rgba( 255, 0, 0, 1.0 )";
		//this.drawBezier( p0, p1, p2, p3 )

		//	create some axis if needed
		let showDebugHelpers = false;
		if ( showDebugHelpers ) {

			if ( _dbgAxisId_1 == ZERO ) {
				let color = new Module.Color( 1, 1, 0, 1 );
				color.setRGB( 1, 1, 1 );		_dbgAxisId_1  = globalGenepool3Dcpp.allocateDebugAxis( color, 4 );	// partPos
				color.setRGB( 0.5, 0.5, 0.5 );	_dbgAxisId_2  = globalGenepool3Dcpp.allocateDebugAxis( color, 4 );	// parentPos
				color.setRGB( 1, 1, 1 );		_dbgAxisId_3  = globalGenepool3Dcpp.allocateDebugAxis( color, 4 );
				color.setRGB( 1, 1, 1 );		_dbgAxisId_4  = globalGenepool3Dcpp.allocateDebugAxis( color, 4 );
				color.setRGB( 0, 0, 1 );		_dbgAxisId_5  = globalGenepool3Dcpp.allocateDebugAxis( color, 4 );	// startLeft - bLue
				color.setRGB( 0, 0, 0 );		_dbgAxisId_6  = globalGenepool3Dcpp.allocateDebugAxis( color, 3 );
				color.setRGB( 0, 0, 0 );		_dbgAxisId_7  = globalGenepool3Dcpp.allocateDebugAxis( color, 3 );
				color.setRGB( 0, 0, 0 );		_dbgAxisId_8  = globalGenepool3Dcpp.allocateDebugAxis( color, 3 );
				color.setRGB( 1, 0, 0 );		_dbgAxisId_9  = globalGenepool3Dcpp.allocateDebugAxis( color, 4 );	// startRight - Red
				color.setRGB( 0, 0, 0 );		_dbgAxisId_10 = globalGenepool3Dcpp.allocateDebugAxis( color, 3 );
				color.setRGB( 0, 0, 0 );		_dbgAxisId_11 = globalGenepool3Dcpp.allocateDebugAxis( color, 3 );
				color.setRGB( 0, 0, 0 );		_dbgAxisId_12 = globalGenepool3Dcpp.allocateDebugAxis( color, 3 );

				color.setRGB( 1, 1, 0 );		_dbgRayId_1   = globalGenepool3Dcpp.allocateDebugRay( color, 60 );	// axis
				color.setRGB( 0, 1, 1 );		_dbgRayId_2   = globalGenepool3Dcpp.allocateDebugRay( color, 60 );	// partPerp
				color.setRGB( 1, 0, 0 );		_dbgRayId_3   = globalGenepool3Dcpp.allocateDebugRay( color, 60 );	// parentPerp
				color.setRGB( 0, 1, 0 );		_dbgRayId_4   = globalGenepool3Dcpp.allocateDebugRay( color, 60 );	// parentPerp
				color.setRGB( 0, 0, 1 );		_dbgRayId_5   = globalGenepool3Dcpp.allocateDebugRay( color, 60 );	// parentPerp
				color.delete();
				this.hideAllDebugHelpers()
			}

			//let pos    = _savedPartParameters.position;
			//let parPos = _savedPartParameters.parentPos;
			let zval   = 500.0;


			//globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_1, true );
			//globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_1, cap_startx, cap_starty, zval );
			//globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_2, true );
			//globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_2, cap_c1x, cap_c1x, zval );
			//globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_3, true );
			//globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_3, cap_c2x, cap_c2y, zval );
			//globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_4, true );
			//globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_4, cap_endx, cap_endy, zval );


			//globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_1, true );
			//globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_2, true );
			//globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_1, position.x, position.y, zval - 50 );
			//globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_2, parentPos.x, parentPos.y, zval - 50);

			globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_5, true );
			globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_6, true );
			globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_7, true );
			globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_8, true );


			//let s =  width * endCapSpline;
			//let f = -1.0; // basically, a pixel's width...I think
			//let axisNormalX = axis.x / length;
			//let axisNormalY = axis.y / length;
			//let sx	= splineData.endLeftX  + axisNormalX * f;
			//let sy	= splineData.endLeftY  + axisNormalY * f;
			//let ex	= splineData.endRightX + axisNormalX * f;
			//let ey	= splineData.endRightY + axisNormalY * f;
			//let c1x	= splineData.endLeftX  + axisNormalX * s;
			//let c1y	= splineData.endLeftY  + axisNormalY * s;
			//let c2x	= splineData.endRightX + axisNormalX * s;
			//let c2y	= splineData.endRightY + axisNormalY * s;
			//globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_5, sx, sy, zval );
			//globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_6, c1x, c1y, zval );
			//globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_7, c2x, c2y, zval );
			//globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_8, ex, ey, zval );
			//globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_3, true );
			//globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_4, true );
			//globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_3, splineData.endLeftX, splineData.endLeftY, zval );
			//globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_4, splineData.endRightX, splineData.endRightY, zval );


			globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_5, splineData.startLeftX, splineData.startLeftY, zval );
			globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_6, splineData.control1LeftX, splineData.control1LeftY, zval );
			globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_7, splineData.control2LeftX, splineData.control2LeftY, zval );
			globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_8, splineData.endLeftX, splineData.endLeftY, zval );

			globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_9, true );
			globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_10, true );
			globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_11, true );
			globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_12, true );
			globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_9 , splineData.startRightX, splineData.startRightY, zval );
			globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_10, splineData.control1RightX, splineData.control1RightY, zval );
			globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_11, splineData.control2RightX, splineData.control2RightY, zval );
			globalGenepool3Dcpp.positionDebugAxis( _dbgAxisId_12, splineData.endRightX, splineData.endRightY, zval );


			globalGenepool3Dcpp.showDebugRay( _dbgRayId_1, true );	// yellow
			globalGenepool3Dcpp.positionDebugRay( _dbgRayId_1, position.x, position.y, zval, parentPos.x, parentPos.y, zval + 50 );

			globalGenepool3Dcpp.showDebugRay( _dbgRayId_2, true );	// cyan
			globalGenepool3Dcpp.positionDebugRay( _dbgRayId_2,
				//position.x + (off * perp.x), position.y + (off * perp.y), zval,
				//position.x - (off * perp.x), position.y - (off * perp.y), zval );
				position.x, position.y, zval,
				position.x + ( width * 1.0 * perp.x), position.y + ( width * 1.0 * perp.y), zval );

			//console.log("perp=(" + perp.x.toFixed(3) + "," + perp.y.toFixed(3) + "), parPerp=(" + parentPerp.x.toFixed(3) + "," + parentPerp.y.toFixed(3) + ")");

			globalGenepool3Dcpp.showDebugRay( _dbgRayId_3, true );	// red
			globalGenepool3Dcpp.positionDebugRay( _dbgRayId_3,
				//parentPos.x + (off * parentPerp.x), parentPos.y + (off * parentPerp.y), zval,
				//parentPos.x - (off * parentPerp.x), parentPos.y - (off * parentPerp.y), zval );
				parentPos.x, parentPos.y, zval,
				parentPos.x + ( width * 1.0 * parentPerp.x), parentPos.y + ( width * 1.0 * parentPerp.y), zval );

			globalGenepool3Dcpp.showDebugRay( _dbgRayId_4, true );	// green
			globalGenepool3Dcpp.positionDebugRay( _dbgRayId_4,
				parentPos.x, parentPos.y, zval,
				parentPos.x + ( width * 1.5 * _perpStart.x), parentPos.y + ( width * 1.5 * _perpStart.y), zval );

			globalGenepool3Dcpp.showDebugRay( _dbgRayId_5, true );	// blue
			globalGenepool3Dcpp.positionDebugRay( _dbgRayId_5,
				position.x, position.y, zval,
				position.x + ( width * 1.5 * _perpEnd.x), position.y + ( width * 1.5 * _perpEnd.y), zval );
		}
	}

	this.hideAllDebugHelpers = function()
	{
		if (_dbgAxisId_1    != 0)	globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_1,  false );
		if (_dbgAxisId_2    != 0)	globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_2,  false );
		if (_dbgAxisId_3    != 0)	globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_3,  false );
		if (_dbgAxisId_4    != 0)	globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_4,  false );
		if (_dbgAxisId_5    != 0)	globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_5,  false );
		if (_dbgAxisId_6    != 0)	globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_6,  false );
		if (_dbgAxisId_7    != 0)	globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_7,  false );
		if (_dbgAxisId_8    != 0)	globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_8,  false );
		if (_dbgAxisId_9    != 0)	globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_9,  false );
		if (_dbgAxisId_10   != 0)	globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_10, false );
		if (_dbgAxisId_11   != 0)	globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_11, false );
		if (_dbgAxisId_12   != 0)	globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_12, false );
		if (_dbgRayId_1     != 0)	globalGenepool3Dcpp.showDebugRay ( _dbgRayId_1,   false );
		if (_dbgRayId_2     != 0)	globalGenepool3Dcpp.showDebugRay ( _dbgRayId_2,   false );
		if (_dbgRayId_3     != 0)	globalGenepool3Dcpp.showDebugRay ( _dbgRayId_3,   false );
		if (_dbgRayId_4     != 0)	globalGenepool3Dcpp.showDebugRay ( _dbgRayId_4,   false );
		if (_dbgRayId_5     != 0)	globalGenepool3Dcpp.showDebugRay ( _dbgRayId_5,   false );
		if (_dbgAxisId_Part != 0)	globalGenepool3Dcpp.showDebugAxis( _dbgAxisId_Part, false );
	}

	//======================================================================================================================================================
	//======================================================================================================================================================
	//
	//
	//	Helper funtion to contain part rendering data
	//
	//
	//======================================================================================================================================================
	//======================================================================================================================================================
	function Render3dData()
	{
		this.isDebug		= false;
		this.partIndex		= NULL_INDEX;
		this.parentIndex	= NULL_INDEX;
		this.childIndex		= NULL_INDEX;
		this.splined		= false;
		this.color			= new Color();
		this.position		= new Vector2D();
		this.parentPos		= new Vector2D();
		this.angle			= 0;
		this.width			= 0;
		this.length			= 0;
		this.endCapSpline	= 0;
		this.parentWidth	= 0;
		this.perp			= new Vector2D();
		this.parentPerp		= new Vector2D();
		this.childPerp		= new Vector2D();
		this.axis			= new Vector2D();
		this.branch			= false;

		this.baseColor		= new Color();
		this.blendColor		= new Color();
		this.blendPct		= 0;
		this.partId			= NULL_INDEX;
		this.hasEndcap		= false;
		this.blendAngle		= 0;
		this.isMeshVisible	= false;

		this.minAngle		=  99999;
		this.maxAngle		= -99999;

		//	TBD : this should only fetch the static data from phenotypeParts
		this.initialize = function( partNum, phenotypeParts )
		{
			let curPart			= phenotypeParts[partNum];
			let parentIndex		= phenotypeParts[partNum].parent;
			let parPart			= phenotypeParts[parentIndex];
			let childIndex		= phenotypeParts[partNum].child;

			this.partIndex		= partNum;
			this.parentIndex	= parentIndex;
			this.childIndex		= childIndex;
			this.splined		= curPart.splined;
			this.angle			= curPart.currentAngle;
			this.width			= curPart.width;
			this.length			= curPart.length;
			this.endCapSpline	= curPart.endCapSpline;
			this.parentWidth	= parPart.width;
			this.branch			= curPart.branch;

			this.color.copy				( _colorUtility );
			this.position.copyFrom		( curPart.position );
			this.parentPos.copyFrom		( parPart.position );
			this.perp.copyFrom			( curPart.perpendicular );
			this.parentPerp.copyFrom	( parPart.perpendicular );
			this.axis.copyFrom			( curPart.axis );
			if (childIndex == NULL_INDEX) {
				this.childPerp = new Vector2D();
			} else {
				this.childPerp.copyFrom( _phenotype.parts[childIndex].perpendicular );
			}

			this.baseColor.copy		( curPart.baseColor  );
			this.blendColor.copy	( curPart.blendColor );
			this.blendPct			= curPart.blendPct;
			this.blendAngle			= curPart.blendAngle;
		}

		//	TBD : this should only fetch the dynamic data from phenotypeParts
		this.updateNormal = function( partNum, phenotypeParts )
		{
			let curPart			= phenotypeParts[partNum];
			let parentIndex		= phenotypeParts[partNum].parent;
			let parPart			= phenotypeParts[parentIndex];
			let childIndex		= phenotypeParts[partNum].child;

			this.partIndex		= partNum;
			this.parentIndex	= parentIndex;
			this.childIndex		= childIndex;
			this.splined		= curPart.splined;
			this.angle			= curPart.currentAngle;
			this.width			= curPart.width;
			this.length			= curPart.length;
			//this.endCapSpline	= curPart.endCapSpline;
			//this.parentWidth	= parPart.width;
			//this.branch			= curPart.branch;

			this.color.copy				( _colorUtility );
			this.position.copyFrom		( curPart.position );
			this.parentPos.copyFrom		( parPart.position );
			//this.perp.copyFrom			( curPart.perpendicular );
			//this.parentPerp.copyFrom	( parPart.perpendicular );
			//this.axis.copyFrom			( curPart.axis );
			//if (childIndex == NULL_INDEX) {
			//	this.childPerp = new Vector2D();
			//} else {
			//	this.childPerp.copyFrom( _phenotype.parts[childIndex].perpendicular );
			//}

			this.blendAngle			= curPart.blendAngle;
			this.baseColor.copy		( curPart.baseColor  );
			this.blendPct			= curPart.blendPct;
			if ( this.blendPct != 0 ) {
				this.blendColor.copy	( curPart.blendColor );
			}
		}

		this.updateSplined = function( partNum, phenotypeParts )
		{
			let curPart			= phenotypeParts[partNum];
			let parentIndex		= phenotypeParts[partNum].parent;
			let parPart			= phenotypeParts[parentIndex];
			let childIndex		= phenotypeParts[partNum].child;

			this.partIndex		= partNum;
			this.parentIndex	= parentIndex;
			this.childIndex		= childIndex;
			this.splined		= curPart.splined;
			this.angle			= curPart.currentAngle;
			this.width			= curPart.width;
			this.length			= curPart.length;
			this.endCapSpline	= curPart.endCapSpline;
			this.parentWidth	= parPart.width;
			this.branch			= curPart.branch;

			this.color.copy				( _colorUtility );
			this.position.copyFrom		( curPart.position );
			this.parentPos.copyFrom		( parPart.position );
			this.perp.copyFrom			( curPart.perpendicular );
			this.parentPerp.copyFrom	( parPart.perpendicular );
			this.axis.copyFrom			( curPart.axis );
			if (childIndex == NULL_INDEX) {
				this.childPerp = new Vector2D();
			} else {
				this.childPerp.copyFrom( _phenotype.parts[childIndex].perpendicular );
			}

			this.blendAngle			= curPart.blendAngle;
			this.baseColor.copy		( curPart.baseColor  );
			this.blendPct			= curPart.blendPct;
			if ( this.blendPct != 0 ) {
				this.blendColor.copy	( curPart.blendColor );
			}
		}

		this.dump = function() {
			let log = function(text) { console.log(text); }
			log("	this.partIndex        = " + this.partIndex + ";" );
			log("	this.parentIndex      = " + this.parentIndex + ";" );
			log("	this.childIndex       = " + this.childIndex + ";" );
			log("	this.splined          = " + this.splined + ";" );
			log("	this.position.setXY   ( " + this.position.x.toFixed(5) + ", " + this.position.y.toFixed(5) + " );" );
			log("	this.parentPos.setXY  ( " + this.parentPos.x.toFixed(5) + ", " + this.parentPos.y.toFixed(5) + " );" );
			log("	this.angle            = " + this.angle.toFixed(5) + ";" );
			log("	this.width            = " + this.width.toFixed(5) + ";" );
			log("	this.length           = " + this.length.toFixed(5) + ";" );
			log("	this.endCapSpline     = " + this.endCapSpline.toFixed(5) + ";" );
			log("	this.parentWidth      = " + this.parentWidth.toFixed(5) + ";" );
			log("	this.perp.setXY       ( " + this.perp.x.toFixed(5) + ", " + this.perp.y.toFixed(5) + " );" );
			log("	this.parentPerp.setXY ( " + this.parentPerp.x.toFixed(5) + ", " + this.parentPerp.y.toFixed(5) + " );" );
			log("	this.childPerp.setXY  ( " + this.childPerp.x.toFixed(5) + ", " + this.childPerp.y.toFixed(5) + " );" );
			log("	this.axis.setXY       ( " + this.axis.x.toFixed(5) + ", " + this.axis.y.toFixed(5) + " );" );
			log("	this.branch           = " + this.branch + ";" );

			log("	this.color.set        ( " + this.color     .red.toFixed(3) + ", " + this.color     .green.toFixed(3) + ", " + this.color     .blue.toFixed(3) + ", " + this.color.opacity     .toFixed(3) + " );" );
			log("	this.baseColor.set    ( " + this.baseColor .red.toFixed(3) + ", " + this.baseColor .green.toFixed(3) + ", " + this.baseColor .blue.toFixed(3) + ", " + this.baseColor.opacity .toFixed(3) + " );" );
			log("	this.blendColor.set   ( " + this.blendColor.red.toFixed(3) + ", " + this.blendColor.green.toFixed(3) + ", " + this.blendColor.blue.toFixed(3) + ", " + this.blendColor.opacity.toFixed(3) + " );" );
			log("	this.blendPct         = " + this.blendPct.toFixed(3) + ";" );
			log("	this.partId           = " + this.partId + ";" );
		}

		this.copy = function( that ) {
			this.partIndex			= that.partIndex;
			this.parentIndex		= that.parentIndex;
			this.childIndex			= that.childIndex;
			this.splined			= that.splined;
			this.color				= that.color;
			this.position.setXY		( that.position.x, that.position.y );
			this.parentPos.setXY	( that.parentPos.x, that.parentPos.y );
			this.angle				= that.angle;
			this.width				= that.width;
			this.length				= that.length;
			this.endCapSpline		= that.endCapSpline;
			this.parentWidth		= that.parentWidth;
			this.perp.setXY			( that.perp.x, that.perp.y );
			this.parentPerp.setXY	( that.parentPerp.x, that.parentPerp.y );
			this.childPerp.setXY	( that.childPerp.x, that.childPerp.y );
			this.axis.setXY			( that.axis.x, that.axis.y );
			this.branch				= that.branch;

			this.baseColor.copy		( that.baseColor );
			this.blendColor.copy	( that.blendColor );
			this.blendPct			= that.blendPct;
			this.partId				= that.partId;
		}

		this.setParentPos = function( x, y ) {
			let xoff = this.position.x - this.parentPos.x;
			let yoff = this.position.y - this.parentPos.y;
			this.parentPos.x = x;
			this.parentPos.y = y;
			this.position.x  = x + xoff;
			this.position.y  = y + yoff;
		}

		//	given a different angle, recalculate all dynamic parameters
		this.updateAngle = function( angle )
		{
			this.angle = angle;
			let radian = angle * PI_OVER_180;
			let length = this.length * _growthScale;
			let x = length * Math.sin( radian );
			let y = length * Math.cos( radian );

			if ( this.partIndex > 1 ) {
				this.parentPerp.setXY( 0, 0 );	//TBD
			}

			this.position.addXY( x, y );
			this.axis.x = this.position.x - this.parentPos.x;
			this.axis.y = this.position.y - this.parentPos.y;
			this.perp.setXY( this.axis.y / length, -this.axis.x / length );
		}

		this.setTest_a = function() {
			this.position.setXY   ( 4450.94125, 4040.69643 );
			this.parentPos.setXY  ( 4457.60374, 4044.71627 );
			this.angle            = -121.10487;
			this.endCapSpline     = 1.08789;
			this.parentWidth      = 4.84180;
			this.perp.setXY       ( -0.51661, 0.85622 );
			this.parentPerp.setXY ( -0.41962, 0.90770 );
			this.childPerp.setXY  ( 0.00000, 0.00000 );
			this.axis.setXY       ( -6.66249, -4.01984 );
			this.partIndex        = 4;
			this.parentIndex      = 3;
			this.childIndex       = -1;
			this.splined          = true;
			this.width            = 5.88281;
			this.length           = 7.78125;
			this.branch           = false;
			this.color.set        ( 1.000, 0.500, 0.000, 1.000 );
			this.baseColor.set    ( 1.000, 1.000, 1.000, 1.000 );
			this.blendColor.set   ( 1.000, 1.000, 1.000, 1.000 );
			this.blendPct         = 0.000;
		}

		this.setTest_b = function() {
			this.partIndex        = 13;
			this.parentIndex      = 12;
			this.childIndex       = 14;
			this.splined          = true;
			this.position.setXY   ( 4599.44387, 4068.70548 );
			this.parentPos.setXY  ( 4614.34275, 4076.62942 );
			this.angle            = 241.99379;
			this.width            = 5.29036;
			this.length           = 16.87500;
			this.endCapSpline     = 1.51172;
			this.parentWidth      = 4.56250;
			this.perp.setXY       ( -0.46957, 0.88290 );
			this.parentPerp.setXY ( -0.98151, 0.19142 );
			this.childPerp.setXY  ( 0.16949, 0.98553 );
			this.axis.setXY       ( -14.89888, -7.92395 );
			this.branch           = false;
			this.color.set        ( 1.000, 0.500, 0.000, 1.000 );
			this.baseColor.set    ( 1.000, 0.000, 0.500, 1.000 );
			this.blendColor.set   ( 1.000, 1.000, 1.000, 1.000 );
			this.blendPct         = 0.000;
		}

		this.setTest_c = function()
		{
			this.partIndex        = 8;
			this.parentIndex      = 7;
			this.childIndex       = -1;
			this.splined          = true;
			this.position.setXY   ( 3388.85435, 3486.25813 );
			this.parentPos.setXY  ( 3377.38688, 3467.33690 );
			this.angle            = 31.21851;
			this.width            = 6.84766                * 1.4;
			this.length           = 22.12500;
			this.endCapSpline     = 3.33008;
			this.parentWidth      = 6.68262                * 1.0;
			this.perp.setXY       ( 0.85520, -0.51830 );
			this.parentPerp.setXY ( 0.98749, -0.15769 );
			this.childPerp.setXY  ( 0.00000, 0.00000 );
			this.axis.setXY       ( 11.46746, 18.92123 );
			this.branch           = false;
			this.color.set        ( 1.000, 0.500, 0.000, 1.000 );
			this.baseColor.set    ( 0.500, 0.000, 1.000, 1.000 );
			this.blendColor.set   ( 1.000, 1.000, 1.000, 1.000 );
			this.blendPct         = 0.000;
		};

		this.setTest_D = function()
		{
			this.partIndex        = 1;
			this.parentIndex      = 0;
			this.childIndex       = 2;
			this.splined          = 0;
			this.position.setXY   ( 3622.46530, 2898.48665 );
			this.parentPos.setXY  ( 3629.58885, 2873.51404 );
			this.angle            = -15.92106;
			this.width            = 6.89844;
			this.length           = 25.96875;
			this.endCapSpline     = 0.82813;
			this.parentWidth      = 0.00000;
			this.perp.setXY       ( 0.96164, 0.27431 );
			this.parentPerp.setXY ( 0.00000, 0.00000 );
			this.childPerp.setXY  ( 0.96254, 0.27115 );
			this.axis.setXY       ( -7.12356, 24.97260 );
			this.branch           = true;
			this.color.set        ( 1.000, 0.500, 0.000, 1.000 );
			this.baseColor.set    ( 1.000, 1.000, 1.000, 1.000 );
			this.blendColor.set   ( 1.000, 1.000, 1.000, 1.000 );
			this.blendPct         = 0.000;
		}
	}
}
