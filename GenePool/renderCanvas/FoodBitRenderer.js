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

	//-------------------------------------
	// initialize - one time setup
	//-------------------------------------
	this.initialize = function ( canvas ) {
		_canvas = canvas;
	}

	//	dispose of render assets for a given foodbit
	this.releaseRenderAssets = function( foodBit ) {
		//	2D renderer currently has no assets
	}

	this.render = function( foodBit, isSelected, isMouseOver, camera )
	{
        //_canvas.fillStyle = "rgba( " + FOOD_BIT_COLOR_COMPONENTS + ", " + _opacity + ")";	    
		let viewScale = camera.getScale();
		let bitScale  = foodBit.getSizeViewScale();
	    let radius    = foodBit.getSize() + viewScale * bitScale * bitScale;
		let position  = foodBit.getPosition();
		let color     = foodBit.getColor();

        _canvas.fillStyle = color.rgba();
        _canvas.beginPath();
        _canvas.arc( position.x, position.y, radius, 0, PI2, false );
        _canvas.fill();
        _canvas.closePath();	
    }
}