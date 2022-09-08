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


//-------------------------------------------------
// perform renderer specific system configuration
//-------------------------------------------------
configureRenderer = function ()
{
	console.log("=========> configureRenderer() : 2D");
}

function Renderer()
{
	let _poolRenderer        = new PoolRenderer();
	let _swimbotRenderer     = new SwimbotRenderer(); 
	let _foodBitRenderer     = new FoodBitRenderer(); 

	let _canvas              = null;
	let _canvasWidth         = 0;
	let _canvasHeight        = 0;

	//	The 2D uses a timer function to trigger updates
	this.useExternalUpdate = function () {
		return false;
	}

	this.is3dRender = function () {
		return false;
	}

	//
	//	Renderers can support their own set of debug modes tied to key events.
	//	Currently, 2D canvas renderer has none.
	//
	this.handleRenderSpecificKeyDown = function( keyCode, isShiftKey, isCtrlKey, isAltKey ) {}
	this.handleRenderSpecificKeyUp = function( keyCode, isShiftKey, isCtrlKey, isAltKey ) {}

	//	The 3d renderer uses 'simulationRunning' status to manage visual debug objects
	this.setSimulationRunning = function(s) {}
	//	This is a useful hook for debugging the 3d code
	this.beginSwimbotRenderPhase = function() {}

	//-------------------------------------------------
	// called once during setup
	//-------------------------------------------------
	this.initialize = function ( canvas ) {
		console.log("==> Renderer initialize()  *<2D>*");
		_canvas = canvas;
		_poolRenderer.initialize( _canvas );
		_swimbotRenderer.initialize( _canvas );
		_foodBitRenderer.initialize( _canvas );
	}

	this.getPoolRenderer     = function() { return _poolRenderer; }
	this.getSwimbotRenderer  = function() { return _swimbotRenderer; }
	this.getFoodBitRenderer  = function() { return _foodBitRenderer; }

	//-------------------------------------------------
	// passed down from genePool.setCanvasDimensions
	//-------------------------------------------------
	this.setCanvasDimensions = function( w, h )
    {
        _canvasWidth  = w;
        _canvasHeight = h;
    }

	//-------------------------------------------------
	// call this once at the start of each new frame
	//-------------------------------------------------
	this.beginFrame = function ( camera )
	{
		//----------------------------------------------------------
		// set transform according to camera
		//----------------------------------------------------------
        let nx = camera.getPosition().x / camera.getXDimension();
        let ny = camera.getPosition().y / camera.getYDimension();

		let xTranslation = ( ONE_HALF - nx ) * _canvasWidth;
		let yTranslation = ( ONE_HALF - ny ) * _canvasHeight;

        let xScale = _canvasWidth  / camera.getXDimension();
        let yScale = _canvasHeight / camera.getYDimension();

		_canvas.translate( xTranslation, yTranslation );
        _canvas.scale( xScale, yScale ); 
	}

	//-------------------------------------------------
	// switch back to absolute coordinates
	//-------------------------------------------------
	this.resetCoordSystem = function () {
        _canvas.resetTransform();
	}

	//-------------------------------------------------
	// call this last at the end of each frame
	//-------------------------------------------------
	this.endFrame = function () {
	}


	//---------------------------------------------
	//	general purpose selection indicator
	//---------------------------------------------
    this.renderCircle = function( position, radius, color, lineWidth, style, doFill )
    {
        if ( doFill ) {
            _canvas.fillStyle = color.rgba();	
        } else {
            _canvas.strokeStyle = color.rgba();	
        }

		//	style zero - basic one pass
		if ( style == 0 )
		{
			_canvas.lineWidth = lineWidth;
			_canvas.beginPath();
			_canvas.arc( position.x, position.y, radius, 0, PI2, false );
			if ( doFill ) {
				_canvas.fill();
			} else {
				_canvas.stroke();
			}
		}
		//	style 1 - two pass, second skinny ring laid on top of basic ring
		if ( style == 1 )
		{
			if ( doFill ) {
				_canvas.lineWidth = lineWidth;
				_canvas.beginPath();
				_canvas.arc( position.x, position.y, radius, 0, PI2, false );
				_canvas.fill();
				_canvas.lineWidth = lineWidth * 0.4;
				_canvas.beginPath();
				_canvas.arc( position.x, position.y, radius, 0, PI2, false );
				_canvas.fill();
			}
			else {
				_canvas.lineWidth = lineWidth;
				_canvas.beginPath();
				_canvas.arc( position.x, position.y, radius, 0, PI2, false );
				_canvas.stroke();
				_canvas.lineWidth = lineWidth * 0.4;
				_canvas.beginPath();
				_canvas.arc( position.x, position.y, radius, 0, PI2, false );
				_canvas.stroke();
			}
		}

        _canvas.closePath();	
	}

	//---------------------------------------------
	//	connect two points
	//---------------------------------------------
	this.renderLine = function( pos1, pos2, color, width, rounded=false )
	{
		_canvas.strokeStyle = color.rgba();
        _canvas.lineWidth = width; 
		if (rounded) {
			_canvas.lineCap = "round";
		} else {
			_canvas.lineCap = "butt";
		}

        _canvas.moveTo( pos1.x, pos1.y );
        _canvas.lineTo( pos2.x, pos2.y );
        _canvas.stroke();

		// this addresses a bug that sometimes causes lines to be drawn with an
		// extra thin black line running from pos1 to pos2
		_canvas.beginPath();
		_canvas.closePath();
    }


	//---------------------------------------------
	//	connect two points
	//---------------------------------------------
	this.renderRect = function( x, y, width, height, color, lineWidth )
	{
        //_canvas.lineCap = "round";
        _canvas.lineWidth = lineWidth; 
        _canvas.strokeStyle = color.rgba();
        _canvas.moveTo( x,         y );
        _canvas.lineTo( x + width, y );
        _canvas.lineTo( x + width, y + height );
        _canvas.lineTo( x,         y + height );
        _canvas.lineTo( x,         y );
        _canvas.stroke();
    }

    //-------------------------------
    this.renderText = function( string, x, y, color, font )
    {
        _canvas.font = font;
        _canvas.fillStyle = color.rgba();
        _canvas.fillText( string, x, y );
    }


	//-------------------------------
	this.renderCamera = function( camera )
	{
		_canvas.strokeStyle = "rgb( 255, 255, 255 )";		
		_canvas.lineWidth = camera.getScale() * 0.007; 
		
		let spacing = 15;
		
		let x = camera.getPosition().x - camera.getXDimension() * ONE_HALF;
		let y = camera.getPosition().y - camera.getYDimension() * ONE_HALF;
		let w = camera.getXDimension();
		let h = camera.getYDimension();
		
		_canvas.strokeRect( x + spacing * ONE_HALF, y + spacing * ONE_HALF, w - spacing, h - spacing );

		_canvas.fillStyle = "rgb( 255, 255, 255 )";		
		_canvas.strokeRect
		( 
			camera.getPosition().x - camera.getXDimension() * 0.01, 
			camera.getPosition().y - camera.getYDimension() * 0.01, 0.01, 0.01
		);
    }
}
