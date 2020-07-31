

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
		return -180.0 + Math.random() * 360.0;
	}
	
