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



	//-----------------------------------
	// color
	//-----------------------------------
    function Color()
    {
        this.red   = ZERO;
        this.green = ZERO;
        this.blue  = ZERO;
    }

	//-----------------------------------
	// assert
	//-----------------------------------
	function assert( assertion, string )
	{
		if ( !assertion )
		{
			alert( "assertion failed: " + string );
		} 
	}


	//-----------------------------------
	// assert integer
	//-----------------------------------
	function assertInteger( value, string )
	{
		if ( value - Math.floor( value ) > 0 )
		{
			alert( "assertInteger: value not an integer! - " + string );
		} 
	}
	
	//-----------------------------------
	// getRandomAngleInDegrees
	//-----------------------------------
	function getRandomAngleInDegrees()
	{
		return -180.0 + gpRandom() * 360.0;
	}
	
