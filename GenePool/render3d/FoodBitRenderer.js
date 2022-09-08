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
// Food bit rendering
//------------------------
function FoodBitRenderer()
{
	let _canvas = null;

	var _viewScale;
	var _bitScale;
	var _radius;
	var _position;
	var _color;


	//	renderMode - 0: dont't render
	//               1: render 2d (canvas)
	//               2: render 3d (AlfEngine)
	var _renderFoodBitOFF = function(p) {}
	var _renderFoodBitFunc;
	var _renderModeFoodBits;

	//-------------------------------------
	// initialize - one time setup
	//-------------------------------------
	this.initialize = function ( canvas ) {
		_canvas = canvas;

		// default 2d
		//_renderFoodBitFunc = _renderFoodBit2d;
		//_renderModeFoodBits = 1;

		// default 3d
		_renderFoodBitFunc = _renderFoodBit3d;
		_renderModeFoodBits = 2;
	}

	//	dispose of render assets for a given foodbit
	this.releaseRenderAssets = function( foodBit )
	{
		if ( "meshId" in foodBit )
		{
			globalGenepool3Dcpp.deleteFoodBit( foodBit.meshId );	// kill the 3D assets
			delete foodBit.meshId;								// remove the ID key from the js object
		}
	}

	//-----------------------------------------
	//	renderMode - 0: dont't render
	//               1: render 2d (canvas)
	//               2: render 3d (AlfEngine)
	//-----------------------------------------
	this.cycleRenderMode = function()
	{
		//	If prev mode was '3d render', then hide all (dev hack to enable cycling between 2d and 3d render)
		if (_renderModeFoodBits == 2) {
			//genePool3D.setAllFoodBitVisibility( false );
			globalGenepool3Dcpp.setAllFoodBitVisibility( false );
		}

		_renderModeFoodBits++;
		if ( _renderModeFoodBits > 2 ) {
			_renderModeFoodBits = 0;
		}

		let state = 'foo';
		switch (_renderModeFoodBits) {
			case 0 : state = 'OFF'; _renderFoodBitFunc = _renderFoodBitOFF; break;
			case 1 : state = '2D' ; _renderFoodBitFunc = _renderFoodBit2d;  break;
			case 2 : state = '3D' ; _renderFoodBitFunc = _renderFoodBit3d;  break;
		}

		genePool3D.displayPopupMsg( 'Foodbit render : ', state, 500 );
	}

	this.render = function( foodBit, isSelected, isMouseOver, camera )
	{
		_viewScale = camera.getScale();
		_bitScale  = foodBit.getSizeViewScale();
	    _radius    = foodBit.getSize() + _viewScale * _bitScale * _bitScale;
		_position  = foodBit.getPosition();
		_color     = foodBit.getColor();
		_renderFoodBitFunc( foodBit );
	}

	//
	//
	//
	var _renderFoodBit3d = function( foodBit )
	{
		if (!("meshId" in foodBit)) {
			foodBit.meshId = globalGenepool3Dcpp.createFoodBit( _radius );
		}

		globalGenepool3Dcpp.renderFoodBit( foodBit.meshId, _position.x, _position.y, _color.red, _color.green, _color.blue );
	}

	//
	//	Original 2D rendering code from GenePool - 4/2/22
	//
	var _renderFoodBit2d = function()
	{
        _canvas.fillStyle = _color.rgba();
        _canvas.beginPath();
        _canvas.arc( _position.x, _position.y, _radius, 0, PI2, false );
        _canvas.fill();
        _canvas.closePath();	
    }
}