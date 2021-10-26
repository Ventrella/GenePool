"use strict";

function SwimbotRenderer()
{

var    flopperX = 0;
var    flopperY = 0;
var    flopperXV = 0;
var    flopperYV = 0;
    
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


	//--------------------------------
	// variables
	//--------------------------------
	let _colorUtility   = new Color();
	let _phenotype      = new Phenotype(); 
	let _growthScale    = ZERO;
	let _focusDirection = new Vector2D();
	let _brain          = new Brain();
	let _age            = 1000;
	let _energy         = ZERO;
	let _splineFactor   = ZERO;
	let _renderingGenitalsAndMouths = false;

	//----------------------------------------------------
	// get part parent position
	//----------------------------------------------------
	this.getPartParentPosition = function(p)
	{
		if ( _phenotype.parts[p].parent == NULL_PART )
		{
			return _phenotype.parts[0].position;
		}

		return _phenotype.parts[ _phenotype.parts[p].parent ].position;
	}


	//-------------------------------------------
	// set rendering goals
	//-------------------------------------------
	this.setRenderingGoals = function( r )
	{	
	    _renderingGenitalsAndMouths = r;
    }


	//-----------------------
	// render
	//-----------------------
	this.render = function
	( 
	    phenotype, 
	    brain, 
	    age,
	    energy,
	    growthScale, 
	    focusDirection, 
	    levelOfDetail 
	)
	{
    	_phenotype      = phenotype;
    	_brain          = brain;
    	_age            = age;
    	_energy         = energy;
    	_growthScale    = growthScale;
    	_focusDirection = focusDirection;
        
		if ( levelOfDetail == SWIMBOT_LEVEL_OF_DETAIL_DOT )
		{
		    let p = 1;

            _colorUtility = this.calculatePartColor(p);  
            
            let red   = Math.floor( _colorUtility.red   * 255 );
            let green = Math.floor( _colorUtility.green * 255 );
            let blue  = Math.floor( _colorUtility.blue  * 255 );

			canvas.fillStyle = "rgb( " + red + ", " + green + ", " + blue + " )";	
		    
            canvas.beginPath();
            canvas.arc( _phenotype.parts[p].position.x, _phenotype.parts[p].position.y, SWIMBOT_DOT_RENDER_RADIUS, 0, PI2, false );
            canvas.fill();
            canvas.closePath();	    
        }
		else if ( levelOfDetail == SWIMBOT_LEVEL_OF_DETAIL_LOW )
		{
			for (let p=1; p<_phenotype.numParts; p++)
			{
				let parentPosition = this.getPartParentPosition(p);
                
				_colorUtility = this.calculatePartColor(p);  
                let red   = Math.floor( _colorUtility.red   * 255 );
                let green = Math.floor( _colorUtility.green * 255 );
                let blue  = Math.floor( _colorUtility.blue  * 255 );

				canvas.strokeStyle = "rgb( " + red + ", " + green + ", " + blue + " )";	
				canvas.lineWidth = _phenotype.parts[p].width * 2.0; 

				canvas.beginPath();
				canvas.moveTo( parentPosition.x, parentPosition.y );
				canvas.lineTo( _phenotype.parts[p].position.x, _phenotype.parts[p].position.y );
				canvas.closePath();
				canvas.stroke();
			}	
		}
		else if ( levelOfDetail == SWIMBOT_LEVEL_OF_DETAIL_HIGH )
		{ 
			for (let p=1; p<_phenotype.numParts; p++)
			{
				if ( _phenotype.parts[p].length > ZERO )
				{
                    //--------------------------------------------
                    // render the part
                    //--------------------------------------------
				    
				    /*
                    if ( _phenotype.parts[p].splined )
                    {
                        _splineFactor = DEFAULT_SPLINE_FACTOR; 		
                    }
                    else
                    {
                        _splineFactor = 0.0;		
                    }

                    this.renderPartSplined(p);                    
                    */
                    

                    _splineFactor = DEFAULT_SPLINE_FACTOR; 	

                    if ( _phenotype.parts[p].splined )
                    {
                        this.renderPartSplined(p);
                    }
                    else
                    {
                        this.renderPartNormal(p);
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
                                this.renderMouth();
                            }		
                        }
                    }			
					
					
				
/*
//testing floppy thing		
if ( _index === 0 )
{
    if ( p === 4 )
    {
        let xDiff = parentPosition.x - flopperX;
        let yDiff = parentPosition.y - flopperY;

        let length = Math.sqrt( xDiff * xDiff + yDiff * yDiff );
        
        let xDir = xDiff / length;
        let yDir = yDiff / length;
        
        let idealLength = 30.0;
        let lengthDiff = length - idealLength;
        
        let xForce = xDir * lengthDiff * 0.8;
        let yForce = yDir * lengthDiff * 0.8;

        flopperXV += xForce;
        flopperYV += yForce;

        flopperX += xForce;
        flopperY += yForce;

        flopperX += flopperXV;
        flopperY += flopperYV;
        
        flopperXV *= 0.99;
        flopperYV *= 0.99;

        canvas.fillStyle = "rgb( 200, 100, 100 )";	
        canvas.beginPath();
        canvas.moveTo( parentPosition.x, parentPosition.y );
        canvas.lineTo( flopperX, flopperY );
        canvas.lineTo( position.x, position.y );
        canvas.closePath();
        canvas.fill();
    }					
}					
*/

                    /*
					//------------------------------------------
					// show part mid position 
					//------------------------------------------
					canvas.fillStyle = "rgb( 244, 244, 244 )";	
					canvas.beginPath();
					canvas.arc( _phenotype.parts[p].midPosition.x, _phenotype.parts[p].midPosition.y, 0.05, 0, PI2, false );
					canvas.fill();
					canvas.closePath();	
					

					//------------------------------------------
					// show part velocity
					//------------------------------------------
					let scale = 12.0;
					canvas.strokeStyle = "rgb( 255, 255, 0 )";	
					canvas.beginPath();
					canvas.moveTo( _phenotype.parts[p].midPosition.x, _phenotype.parts[p].midPosition.y );
                    canvas.lineTo( _phenotype.parts[p].midPosition.x - _phenotype.parts[p].velocity.x * scale, _phenotype.parts[p].midPosition.y - _phenotype.parts[p].velocity.y * scale );
                    
                    // just show displacement of mid position
                    //canvas.lineTo( _phenotype.parts[p].previousMid.x, _phenotype.parts[p].previousMid.y );
					canvas.stroke();
					canvas.closePath();	

					//------------------------------------------
					// show part perpendicular
					//------------------------------------------
					scale = 10.0;
					canvas.strokeStyle = "rgb( 0, 255, 0 )";	
					canvas.beginPath();
					canvas.moveTo( _phenotype.parts[p].midPosition.x, _phenotype.parts[p].midPosition.y );
					canvas.lineTo( _phenotype.parts[p].midPosition.x + _phenotype.parts[p].perpendicular.x * scale, _phenotype.parts[p].midPosition.y + _phenotype.parts[p].perpendicular.y * scale );
					canvas.stroke();
					canvas.closePath();	
					*/
				}
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
                this.renderGenital();
            }
        }

	}// render funtion




	//-----------------------------------
	// render part normal (not splined)
	//-----------------------------------
	this.renderPartNormal = function(p)
	{			
        let width           = _phenotype.parts[p].width;
        let position 		= _phenotype.parts[p].position;
        let parentPosition  = this.getPartParentPosition(p);
        
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

        let x0 = parentPosition.x - pp1x;
        let y0 = parentPosition.y - pp1y;

        let x1 = parentPosition.x + pp1x;
        let y1 = parentPosition.y + pp1y;

        let x2 = position.x + pp0x;
        let y2 = position.y + pp0y;

        let x3 = position.x - pp0x;
        let y3 = position.y - pp0y;		
    
        _colorUtility = this.calculatePartColor(p);
        let red   = Math.floor( _colorUtility.red   * 255 );
        let green = Math.floor( _colorUtility.green * 255 );
        let blue  = Math.floor( _colorUtility.blue  * 255 );

        canvas.fillStyle = "rgb( " + red + ", " + green + ", " + blue + " )";	

        canvas.beginPath();
        canvas.moveTo( x0, y0 );
        canvas.lineTo( x1, y1 );
        canvas.lineTo( x2, y2 );
        canvas.lineTo( x3, y3 );
        canvas.closePath();
        canvas.fill();
        
        let radius = width;

        canvas.beginPath();
        canvas.arc( position.x, position.y, radius, 0, PI2, false );
        canvas.fill();
        canvas.closePath();	

        canvas.beginPath();
        canvas.arc( parentPosition.x, parentPosition.y, radius, 0, PI2, false );								
        canvas.fill();
        canvas.closePath();	

        //--------------------------------
        // outline
        //--------------------------------
        canvas.lineWidth = 1.0; 
        canvas.strokeStyle = OUTLINE_COLOR

        let radian = _phenotype.parts[p].currentAngle * PI_OVER_180;

        canvas.beginPath();
        canvas.arc( parentPosition.x, parentPosition.y, radius, Math.PI - radian, Math.PI - radian + Math.PI, false );
        canvas.stroke();
        canvas.closePath();	    

        canvas.beginPath();
        canvas.moveTo( x1, y1 );
        canvas.lineTo( x2, y2 );
        canvas.arc( position.x, position.y, radius, -radian, -radian + Math.PI, false );
        canvas.moveTo( x0, y0 );
        canvas.lineTo( x3, y3 );
        canvas.stroke();
        canvas.closePath();	
    }






	//------------------------------------
	// render part splined 
	//------------------------------------
	this.renderPartSplined = function(p)
	{
	    let parentIndex     = _phenotype.parts[p].parent;
        let position 		= _phenotype.parts[p].position;
        let parentPosition  = this.getPartParentPosition(p);
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
        let startLeftX      = parentPosition.x  - perpStartX;
        let startLeftY      = parentPosition.y  - perpStartY;
        let startRightX     = parentPosition.x  + perpStartX;
        let startRightY     = parentPosition.y  + perpStartY;
        let control1X       = parentPosition.x                  + control1VectorX;
        let control1Y       = parentPosition.y                  + control1VectorY;
        let control1LeftX   = parentPosition.x  - perpStartX    + control1VectorX;
        let control1LeftY   = parentPosition.y  - perpStartY    + control1VectorY;
        let control1RightX  = parentPosition.x  + perpStartX    + control1VectorX;
        let control1RightY  = parentPosition.y  + perpStartY    + control1VectorY;

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
        let red   = Math.floor( _colorUtility.red   * 255 );
        let green = Math.floor( _colorUtility.green * 255 );
        let blue  = Math.floor( _colorUtility.blue  * 255 );

        canvas.fillStyle = "rgb( " + red + ", " + green + ", " + blue + " )";	
        canvas.strokeStyle = OUTLINE_COLOR;


        //---------------------------------------
        // the beginning of a series of parts
        //---------------------------------------
        if ( p === 1 )
        {
            canvas.beginPath();
            canvas.arc( _phenotype.parts[ parentIndex ].position.x, _phenotype.parts[ parentIndex ].position.y, width, 0, PI2, false );
            canvas.fill();
            canvas.closePath();	
            
            let radian = _phenotype.parts[ parentIndex ].currentAngle * PI_OVER_180;
            
            canvas.beginPath();
            canvas.arc
            ( 
                _phenotype.parts[ parentIndex ].position.x, 
                _phenotype.parts[ parentIndex ].position.y, 
                width, 
                
                Math.PI - radian, 
                Math.PI - radian + Math.PI, 
                
                false 
            );
            
            canvas.stroke();
            canvas.closePath();	    
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

            canvas.beginPath();
            canvas.moveTo( startx, starty );
            canvas.bezierCurveTo( c1x, c1y, c2x, c2y, endx, endy );
            canvas.closePath();	    
            canvas.fill();

            canvas.moveTo( startx, starty );
            canvas.bezierCurveTo( c1x, c1y, c2x, c2y, endx, endy );
            canvas.stroke();

            /*
            canvas.fillStyle = "rgb( 255, 255, 0 )";
            canvas.beginPath();
            canvas.arc( startx, starty, 1.5, 0, PI2, false );
            canvas.fill();
            canvas.closePath();	    

            canvas.fillStyle = "rgb( 255, 255, 0 )";
            canvas.beginPath();
            canvas.arc( endx, endy, 1.5, 0, PI2, false );
            canvas.fill();
            canvas.closePath();	    

            canvas.fillStyle = "rgb( 255, 0, 0 )";
            canvas.beginPath();
            canvas.arc( c1x, c1y, 0.5, 0, PI2, false );
            canvas.fill();
            canvas.closePath();	    

            canvas.fillStyle = "rgb( 255, 0, 0 )";
            canvas.beginPath();
            canvas.arc( c2x, c2y, 0.5, 0, PI2, false );
            canvas.fill();
            canvas.closePath();	    
            */


            /*
            canvas.beginPath();
            canvas.arc( position.x, position.y, width, 0, PI2, false );
            canvas.fill();
            canvas.closePath();	
            
            let radian = ( _phenotype.parts[p].currentAngle + 180 ) * PI_OVER_180;
            
            canvas.beginPath();
            canvas.arc( position.x, position.y, width, Math.PI - radian, Math.PI - radian + Math.PI, false );
            canvas.stroke();
            canvas.closePath();	 
            */
             
        }
        
        //---------------------------------------
        // fill interior
        //---------------------------------------
        canvas.beginPath();
        canvas.moveTo( startLeftX, startLeftY );
        canvas.bezierCurveTo( control1LeftX, control1LeftY, control2LeftX, control2LeftY, endLeftX, endLeftY );
        canvas.lineTo( endRightX, endRightY );
        canvas.bezierCurveTo( control2RightX, control2RightY, control1RightX, control1RightY, startRightX, startRightY );
        canvas.lineTo( startLeftX, startLeftY );
        canvas.closePath();	    
        canvas.fill();	

        canvas.beginPath();
        canvas.arc( parentPosition.x, parentPosition.y, parentWidth * 0.9, 0, PI2, false );								
        canvas.fill();
        canvas.closePath();	

        //---------------------------------------
        // draw outline
        //---------------------------------------
        canvas.lineWidth = 1.0;       	
        canvas.beginPath();
        canvas.moveTo( startLeftX, startLeftY );
        canvas.bezierCurveTo( control1LeftX, control1LeftY, control2LeftX, control2LeftY, endLeftX, endLeftY );
        canvas.moveTo( endRightX, endRightY );
        canvas.bezierCurveTo( control2RightX, control2RightY, control1RightX, control1RightY, startRightX, startRightY );
        canvas.stroke();								
        canvas.closePath();	



        /*
        canvas.fillStyle = "rgb( 0, 0, 0 )";
        canvas.beginPath();
        canvas.arc( position.x, position.y, 1.0, 0, PI2, false );
        canvas.fill();
        canvas.closePath();	    

        canvas.fillStyle = "rgb( 0, 0, 0 )";
        canvas.beginPath();
        canvas.arc( parentPosition.x, parentPosition.y, 1.0, 0, PI2, false );
        canvas.fill();
        canvas.closePath();	    
        */


        /*
        canvas.lineWidth = 0.5; 

        canvas.strokeStyle = "rgb( 255, 255, 255 )";
        canvas.beginPath();
        canvas.arc( startLeftX, startLeftY, 1.0, 0, PI2, false );
        canvas.stroke();
        canvas.closePath();	   					

        canvas.strokeStyle = "rgb( 255, 255, 255 )";
        canvas.beginPath();
        canvas.arc( startRightX, startRightY, 1.0, 0, PI2, false );
        canvas.stroke();
        canvas.closePath();	   					

        canvas.strokeStyle = "rgb( 255, 255, 255 )";
        canvas.beginPath();
        canvas.arc( endLeftX, endLeftY, 1.0, 0, PI2, false );
        canvas.stroke();
        canvas.closePath();	   					

        canvas.strokeStyle = "rgb( 255, 255, 255 )";
        canvas.beginPath();
        canvas.arc( endRightX, endRightY, 1.0, 0, PI2, false );
        canvas.stroke();
        canvas.closePath();	   					
        */


        /*
        canvas.fillStyle = "rgb( 255, 0, 255 )";
        canvas.beginPath();
        canvas.arc( control1X, control1Y, 0.5, 0, PI2, false );
        canvas.fill();
        canvas.closePath();	    

        canvas.fillStyle = "rgb( 255, 0, 255 )";
        canvas.beginPath();
        canvas.arc( control2X, control2Y, 0.5, 0, PI2, false );
        canvas.fill();
        canvas.closePath();	    

        canvas.fillStyle = "rgb( 255, 255, 0 )";
        canvas.beginPath();
        canvas.arc( control1LeftX, control1LeftY, 0.5, 0, PI2, false );
        canvas.fill();
        canvas.closePath();	    

        canvas.fillStyle = "rgb( 255, 255, 255 )";
        canvas.beginPath();
        canvas.arc( control1RightX, control1RightY, 0.5, 0, PI2, false );
        canvas.fill();
        canvas.closePath();	   					

        canvas.fillStyle = "rgb( 255, 255, 0 )";
        canvas.beginPath();
        canvas.arc( control2LeftX, control2LeftY, 0.5, 0, PI2, false );
        canvas.fill();
        canvas.closePath();	    

        canvas.fillStyle = "rgb( 255, 255, 255 )";
        canvas.beginPath();
        canvas.arc( control2RightX, control2RightY, 0.5, 0, PI2, false );
        canvas.fill();
        canvas.closePath();	   					
        */



        /*
        canvas.lineWidth = 0.5; 
        canvas.strokeStyle = "rgba( 100, 255, 100, 0.9 )";
        canvas.beginPath();
        canvas.moveTo( parentPosition.x, parentPosition.y );
        canvas.bezierCurveTo( control1X, control1Y, control2X, control2Y, position.x, position.y );
        canvas.stroke();								


        canvas.lineWidth = 0.5; 
        canvas.strokeStyle = "rgba( 100, 255, 100, 0.9 )";
        canvas.beginPath();
        canvas.moveTo( startLeftX, startLeftY );
        canvas.bezierCurveTo( control1LeftX, control1LeftY, control2LeftX, control2LeftY, endLeftX, endLeftY );
        canvas.stroke();								

        canvas.lineWidth = 0.5; 
        canvas.strokeStyle = "rgba( 100, 255, 100, 0.9 )";
        canvas.beginPath();
        canvas.moveTo( startRightX, startRightY );
        canvas.bezierCurveTo( control1RightX, control1RightY, control2RightX, control2RightY, endRightX, endRightY );
        canvas.stroke();								
        */

        // show main axis
        /*
        canvas.lineWidth = 0.5; 
        canvas.strokeStyle = "rgba( 100, 100, 200, 0.6 )";
        canvas.beginPath();
        canvas.moveTo( parentPosition.x, parentPosition.y );
        canvas.lineTo( position.x, position.y );
        canvas.stroke();								
        */


        // show block outline
        /*
        canvas.lineWidth = 0.5; 
        canvas.strokeStyle = "rgba( 100, 0, 0, 0.6 )";
        canvas.beginPath();
        canvas.moveTo( startLeftX, startLeftY );
        canvas.lineTo( startRightX, startRightY );
        canvas.stroke();								

        canvas.lineWidth = 0.5; 
        canvas.strokeStyle = "rgba( 100, 0, 0, 0.6 )";
        canvas.beginPath();
        canvas.moveTo( startRightX, startRightY );
        canvas.lineTo( endRightX,   endRightY   );
        canvas.stroke();								

        canvas.lineWidth = 0.5; 
        canvas.strokeStyle = "rgba( 100, 0, 0, 0.6 )";
        canvas.beginPath();
        canvas.moveTo( endRightX,   endRightY   );
        canvas.lineTo( endLeftX,    endLeftY    );
        canvas.stroke();								

        canvas.lineWidth = 0.5; 
        canvas.strokeStyle = "rgba( 100, 0, 0, 0.6 )";
        canvas.beginPath();
        canvas.moveTo( endLeftX,    endLeftY   );
        canvas.lineTo( startLeftX,  startLeftY  );
        canvas.stroke();								
        */
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




    
	//--------------------------------
	// render genital
	//--------------------------------
	this.renderGenital = function()
	{	
        let genitalLength = SWIMBOT_GENITAL_LENGTH * _growthScale;
        
        let x = _phenotype.parts[ GENITAL_INDEX ].position.x + _focusDirection.x * genitalLength;
        let y = _phenotype.parts[ GENITAL_INDEX ].position.y + _focusDirection.y * genitalLength;
        
		canvas.lineWidth = 1.0; 
        canvas.strokeStyle = "rgba( 255, 255, 255, 0.7 )";	
        canvas.beginPath();
        canvas.moveTo( _phenotype.parts[ GENITAL_INDEX ].position.x, _phenotype.parts[ GENITAL_INDEX ].position.y );
        canvas.lineTo( x, y );
        canvas.stroke();
        canvas.closePath();			
        
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
            
            canvas.beginPath();
            canvas.moveTo( xLeft, yLeft );
            canvas.lineTo( x, y );
            canvas.lineTo( xRight, yRight );
            canvas.stroke();
            canvas.closePath();			
        }
	}





	//--------------------------------
	// render mouth
	//--------------------------------
	this.renderMouth = function()
	{		    
// older version	
/*
let mouthLength = SWIMBOT_MOUTH_LENGTH * _growthScale;
let mouthEndX = _phenotype.parts[ MOUTH_INDEX ].position.x + _focusDirection.x * mouthLength;
let mouthEndY = _phenotype.parts[ MOUTH_INDEX ].position.y + _focusDirection.y * mouthLength;

canvas.lineWidth = SWIMBOT_MOUTH_WIDTH; 
canvas.strokeStyle = "rgb( 50, 200, 50 )";	

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

    canvas.beginPath();            
    canvas.moveTo( leftJawX,  leftJawY  );
    canvas.lineTo( _phenotype.parts[ MOUTH_INDEX ].position.x, _phenotype.parts[ MOUTH_INDEX ].position.y );
    canvas.lineTo( rightJawX, rightJawY );
    canvas.stroke();
    canvas.closePath();		
}
else
{
    canvas.beginPath();
    canvas.moveTo( _phenotype.parts[ MOUTH_INDEX ].position.x, _phenotype.parts[ MOUTH_INDEX ].position.y );
    canvas.lineTo( mouthEndX, mouthEndY );
    canvas.stroke();
    canvas.closePath();						
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
            
		canvas.lineWidth = SWIMBOT_MOUTH_WIDTH; 
        
        _colorUtility = this.calculatePartColor(1);  
        let red   = Math.floor( _colorUtility.red   * 255 );
        let green = Math.floor( _colorUtility.green * 255 );
        let blue  = Math.floor( _colorUtility.blue  * 255 );
        
        canvas.fillStyle = "rgb( " + red + ", " + green + ", " + blue + " )";	
        
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

        canvas.beginPath();
        canvas.moveTo( mouthStartX, mouthStartY );
        canvas.lineTo( leftJawX,    leftJawY    );
        canvas.lineTo( leftEndX,    leftEndY    );
        canvas.lineTo( mouthStartX, mouthStartY );
        canvas.lineTo( rightEndX,   rightEndY   );
        canvas.lineTo( rightJawX,   rightJawY   );
        canvas.lineTo( leftJawX,    leftJawY    );
        canvas.fill();
        canvas.closePath();	
        
        canvas.strokeStyle = "rgba( 255, 255, 255, 0.7 )";	
        canvas.beginPath();
        canvas.moveTo( rightEndX,   rightEndY  );
        canvas.lineTo( mouthStartX, mouthStartY );
        canvas.lineTo( leftEndX,    leftEndY );
        canvas.stroke();
        canvas.closePath();	     
               					
        canvas.strokeStyle = OUTLINE_COLOR; 
        canvas.beginPath();
        canvas.moveTo( leftJawX, leftJawY );
        canvas.lineTo( leftEndX, leftEndY );
        canvas.stroke();
        canvas.closePath();	            					

        canvas.beginPath();
        canvas.moveTo( rightJawX, rightJawY );
        canvas.lineTo( rightEndX, rightEndY );
        canvas.stroke();
        canvas.closePath();	 
                   					
    }
    
}//end of entire Swimbots function -------------------------





