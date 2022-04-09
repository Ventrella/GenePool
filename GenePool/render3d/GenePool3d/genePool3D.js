//	Ensure that there is a genePool3D Object containing our game interface.

// https://kripken.github.io/emscripten-site/docs/api_reference/module.html
//  "Module is also used to provide access to Emscripten API functions(for example ccall())
//  in a safe way.Any function or runtime method exported(using EXPORTED_FUNCTIONS for compiled
//  functions, or EXTRA_EXPORTED_RUNTIME_METHODS for runtime methods like ccall) will be accessible
//  on the Module object, without minification changing the name, and the optimizer will make sure
//  to keep the function present(and not remove it as unused)."

//
//	The index file loads and initializes the game by instancing the loadtime script code that we
//	define in this module, so the var name genePool3D.weInterface must be coordinated with index.html
//
//		<script type="text/javascript">
//			Module.program = new genePool3D.Program(engineInputDiv, glCanvas);
//		</script>
//
//	Note that the index passes the engineInputDiv and glCanvas elements from the index docment when
//	initializing the game.
//

var globalRenderer = null;

//	This object provides access to our GenePool specific layer of compiled .cpp code
//	that interfaces with the engine.
var globalGenepool3Dcpp = null;

var genePool3D;
(function (genePool3D) {
	var weInterface = (function ()
	{
		//	Constructor
		function weInterface(engineInputDiv, glCanvas) {
			console.log("================================= weInterface(engineInputDiv, glCanvas)");
			this.engineInputDiv = engineInputDiv;
			this.glCanvas = glCanvas;
			this.initialized = false;
			this.isPaused = false;
			this.isFreeCam = false;

			//	setup mouse pan -> originX,originY,zoom
			this.translation = { originX: 0, originY: 0, zoom: 1.0 };
			//this.mouseController = new genePool3D.MouseController(this.engineInputDiv, this);
			this.buildVer = '';
			this.frameTally = 0;

			this._globalSwimmerMeshId =   100;

			this.testFuncCnt = 100;
			this.renderNormalCnt = 0;
			this.renderSplineCnt = 0;

			//	ui testing
			this.testDownPix = [{ x: 0, y: 0 }];
			this.testUpPix = [{ x: 0, y: 0 }];
			this.testDragPix = [{ x: 0, y: 0 }];

			//	canvasContainer holds glCanvas, engineInputDiv, debug overlay, and cursor
			var container = document.getElementById('canvasContainer');
			var rect = container.getBoundingClientRect();
			this.canvasLeftOffset = rect.left;
			this.canvasTopOffset = rect.top;

			this._updateSimulation         = true;

			// setup the gui overlay
			this.engineInputDiv.style.display = 'block';	// show by default
			//this.guiContext = this.guiCanvas.getContext('2d');

			//
			this.prevCamPosX = 999999;
			this.prevCamPosY = 999999;
			this.prevCamDimX = 0;
			this.prevCamDimY = 0;

			// setup the debug text overlay
			this.textCanvas = document.getElementById('textOverlay');
			this.textCanvas.style.display = 'none';	// hide by default
			this.textContext = this.textCanvas.getContext('2d');
			this.textContext.font = '16px Arial';
			this.textContext.fillStyle = '#000000';		// text color
			this.textDisplayMode = 0;

			// setup a help dialog for controls
			this.helpCanvas = document.getElementById('helpOverlay');
			this.helpCanvas.style.display = 'none';	// hide by default
			this.helpContext = this.helpCanvas.getContext('2d');
			this.composeHelpDisplay();
			this.helpDisplayMode = 0;

			//	transitory status popup
			this.popupMsg = document.getElementById('popupMsg');
			this.popupMsg.style.width = 480;
			this.popupMsg.style.height = 40;
			this.popupMsg.style.top = 20;
			this.popupMsg.style.display = 'none';
			this.popupMsg.style.background = 'rgba(90, 90, 90, 0.0)';

			this.resizeCanvas = function () {
				if (this.initialized) {
					//	center and justify the canvas
					var container = document.getElementById("canvasContainer");
					var rect = container.getBoundingClientRect();
					this.canvasLeftOffset = rect.left;
					this.canvasTopOffset = rect.top;
					//this.glCanvas.width = window.innerWidth - (this.canvasLeftOffset * 2);
					//this.guiCanvas.width = window.innerWidth - (this.canvasLeftOffset * 2);
					//this.glCanvas.height = window.innerHeight - (this.canvasTopOffset * 2);
					//this.guiCanvas.height = window.innerHeight - (this.canvasTopOffset * 2);
					var w = window.innerWidth;
					var h = window.innerHeight;

					//	GenePool integration - size the 3D canvas to match the 2D canvas
					var canvasID = document.getElementById('Canvas');
					w = canvasID.width;
					h = canvasID.height;

					this.glCanvas.width  = w;
					this.glCanvas.height = h;
					this.engineInputDiv.width  = w;
					this.engineInputDiv.height = h;

					//console.log("<---- resizeCanvas ----> rect: l=" + rect.left + ", t=" + rect.top + ", r=" + rect.right + ", b=" + rect.bottom);
					//console.log("<----              ----> window.innerWidth = " + window.innerWidth + " : window.innerHeight = " + window.innerHeight);
					this.alfInterface.updateScreenDimensions(this.glCanvas.width, this.glCanvas.height);
				}
			};

			//	Timers
			this.setupUpdate = function () {
				// setup a timer to service the audio queue
				//var audioTimerSetup = setInterval(function () { audioTimer(); }, 33);
				//var audioTimer = function (args) { WiggleAudio.update(); }.bind(this);

				//	the status timer runs at 30fps to update dynamic data and
				//	to keep the UI and the weInterface in sync.
				var statusTimerSetup = setInterval(function () { statusTimerUpdate(); }, 33);
				var statusTimerUpdate = function (args)
				{
					this.frameTally++;

					//	update stats display
					switch (this.textDisplayMode) {
						case 0:	break;
						case 1:	this.renderStatsOverlay();	break;
						case 2:	this.renderDebugOverlay();	break;
					}

				}.bind(this);
			};

			window.addEventListener('resize', function (event) {
				this.resizeCanvas();
			}.bind(this));
		}

		//	called from onRuntimeInitialized once preloaded files are ready
		//	currently invoked from index.html
		weInterface.prototype.start = function () {

			//	Create the interface to the engine - see WiggleBindings.cpp
			this.alfInterface = new Module.AlfInterface();
			if (!this.alfInterface.initializeEngine(this.glCanvas.width, this.glCanvas.height, 1.0)) {
				//alert("ERROR: Could not initialise the WiggleEngine!");
				return;
			}

			//	Setup our JS side audio engine, which will talk directly to the Engine via AlfInterface
			//WiggleAudio.initialize(this.alfInterface);

			this.initialized = true;
			this.resizeCanvas();

			//	We instantiate the game code AFTER creating the interface. This allows us to hook up 
			//	project specific code, as opposed to the AlfInterface - which is common to all web apps.
			globalGenepool3Dcpp = new Module.GenePool3D();

			//	Have the interface initialize the code that we just installed
			this.alfInterface.initializeGame();

			//this.alfInterface.setBackgroundColor(0.0, 0.0, 0.0, 0.0);
			this.buildVer = this.alfInterface.getBuildVersion();

			this.isPaused = globalGenepool3Dcpp.isPaused();
			this.isFreeCam = globalGenepool3Dcpp.isFreeCam();

			this.resizeCanvas();
			//this.invalidate();

			this.setupUpdate();
		};



		//
		weInterface.prototype.update = function () {
			genePool.update();
		}


		//----------------------------------------------------------
		//----------------------------------------------------------
		weInterface.prototype.onKeyDown = function ( keyCode, isShiftKey, isCtrlKey, isAltKey )
		{
			//	JV GenePool ui.js is currently using the following keyCodes...
			//		37/38/39/40  : Left/Right/Up/Down
			//		61/187       : plus
			//		173/189      : minus

			//console.log("onKeyDown: code = " + keyCode + ", isShift = " + isShiftKey + ", isCtrl = " + isCtrlKey + ", isAlt = " + isAltKey );

			//	toggle pause
			//if ( keyCode === 80 ) {	// 'p' key
			//	globalGenepool3Dcpp.togglePause();
			//}


			//let pc = genePool.getPoolCenter();	//!!
			//console.log("POOL CENTER = ")			//!!


			//	toggle render
			if ( keyCode === 82 ) {	// 'r' key
				console.log("### toggle render");
			}

			//	cycle normal swimmer render
			if ( keyCode === 78 ) {	// 'n' key
				globalRenderer.getSwimbotRenderer().cycleNormalRenderMode();
			}
			//	cycle splined swimmer render
			if ( keyCode === 83 ) {	// 's' key
				globalRenderer.getSwimbotRenderer().cycleSplinedRenderMode();
			}
			//	cycle food render
			if ( keyCode === 70 ) {	// 'f' key
				globalRenderer.getFoodBitRenderer().cycleRenderMode();
			}

			//	toggle lighting
			if ( keyCode === 76 ) {	// 'l' key
				globalGenepool3Dcpp.toggleLighting();
				console.log("### toggle lighting ");
			}

			// 'o' for debug Overlay
			if ( keyCode === 79) {
				this.cycleDebugDisplay();
			}
			// 'h' for help
			if ( keyCode === 72) {
				this.cycleHelpDisplay();
			}

			//	SHIFT to override the camera zoom minimum
			if ( isShiftKey == true ) {
				genePool.getCamera().setMinZoomScale( 100.0 );
			}
		}

		weInterface.prototype.onKeyUp = function ( keyCode, isShiftKey, isCtrlKey, isAltKey )
		{
			//console.log("onKeyUp  : code = " + keyCode + ", isShift = " + isShiftKey + ", isCtrl = " + isCtrlKey + ", isAlt = " + isAltKey );

			//	SHIFT to override the camera zoom minimum
			if ( isShiftKey == false ) {
				genePool.getCamera().restoreDefaultZoomScale();
			}
		}


		weInterface.prototype.cycleDebugDisplay = function ()
		{
			var overlay = document.getElementById('textOverlay');
			this.textDisplayMode++;
			if (this.textDisplayMode == 3) this.textDisplayMode = 0;
			if (this.textDisplayMode == 0) {
				overlay.style.display = 'none';		// hide
			} else {
				overlay.style.display = 'block';	// show
			}
			//	dump to log for debug
			this.textDisplayDump = false;
			if (this.textDisplayMode == 1) {
				this.textDisplayDump = true;
			}
		}

		weInterface.prototype.cycleHelpDisplay = function ()
		{
			var overlay = document.getElementById('helpOverlay');
			this.helpDisplayMode++;
			if (this.helpDisplayMode == 2) this.helpDisplayMode = 0;
			if (this.helpDisplayMode == 0) {
				overlay.style.display = 'none';		// hide
			} else {
				//	center over pool
				let w = ( this.glCanvas.width / 2 ) + 60;
				let h =  (this.glCanvas.height / 2 );
				let l = ( this.glCanvas.width - w ) / 2;
				let t = ( this.glCanvas.height - h ) / 2;
				overlay.style.width  = w;
				overlay.style.height = h;
				overlay.style.left   = l;
				overlay.style.top    = t;
				overlay.style.display = 'block';	// show
			}
		}

		weInterface.prototype.composeHelpDisplay = function ()
		{
			this.helpCanvas.style.background = 'rgba(90, 90, 140, 0.9)';

			let fontsize = 16;
			var lineSpace = fontsize + 2;
			var texty = lineSpace;
			var textx = 12;

			//	arrgh - text is fuzzy. Need to figure out why...
			//this.helpContext.scale( 0.5, 0.5 );

			this.helpContext.font = 'bold ' + fontsize.toFixed(0) + 'px Courier';
			this.helpContext.fillStyle = '#cfcf00';		// text color

			this.helpContext.fillText( "GenePool Controls", textx, texty );
			texty += lineSpace + 2;

			fontsize = 10;
			lineSpace = fontsize + 1;
			this.helpContext.font = 'bold ' + fontsize.toFixed(0) + 'px Courier';
			this.helpContext.fillStyle = '#afaf00';		// text color

			this.helpContext.fillText( "Left/Right : pan horizontal", textx, texty );						texty += lineSpace;
			this.helpContext.fillText( "Up/Down    : pan vertical", textx, texty );							texty += lineSpace;
			this.helpContext.fillText( "+          : zoom in (hold SHIFT for close zoom)", textx, texty );	texty += lineSpace;
			this.helpContext.fillText( "-          : zoom out", textx, texty );									texty += lineSpace;
			this.helpContext.fillText( "f          : cycle foodbit render mode", textx, texty );			texty += lineSpace;
			this.helpContext.fillText( "n          : cycle normal swimmer render mode", textx, texty );		texty += lineSpace;
			this.helpContext.fillText( "s          : cycle splined swimmer render mode", textx, texty );	texty += lineSpace;
			this.helpContext.fillText( "o          : cycle stats overlay", textx, texty );					texty += lineSpace;
		}

		weInterface.prototype.displayPopupMsg = function( text, duration )
		{
			this.popupMsg.style.display = 'none';
			let popupWidth = parseFloat(this.popupMsg.style.width);
			this.popupMsg.style.left = (canvasID.width - popupWidth) / 2;
			$('#popupMsg').css({"font-family": "Arial, Helvetica, sans-serif", "font-size": 20, "color": "#e0e0e0", "text-align": "center"});
			$('#popupMsg').html( text );
			$('#popupMsg').fadeIn(200, function() { $(this).delay(duration).fadeOut(200); });
		}


		//----------------------------------------------------------
		// set transform according to camera
		//----------------------------------------------------------
		weInterface.prototype.updateCamera = function( camera )
		{
			let camPosX = camera.getPosition().x;
			let camPosY = camera.getPosition().y;
			let camDimX = camera.getXDimension();
			let camDimY = camera.getYDimension();

			if ( (camPosX!=this.prevCamPosX) || (camPosY!=this.prevCamPosY) || (camDimX!=this.prevCamDimX) || (camDimY!=this.prevCamDimY) )
			{
				this.prevCamPosX = camPosX;
				this.prevCamPosY = camPosY;
				this.prevCamDimX = camDimX;
				this.prevCamDimY = camDimY;
				//console.log("[updateCamera] pos=(" + camPosX.toFixed(2) + "," + camPosY.toFixed(2) +
				//	"), dim=(" + camDimX.toFixed(2) + "," + camDimY.toFixed(2) + ")" );

				globalGenepool3Dcpp.updateOrthoCamera( camPosX, camPosY, camDimX, camDimY );
			}
		}


		//	Render a single bit of food
		weInterface.prototype.renderFoodBit = function( foodBit, viewScale )
		{
			let bitScale  = foodBit.getSizeViewScale();
			let radius    = foodBit.getSize() + viewScale * bitScale * bitScale;
			let position  = foodBit.getPosition();
			let color     = foodBit.getColor();

			if (!("meshId" in foodBit)) {
				foodBit.meshId  = globalGenepool3Dcpp.createFoodBit( radius );
			}
			globalGenepool3Dcpp.renderFoodBit( foodBit.meshId, position.x, position.y, color.red, color.green, color.blue );
		}
		//weInterface.prototype.deleteFoodBit = function( foodBit )
		//{
		//	if ( "meshId" in foodBit )
		//	{
		//		globalGenepool3Dcpp.deleteFoodBit( foodBit.meshId );	// kill the 3D assets
		//		delete foodBit.meshId;								// remove the ID key from the js object
		//	}
		//}
		//weInterface.prototype.setAllFoodBitVisibility = function( state )
		//{
		//	globalGenepool3Dcpp.setAllFoodBitVisibility( state );
		//}
		//weInterface.prototype.setAllNormalSwimmerVisibility = function( state )
		//{
		//	globalGenepool3Dcpp.setAllNormalSwimmerVisibility( state );
		//}
		//weInterface.prototype.setAllSplinedSwimmerVisibility = function( state )
		//{
		//	globalGenepool3Dcpp.setAllSplinedSwimmerVisibility( state );
		//}
		//weInterface.prototype.deleteSwimmer = function( swimmer )
		//{
		//	if ( "meshId" in swimmer )
		//	{
		//		globalGenepool3Dcpp.deleteSwimmer( swimmer.meshId );	// kill the 3D assets
		//		delete swimmer.meshId;								// remove the ID key from the js object
		//	}
		//}


		weInterface.prototype.renderOverlayData = function ( fontsize, lines )
		{
			this.textContext.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
			this.textContext.font = 'bold ' + fontsize.toFixed(0) + 'px Courier';
			var lineSpace = fontsize + 1;
			var texty = lineSpace + 1;
			var textx = 6;

			lines.forEach( function(text, index) {
				this.textContext.fillText( text, textx, texty );
				texty += lineSpace;
			}.bind(this));
		}

		weInterface.prototype.renderDebugOverlay = function ()
		{
			var rev = 'E';
			var p, line;
			var textLines = [];
			textLines.push( 'build: ' + this.buildVer + ' rev.' + rev );

			line = 'down   : ';
			for (p = 0; p < this.testDownPix.length; p++) {
				textLine = line + this.testDownPix[p].x.toFixed(0) + ", " + this.testDownPix[p].y.toFixed(0); }
			textLines.push( line );
			line = 'drag   : ';
			for (p = 0; p < this.testDragPix.length; p++) {
				textLine = line + this.testDragPix[p].x.toFixed(0) + ", " + this.testDragPix[p].y.toFixed(0); }
			textLines.push( line );
			line = 'up     : ';
			for (p = 0; p < this.testUpPix.length; p++) {
				textLine = line + this.testUpPix[p].x.toFixed(0) + ", " + this.testUpPix[p].y.toFixed(0); }
			textLines.push( line );

			//textLines.push( 'state  : ' + this.alfInterface.getWigletBrainBodyState(0).toFixed(0) );
			//textLines.push( 'fov    : ' + this.alfInterface.getCameraFieldOfView().toFixed(4) );
			textLines.push( 'screen : ( ' + this.alfInterface.getScreenWidth().toFixed(0) + ' , ' + this.alfInterface.getScreenHeight().toFixed(0) + ' )'
				 + 'fov : ' + this.alfInterface.getCameraFieldOfView().toFixed(2) );
			textLines.push( 'gtime  : ' + this.alfInterface.getGameTime().toFixed(2) );

			textLines.push( ' ' );
			var campos = this.alfInterface.getCameraPos();
			var camyaw = this.alfInterface.getCameraYaw();
			var campit = this.alfInterface.getCameraPitch();
			textLines.push( 'cam: pos=' + campos );
			textLines.push( '     yaw= ' + camyaw.toFixed(2) + ', pit= ' + campit.toFixed(2) );

			textLines.push( ' ' );
			textLines.push( this.alfInterface.getDbgLabel(0) + ' = ' + this.alfInterface.getDbgFloat(0).toFixed(4)+ ' : ' + this.alfInterface.getDbgInt(0).toFixed(0) );
			textLines.push( this.alfInterface.getDbgLabel(1) + ' = ' + this.alfInterface.getDbgFloat(1).toFixed(4)+ ' : ' + this.alfInterface.getDbgInt(1).toFixed(0) );
			textLines.push( this.alfInterface.getDbgLabel(2) + ' = ' + this.alfInterface.getDbgFloat(2).toFixed(4)+ ' : ' + this.alfInterface.getDbgInt(2).toFixed(0) );
			textLines.push( this.alfInterface.getDbgLabel(3) + ' = ' + this.alfInterface.getDbgFloat(3).toFixed(4)+ ' : ' + this.alfInterface.getDbgInt(3).toFixed(0) );
			textLines.push( this.alfInterface.getDbgLabel(4) + ' = ' + this.alfInterface.getDbgFloat(4).toFixed(4)+ ' : ' + this.alfInterface.getDbgInt(4).toFixed(0) );
			this.renderOverlayData( 12, textLines );

			//var camPos = this.alfInterface.getCameraPos();
			//this.textContext.fillText("campos : (" + camPos.x.toFixed(2) + ", " + camPos.y.toFixed(2) + ", " + camPos.z.toFixed(2) + ")", textx, texty); texty += 20;
			//var hangle = this.alfInterface.getCameraHangle();
			//var vangle = this.alfInterface.getCameraVangle();
			//this.textContext.fillText("camHorz: " + hangle.toFixed(2) + ", vert: " + vangle.toFixed(2), textx, texty); texty += 20;
			//this.textContext.fillText("guiCanvas: " + this.guiCanvas.width.toFixed(0) + ", " + this.guiCanvas.height.toFixed(0), textx, texty);

			//	Pixel pick test
			//var pos = new Module.Vec3( 0, 0, 0 );
			//var pix = new Module.Pixel( 0, 0 );
			//pix = this.alfInterface.project3DPositionToPixel(pos);
			//console.log("(" + pos.x + "," + pos.y + "," + pos.z + ") -> (" + pix.x + "," + pix.y + ")");
			//delete pos, pix;
		}

		weInterface.prototype.renderStatsOverlay = function ()
		{
			var stats = this.alfInterface.getRenderStats();
			var textLines = [];

			textLines.push( 'frame : cnt=' + stats.totalFramesRendered.toFixed(0).padStart(10));
			textLines.push( '  meshes    : built=' + stats.meshesBuilt.toFixed(0).padStart(4) + ' rndrd=' + stats.meshesRendered.toFixed(0).padStart(8));
			textLines.push( '  meshes    : instn=' + stats.meshesInstanced.toFixed(0).padStart(4) + ' hiddn=' + stats.meshesHidden.toFixed(0).padStart(8));
			textLines.push( '  vertices  : built=' + stats.vertsBuilt.toFixed(0).padStart(4) + ' rndrd=' + stats.vertsRendered.toFixed(0).padStart(8));
			textLines.push( '  untxr tri : built=' + stats.untexturedTrisBuilt.toFixed(0).padStart(4) + ' rndrd=' + stats.untexturedTrisRendered.toFixed(0).padStart(8));
			textLines.push( '  txtrd tri : built=' + stats.texturedTrisBuilt.toFixed(0).padStart(4) + ' rndrd=' + stats.texturedTrisRendered.toFixed(0).padStart(8));
			textLines.push( '  matrices  : cmpsd=' + stats.matricesComposed.toFixed(0).padStart(6) + ' decom=' + stats.matricesDecomposed.toFixed(0).padStart(6));
			textLines.push( '  nodes     : tree =' + stats.nodesVisited.toFixed(0).padStart(6));
			textLines.push( 'total built' );
			textLines.push( '  meshes    : built=' + stats.totalMeshesBuilt.toFixed(0).padStart(8) + ' deltd=' + stats.totalMeshesDeleted.toFixed(0).padStart(4));
			textLines.push( '  verts     : built=' + stats.totalVertsBuilt.toFixed(0).padStart(8));
			textLines.push( '  triangles : untxr=' + stats.totalUntexturedTrisBuilt.toFixed(0).padStart(8) + ' txtrd=' + stats.totalTexturedTrisBuilt.toFixed(0).padStart(4));
			textLines.push( 'memory' );
			textLines.push( '  attr      : ' + stats.attribBuffMem.toFixed(0).padStart(10) + '  heap: ' + stats.heapEstimate.toFixed(0).padStart(4));
			this.renderOverlayData( 12, textLines );

			//	dump to console log
			if (this.textDisplayDump == true) {
				console.log( 'framecnt=' + stats.totalFramesRendered.toFixed(0).padStart(10) + ',  nodes=' + stats.nodesVisited.toFixed(0).padStart(6));
				console.log( '  frame meshes    : built=' + stats.meshesBuilt.toFixed(0).padStart(10)              + ' rndrd=' + stats.meshesRendered.toFixed(0).padStart(10));
				console.log( '  frame meshes    : instn=' + stats.meshesInstanced.toFixed(0).padStart(10)          + ' hiddn=' + stats.meshesHidden.toFixed(0).padStart(10));
				console.log( '  frame vertices  : built=' + stats.vertsBuilt.toFixed(0).padStart(10)               + ' rndrd=' + stats.vertsRendered.toFixed(0).padStart(10));
				console.log( '  frame untxr tri : built=' + stats.untexturedTrisBuilt.toFixed(0).padStart(10)      + ' rndrd=' + stats.untexturedTrisRendered.toFixed(0).padStart(10));
				console.log( '  frame txtrd tri : built=' + stats.texturedTrisBuilt.toFixed(0).padStart(10)        + ' rndrd=' + stats.texturedTrisRendered.toFixed(0).padStart(10));
				console.log( '  frame matrices  : cmpsd=' + stats.matricesComposed.toFixed(0).padStart(10)         + ' decom=' + stats.matricesDecomposed.toFixed(0).padStart(10));
				console.log( '  total meshes    : built=' + stats.totalMeshesBuilt.toFixed(0).padStart(10)         + ' deltd=' + stats.totalMeshesDeleted.toFixed(0).padStart(10));
				console.log( '  total verts     : built=' + stats.totalVertsBuilt.toFixed(0).padStart(10));
				console.log( '  total triangles : untxr=' + stats.totalUntexturedTrisBuilt.toFixed(0).padStart(10) + ' txtrd=' + stats.totalTexturedTrisBuilt.toFixed(0).padStart(10));
				console.log( '  attr mem  : ' + stats.attribBuffMem.toFixed(0).padStart(10) + '  heap: ' + stats.heapEstimate.toFixed(0).padStart(4));
				this.textDisplayDump = false;
			}

			delete stats;
		}

		return weInterface;
    }());
	genePool3D.weInterface = weInterface;
})(genePool3D || (genePool3D = {}));
