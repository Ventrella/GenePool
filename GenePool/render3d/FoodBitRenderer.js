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

	var _renderModeFoodBits = 1;

	//-------------------------------------
	// initialize - one time setup
	//-------------------------------------
	this.initialize = function ( canvas ) {
		_canvas = canvas;
	}

	//	dispose of render assets for a given foodbit
	this.releaseRenderAssets = function( foodBit )
	{
		genePool3D.deleteFoodBit( this );
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
			genePool3D.setAllFoodBitVisibility( false );
		}

		_renderModeFoodBits++;
		if ( _renderModeFoodBits > 2 ) {
			_renderModeFoodBits = 0;
		}

		console.log( "###### foodBitRenderer changeRenderMode: " + _renderModeFoodBits );
	}

	this.render = function( foodBit, isSelected, isMouseOver, camera )
	{
		_viewScale = camera.getScale();
		_bitScale  = foodBit.getSizeViewScale();
	    _radius    = foodBit.getSize() + _viewScale * _bitScale * _bitScale;
		_position  = foodBit.getPosition();
		_color     = foodBit.getColor();

		switch ( _renderModeFoodBits )
		{
			case 0 : break;
			case 1 : this.render2d();	break;
			case 2 : genePool3D.renderFoodBit( foodBit, _viewScale );	break;
		}
	}

	//
	//	Original 2D rendering code from GenePool - 4/2/22
	//
	this.render2d = function()
	{
        //_canvas.fillStyle = "rgba( " + FOOD_BIT_COLOR_COMPONENTS + ", " + _opacity + ")";	    
        _canvas.fillStyle = _color.rgba();
        _canvas.beginPath();
        _canvas.arc( _position.x, _position.y, _radius, 0, PI2, false );
        _canvas.fill();
        _canvas.closePath();	
    }
}