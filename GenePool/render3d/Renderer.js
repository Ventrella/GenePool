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
	console.log("=========> configureRenderer() : 3D");
	var body = document.getElementsByTagName("body")[0];

	function webgl_support() {
		try {
			var elem = document.createElement('canvas');
			return !!window.WebGLRenderingContext && (!!elem.getContext('webgl') || !!elem.getContext('webgl2') || !!elem.getContext('experimental-webgl'));
		} catch (e) {
			return false;
		}
	};

	//	Check for WebGL support
	if ( !webgl_support() )
	{
		//	Create the error dialog box
		var errDialog = document.createElement("div");
		errDialog.id = 'webGlErrorDialog';
		errDialog.title = 'WebGL Error!';
		errDialog.style = 'display: block';
		errDialog.innerHTML = "<p> \
				So So Sorry! Your web browser doesn't appear to support WebGL, \
				which is the technology that this webpage uses for generating 3D graphics.<br><br> \
				This code was developed primarily in the Chrome browser. \
				</p>";

		body.appendChild(errDialog);
		$("#webGlErrorDialog").dialog();
	}

	//	patch the z priority of the original genepool 2d canvas
	var genePoolCanvas = document.getElementById('Canvas');
	var offsets = genePoolCanvas.getBoundingClientRect();

	//
	//	Setup our div/canvas layers
	//
	var canvasContainer = document.createElement('div');
	canvasContainer.id    ="canvasContainer";
	canvasContainer.style = genePoolCanvas.style;
	//canvasContainer.style ="position: absolute; left: " + offsets.left + "px; top: " + offsets.top + "px; width: " + offsets.width + "; height: " + offsets.height + ";";
	//canvasContainer.style ="position: absolute; left: 0px; top: 0px; width:100%; height:100%;";
	body.appendChild(canvasContainer);

	canvasContainer.style.width = 200;
	canvasContainer.style.height = 250;

	//	textOverlay (debug info)
	var textOverlay = document.createElement('canvas');
	textOverlay.id     = "textOverlay";
	textOverlay.width  = 330;
	textOverlay.height = 200;
	textOverlay.style  = "position: fixed; left: 10px; bottom: 20px; background-color: rgba(90, 90, 90, 0.8); display: none";
	canvasContainer.appendChild(textOverlay);

	//	help dialog overlay
	var helpOverlay = document.createElement('div');
	helpOverlay.id = "helpOverlay";
	canvasContainer.appendChild(helpOverlay);

	//	transitory status popup
	var popupMsg = document.createElement('div');
	popupMsg.id  = "popupMsg";
	popupMsg.style  = "position: absolute; background-color: rgba(90, 90, 90, 0.9); display: none";
	canvasContainer.appendChild(popupMsg);

	//	debug info popup
	var debugMsg = document.createElement('div');
	debugMsg.id  = "debugMsg";
	debugMsg.style  = "position: absolute; background-color: rgba(90, 90, 90, 0.9); display: none";
	canvasContainer.appendChild(debugMsg);

	//	webGl output (3D)
	var glDiv = document.createElement('div');
	glDiv.id    = 'glDiv';
	glDiv.class = 'fullsize';
	glDiv.style = 'background-color: rgba(0, 0, 0, 0.0)';
	canvasContainer.appendChild(glDiv);
	var glCanvas = document.createElement('canvas');
	glCanvas.id = 'glCanvas';
	glDiv.appendChild(glCanvas);


	// engineInputDiv / d3uiDiv (nested for proper input event handling)
	var engineInputDiv   = document.createElement('div');
	engineInputDiv.id    = 'engineInputDiv';
	engineInputDiv.class = 'fullsize';
	canvasContainer.appendChild(engineInputDiv);
	var d3uiDiv = document.createElement('div');
	d3uiDiv.id = 'd3uiDiv';
	engineInputDiv.appendChild(d3uiDiv);

	//	z-index layers - higher numbers are on top of lower numbers
	//	NOTE: Can't seem to get 3d glCanvas to draw in front of genePool's default 2d canvas
	genePoolCanvas.style.zIndex = "2";
	glCanvas.style.zIndex       = "3";
	glDiv.style.zIndex          = "4";
	engineInputDiv.style.zIndex = "4";
	textOverlay.style.zIndex    = "7";
	helpOverlay.style.zIndex    = "8";
	popupMsg.style.zIndex       = "9";
	debugMsg.style.zIndex       = "9";

	//	make it easier to toggle display in Chrome elements panel
	genePoolCanvas.style.display = 'block';

	//	start setting up the engine
	//var glCanvas = document.getElementById("glCanvas");
	var engineInputDiv = document.getElementById("engineInputDiv");
	glCanvas.width = window.innerWidth;
	engineInputDiv.width = window.innerWidth;


	//	The 'Module' object postpones initialization until the preloaded files are ready, which avoids a
	//	"you need to wait for the runtime to be ready (e.g. wait for main() to be called" error.
	//	See https://kripken.github.io/emscripten-site/docs/getting_started/FAQ.html
	//	When the game module (sandbox.js) loads, it will install itself into Module for launching
	//	once external files are loaded.
	window.Module = {};

	Module['onRuntimeInitialized'] = function() {
		if (webgl_support()) {
			console.log('===== Runtime initialized: genePool3D.start()...');
			//Module['program'].start();
			genePool3D.start();
		}
	}

	//show Emscripten environment where the canvas is
	Module.canvas = glCanvas;

	//	this allows us to put the emscripten files somewhere other than the root
	Module['locateFile'] = function(path, prefix) {
		//console.log("[Module[locateFile]] path=" + path + ", prefix=" + prefix);
		prefix = 'render3d/GenePool3d/';
		return prefix + path;
	}

	//	Instanciate the 3D renderer and store it in the Module
	genePool3D = new genePool3D.weInterface(engineInputDiv, glCanvas);

	//	Now that the Module is setup we can load the compiled emscipten engine
	$.getScript("render3d/GenePool3d/genepool_app.js");
}


//-------------------------------------------------------------
//
//-------------------------------------------------------------
function Renderer()
{
	let _poolRenderer		= new PoolRenderer();
	let _swimbotRenderer	= new SwimbotRenderer(); 
	let _foodBitRenderer	= new FoodBitRenderer(); 

	let _canvas				= null;
	let _canvasWidth		= 0;
	let _canvasHeight		= 0;
	let _simulationRunning	= false;

	//	The 3D engine generates it's own timer and will be responsible
	//	for calling the main genePool.update() function.
	this.useExternalUpdate = function () {
		return true;
	}

	this.is3dRender = function () {
		return true;
	}

	//
	//	Renderers can support their own set of debug modes tied to key events.
	//
	this.handleRenderSpecificKeyDown = function( keyCode, isShiftKey, isCtrlKey, isAltKey )
	{
		genePool3D.onKeyDown( keyCode, isShiftKey, isCtrlKey, isAltKey );
	}
	this.handleRenderSpecificKeyUp = function( keyCode, isShiftKey, isCtrlKey, isAltKey )
	{
		genePool3D.onKeyUp( keyCode, isShiftKey, isCtrlKey, isAltKey );
	}

	//	The renderer uses 'simulationRunning' status to manage visual debug objects
	this.setSimulationRunning = function( s )
	{
		_simulationRunning = s;
		_swimbotRenderer.setSimulationRunning( s );
	}

	//-------------------------------------------------
	// called once during setup
	//-------------------------------------------------
	this.initialize = function ( canvas )
	{
		console.log("==> Renderer initialize()  *<3D>*");

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
		// update the 2d canvas set transform according to camera
		//----------------------------------------------------------
		let nx = camera.getPosition().x / camera.getXDimension();
		let ny = camera.getPosition().y / camera.getYDimension();
		let xTranslation = ( ONE_HALF - nx ) * _canvasWidth;
		let yTranslation = ( ONE_HALF - ny ) * _canvasHeight;
		let xScale = _canvasWidth  / camera.getXDimension();
		let yScale = _canvasHeight / camera.getYDimension();
		_canvas.translate( xTranslation, yTranslation );
		_canvas.scale( xScale, yScale ); 

		// update 3D camera
		genePool3D.updateCamera( camera );

		//	for 3d debug purposes
		_swimbotRenderer.beginFrame();
	}

	//-------------------------------------------------
	//	Useful hook for debugging the 3d code
	//-------------------------------------------------
	this.beginSwimbotRenderPhase = function() {
		_swimbotRenderer.beginSwimbotRenderPhase();
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
		//	for 3d debug purposes
		_swimbotRenderer.endFrame();
	}

	//=======================================================================================================================
	//	Non-specific render helpers
	//=======================================================================================================================

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
