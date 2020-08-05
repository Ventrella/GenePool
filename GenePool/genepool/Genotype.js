"use strict";


//const NUM_GENES = 100;
const NUM_GENES = 256;

//const MUTATION_RATE   = 0.0;
const MUTATION_RATE	= 0.01; // original
//const MUTATION_RATE	= 0.05;
//const MUTATION_RATE	= 0.2;
//const MUTATION_RATE   = 1.0;

const CROSSOVER_RATE	= 0.2;
const MIN_GENE_VALUE	= 0;

const PRESET_GENOTYPE_DARWIN    =  0;
const PRESET_GENOTYPE_WALLACE   =  1;
const PRESET_GENOTYPE_MENDEL    =  2;
const PRESET_GENOTYPE_TURING    =  3;
const PRESET_GENOTYPE_MARGULIS  =  4;
const PRESET_GENOTYPE_WILSON    =  5;
const PRESET_GENOTYPE_DAWKINS   =  6;
const PRESET_GENOTYPE_DENNETT   =  7;

/*
const PRESET_GENOTYPE_THING     =  8;
const PRESET_GENOTYPE_CRAZY     =  9;
const PRESET_GENOTYPE_OTTO      = 10;
const PRESET_GENOTYPE_SQUIRM    = 11;
const PRESET_GENOTYPE_WHIPPER   = 12;
const PRESET_GENOTYPE_FAST      = 13;
const PRESET_GENOTYPE_BLIP      = 14;
*/


//-------------------
function Genotype()
{
	//------------------------------------------------
	// create array of genes and initialize to 0
	//------------------------------------------------
	let _genes = new Array( NUM_GENES ); 
	
    for (let g=0; g<NUM_GENES; g++)
    {
        _genes[g] = 0;             
    }

	//--------------------------------
	// randomize genes
	//--------------------------------
	this.randomize = function()
	{	    
        //----------------------------------------------
        // each gene is a non-negative integer < 256
        //----------------------------------------------
		for (let g=0; g<NUM_GENES; g++)
		{
			_genes[g] = Math.floor( Math.random() * BYTE_SIZE );
            assert( _genes[g] < BYTE_SIZE, "Genotype: randomize: _genes[g] < BYTE_SIZE" );  
            assertInteger( _genes[g], "Genotype:randomize; assertInteger( _genes[g]" );	
		}
	}
	
	//------------------------------------------
	// set all genes to one value
	//------------------------------------------
	this.setAllGenesToOneValue = function(v)
	{	    
		for (let g=0; g<NUM_GENES; g++)
		{
			_genes[g] = v;
            assert( _genes[g] < BYTE_SIZE, "Genotype:setAllGenesToOneValue: _genes[g] < BYTE_SIZE" );  	
            assertInteger( _genes[g], "Genotype:setAllGenesToOneValue; assertInteger( _genes[g]" );	
		}		
	}

	
	//------------------------------------------
	// set all genes to zero
	//------------------------------------------
	this.clear = function(v)
	{	    
		for (let g=0; g<NUM_GENES; g++)
		{
			_genes[g] = 0;  			
		}		
	}
	
    //-------------------------------
	this.getGeneValue = function(g)
	{ 
	    //console.log( _genes[g] );

        assertInteger( _genes[g], "Genotype:getGeneValue; assertInteger( _genes[g]" );	
	
        return _genes[g];
    }  
 
    //-------------------------------
	this.getGenes = function()
	{ 
        return _genes;
    }
 
    //-----------------------------------
    this.setGenes = function(g)
	{ 
        for (let i=0; i<NUM_GENES; i++)
        {
            assertInteger( g[i], "Genotype:setGenes: assertInteger: g[i]" );
        }

        _genes = g;
    }

    //-----------------------------------
	this.setGeneValue = function( g, v )
	{ 
        assert( v < BYTE_SIZE, "Genotype:setGeneValue: v < BYTE_SIZE");
        assertInteger( v, "Genotype:setGeneValue; assertInteger, v" );	

        _genes[g] = v;
    } 
    
    
    //------------------------------------------------
	this.copyFromGenotype = function( otherGenotype )
	{ 
        for (let g=0; g<NUM_GENES; g++)
        {        
            _genes[g] = otherGenotype.getGeneValue(g);
            assert( _genes[g] < BYTE_SIZE, "Genotype:copyFromGenotype: assert _genes[g] < BYTE_SIZE" );
            assertInteger( _genes[g], "Genotype:copyFromGenotype; assertInteger, _genes[g]" );	        
        }
    }    
    
	//--------------------------------
	// set to Froggy
	//--------------------------------
	this.setToFroggy = function()
	{ 
	    let g = -1;
	    
//g++; _genes[g] = Math.floor( Math.random() * BYTE_SIZE ); // frequency
g++; _genes[g] = 255;
        g++; _genes[g] =  70; //cutOff        
        
		for (let c=0; c<3; c++)
		{
            let category    = 0;
            let redTest     = 0;
            let startWidth  = 160;
            let endLength   = 200;

            if ( c === 0 )
            {
                category    = 200;
                redTest     = 255;
                startWidth  = 255;
                endLength   = 0;
            }  

            //-----------------------------------------
		    // order matters!!!
            //-----------------------------------------
            g++; _genes[g] =  80;       //start red
            g++; _genes[g] = 150;       //start green
            g++; _genes[g] =  20;       //start blue
            g++; _genes[g] =  80;       //end red
            g++; _genes[g] = 150;       //end green
            g++; _genes[g] =  20;       //end blue            
            g++; _genes[g] = startWidth;//startWidth      
            g++; _genes[g] =  80;       //endWidth        
            g++; _genes[g] = 100;       //startLength     
            g++; _genes[g] = endLength; //endLength                 
            
            g++; _genes[g] = Math.floor( Math.random() * BYTE_SIZE );  //amp             
            g++; _genes[g] = Math.floor( Math.random() * BYTE_SIZE );  //phase      
            g++; _genes[g] = Math.floor( Math.random() * BYTE_SIZE );  //turnAmp         
            g++; _genes[g] = Math.floor( Math.random() * BYTE_SIZE );  //turnPhase       
            g++; _genes[g] = Math.floor( Math.random() * BYTE_SIZE );  //branchAmp             
            g++; _genes[g] = Math.floor( Math.random() * BYTE_SIZE );  //branchPhase      
            g++; _genes[g] = Math.floor( Math.random() * BYTE_SIZE );  //branchTurnAmp         
            g++; _genes[g] = Math.floor( Math.random() * BYTE_SIZE );  //branchTurnPhase       
            
            g++; _genes[g] = 0;         //sequenceCount       
            g++; _genes[g] = 0;         //branchPeriod    
            g++; _genes[g] = 180;       //branchAngle     
            g++; _genes[g] = 100;       //branchNumber    
            g++; _genes[g] = 0;         //branchShift                 
            g++; _genes[g] = category;  //branchCategory  
            g++; _genes[g] = 0;         //branchReflect               
            
            g++; _genes[g] = 255;       //splined   
            g++; _genes[g] = 100;       //end cap spline 
	    }
    }


	//--------------------------------
	// set to preset
	//--------------------------------
	this.setToPreset = function(i)
	{ 	
	    if ( i === PRESET_GENOTYPE_DARWIN )
        {
            _genes =  
            [157,191,232,48,167,41,45,248,148,141,182,184,100,252,240,199,242,14,188,237,205,200,73,165,15,20,72,193,196,171,101,28,14,200,148,251,235,50,224,247,34,251,61,126,92,32,55,170,43,65,40,114,253,229,76,209,236,228,16,94,68,134,142,241,27,213,164,14,159,194,211,181,117,97,230,155,92,39,168,100,155,26,142,133,119,67,14,163,248,150,71,187,141,46,66,79,141,210,60,76,203,193,73,7,57,109,159,16,42,103,161,68,184,50,116,19,31,171,45,71,176,186,34,236,19,234,164,6,72,63,40,21,39,82,129,18,24,38,122,9,175,56,221,77,75,253,28,242,107,64,48,31,48,221,122,115,15,164,150,242,110,65,128,161,117,58,183,222,192,146,163,52,56,26,206,32,232,220,132,230,46,206,3,97,85,167,58,124,53,191,32,55,112,43,115,127,218,200,4,150,195,143,205,67,128,222,120,175,1,31,207,165,49,39,165,178,10,147,209,195,138,221,125,1,104,141,65,27,44,131,176,74,152,113,49,60,167,173,67,67,238,236,178,9,175,88,42,239,163,132,154,38,72,252,195,211];
        }
        else if ( i === PRESET_GENOTYPE_WALLACE )
        {
            _genes = 
            [131,167,210,41,139,159,161,137,34,163,228,245,144,62,33,94,118,244,172,92,55,201,151,131,24,250,217,133,87,214,170,232,195,236,88,111,160,103,128,57,93,180,13,139,136,126,26,153,71,135,25,186,178,61,130,213,252,118,87,17,107,22,49,212,237,156,186,168,221,10,228,149,149,195,254,89,166,110,34,59,13,161,154,139,150,252,181,121,94,72,247,125,32,78,112,61,123,182,85,187,163,146,136,149,117,42,187,150,196,245,208,188,252,147,247,64,248,243,188,96,27,100,188,144,142,108,125,51,20,51,55,234,179,209,200,5,220,84,1,7,129,5,218,183,160,128,137,110,247,56,57,199,228,46,5,181,166,160,237,207,179,36,189,87,58,178,215,227,175,190,128,233,79,179,25,164,175,199,109,175,204,67,92,119,131,93,192,177,181,86,162,138,99,103,244,46,134,244,79,8,207,64,97,206,17,60,174,247,181,11,6,149,83,107,146,98,104,179,105,71,175,40,217,58,183,93,184,228,104,157,172,232,57,65,196,38,176,248,195,231,99,227,200,174,52,184,214,31,196,185,100,178,104,47,2,95];
        }
        else if ( i === PRESET_GENOTYPE_MENDEL )
        {
            _genes = 
            [121,117,166,58,69,252,103,97,234,131,25,244,83,214,29,96,233,98,206,227,192,25,6,169,48,106,217,16,61,221,91,36,144,11,133,39,252,45,193,214,141,223,201,90,188,50,172,233,156,0,124,183,87,229,231,134,116,211,50,21,198,127,93,106,153,145,110,72,210,245,56,118,91,186,244,245,211,139,255,91,22,228,10,8,173,109,93,78,221,7,127,173,18,139,60,109,34,99,217,89,134,92,220,252,185,70,163,19,31,148,207,206,240,247,55,189,138,73,30,160,41,254,136,116,241,156,233,65,243,124,224,227,89,14,229,98,73,244,164,179,152,207,18,46,15,118,42,116,185,182,23,238,243,107,102,143,103,182,137,235,31,41,160,198,172,83,175,49,151,128,172,255,97,184,143,217,174,122,245,201,35,125,18,180,193,233,22,36,64,93,206,107,91,12,173,26,167,84,60,118,210,51,178,170,207,118,225,115,176,207,62,210,240,8,118,164,3,27,5,69,39,181,152,30,202,118,97,91,214,120,85,27,195,169,250,100,147,32,77,147,199,20,188,189,128,117,68,111,26,141,163,155,125,172,123,163];
        }
        else if ( i === PRESET_GENOTYPE_TURING )
        {
            _genes = 
            [163,72,95,3,33,138,51,22,89,0,75,198,35,0,228,62,245,4,0,138,0,54,194,65,50,77,130,26,27,229,16,194,193,238,3,234,149,2,159,0,124,97,228,183,79,40,34,115,235,134,254,174,8,4,91,50,3,58,2,185,244,209,93,7,254,193,31,162,6,53,184,10,206,253,251,10,155,34,167,162,94,113,14,10,179,7,212,31,185,18,224,2,116,51,253,120,8,7,62,4,49,164,210,49,232,122,2,153,124,15,238,33,16,197,234,145,225,63,188,177,253,6,47,221,10,3,242,155,38,68,28,63,69,23,9,10,33,20,62,122,74,4,140,101,230,33,200,31,90,234,40,80,218,0,185,2,67,224,227,66,247,246,156,168,38,204,142,221,161,6,191,113,30,213,205,67,23,13,50,99,39,101,16,2,156,99,156,1,162,2,121,117,54,17,166,178,153,247,171,138,20,108,11,254,221,205,219,145,244,207,103,243,44,99,241,71,79,75,91,50,56,165,73,238,182,228,0,32,79,6,14,199,18,74,51,252,143,130,254,70,44,144,231,88,119,61,252,1,84,96,229,49,182,0,37,58];
        }
        else if ( i === PRESET_GENOTYPE_MARGULIS )
        {
            _genes = 
            [105,201,49,238,245,97,7,214,163,10,84,150,197,250,251,240,156,194,249,16,240,177,173,91,152,71,71,169,42,6,230,13,17,165,117,239,99,51,115,174,98,251,42,48,174,115,82,76,148,44,105,186,213,153,3,90,140,168,71,180,185,156,164,23,162,203,224,229,3,168,177,245,109,132,48,148,227,101,244,231,143,108,149,176,2,124,211,245,102,207,208,13,75,187,8,0,27,24,89,30,194,117,56,138,107,9,86,191,183,185,12,201,94,170,159,144,81,230,133,82,87,59,4,232,92,199,109,5,73,147,163,127,98,99,12,164,84,235,213,79,204,27,169,230,80,90,224,9,130,199,123,3,144,215,242,16,151,64,204,78,188,181,84,83,158,134,244,19,122,175,252,176,189,28,79,137,253,215,117,48,149,102,14,228,224,49,170,191,52,38,243,33,90,130,48,99,211,144,30,220,98,114,131,179,113,242,161,23,195,44,76,144,113,143,162,173,183,10,155,234,83,147,76,28,50,11,2,97,75,156,5,103,246,191,54,87,44,80,211,92,10,183,247,30,147,114,84,163,245,190,163,106,178,111,136,104];
        }
        else if ( i === PRESET_GENOTYPE_WILSON )
        {
            _genes = 
            [120,105,241,1,183,93,70,141,7,30,190,241,5,252,239,106,50,107,211,72,252,149,126,94,121,122,150,244,231,135,204,216,18,198,216,56,243,82,102,138,43,53,93,152,186,158,213,52,211,204,186,132,237,108,191,109,104,35,30,228,108,34,45,213,233,10,20,53,20,235,180,48,190,79,178,60,118,52,194,109,249,223,94,162,234,220,235,129,61,109,249,177,178,69,235,209,214,122,135,82,130,182,231,164,3,19,205,65,69,90,209,237,179,121,8,68,55,140,202,159,108,178,250,93,210,244,123,156,173,146,100,57,85,7,97,239,186,129,176,40,183,63,188,137,129,51,177,7,208,118,175,151,162,240,121,106,130,104,199,208,116,110,8,75,185,233,236,186,99,164,148,88,41,69,149,27,50,163,171,139,31,168,197,94,254,22,185,211,210,220,153,239,67,94,98,190,53,92,36,171,60,221,100,21,233,74,66,199,84,208,2,52,164,88,63,245,212,41,172,149,128,219,211,156,55,100,219,30,78,249,234,46,208,204,246,89,71,145,137,126,114,154,63,171,173,68,49,121,31,207,68,39,171,34,32,33];
        }
        else if ( i === PRESET_GENOTYPE_DAWKINS )
        {
            _genes = 
            [175,70,80,150,20,80,150,20,255,80,100,0,226,18,153,215,75,123,192,95,0,0,87,100,9,200,0,255,100,80,150,20,80,150,20,160,80,100,200,125,189,21,8,204,8,66,31,0,0,180,100,0,0,4,255,100,80,150,20,80,150,20,160,36,107,200,129,242,254,217,32,106,110,189,253,0,180,100,0,0,0,255,100,0,0,0,0,99,0,0,25,0,0,132,0,0,0,0,0,0,0,0,0,0,0,244,0,0,0,0,0,0,0,0,0,0,0,0,0,0,174,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,243,0,0,0,0,0,150,0,0,0,0,0,0,0,0,0,0,0,123,0,0,0,0,205,0,0,0,231,0,0,0,0,0,0,0,0,0,41,135,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33,0,0,0,0,0,0,0,185,0,0,108,0,61,0,0,0,0,0];
        }        
        else if ( i === PRESET_GENOTYPE_DENNETT )
        {
            _genes = 
            [239,132,90,192,183,6,78,77,93,178,73,216,43,218,29,93,84,72,5,127,211,76,175,226,225,18,108,138,132,180,170,84,241,67,215,240,146,245,37,99,170,16,236,128,5,116,14,16,222,214,94,119,85,217,17,199,102,153,248,221,81,75,94,8,238,145,242,25,19,11,224,84,212,70,87,175,82,114,77,41,130,42,50,93,25,226,176,170,101,15,255,188,110,73,24,240,150,228,226,192,82,114,52,134,22,66,254,94,156,198,211,170,250,169,33,126,49,116,233,62,144,221,147,185,171,69,154,187,234,148,176,227,173,168,165,74,191,10,25,98,81,141,39,31,155,147,211,242,157,179,57,75,17,140,202,52,230,174,136,120,23,209,168,11,192,33,134,133,235,122,92,237,147,186,132,192,141,57,63,224,111,199,129,200,66,100,19,76,173,84,191,254,149,106,91,60,156,114,68,208,5,228,200,1,38,64,239,169,68,77,162,119,163,25,161,45,133,16,74,156,129,194,225,78,212,172,28,49,6,63,82,94,10,68,176,82,20,150,54,81,96,215,173,15,196,159,194,205,200,36,148,194,68,21,150,198];
        }              
    }

//use this...
/*        
105,201,49,238,245,97,7,214,163,10,84,150,197,250,251,240,156,194,249,16,240,177,173,91,152,71,71,169,42,6,230,13,17,165,117,239,99,51,115,174,98,251,42,48,174,115,82,76,148,44,105,186,213,153,3,90,140,168,71,180,185,156,164,23,162,203,224,229,3,168,177,245,109,132,48,148,227,101,244,231,143,108,149,176,2,124,211,245,102,207,208,13,75,187,8,0,27,24,89,30,194,117,56,138,107,9,86,191,183,185,12,201,94,170,159,144,81,230,133,82,87,59,4,232,92,199,109,5,73,147,163,127,98,99,12,164,84,235,213,79,204,27,169,230,80,90,224,9,130,199,123,3,144,215,242,16,151,64,204,78,188,181,84,83,158,134,244,19,122,175,252,176,189,28,79,137,253,215,117,48,149,102,14,228,224,49,170,191,52,38,243,33,90,130,48,99,211,144,30,220,98,114,131,179,113,242,161,23,195,44,76,144,113,143,162,173,183,10,155,234,83,147,76,28,50,11,2,97,75,156,5,103,246,191,54,87,44,80,211,92,10,183,247,30,147,114,84,163,245,190,163,106,178,111,136,104
*/        
        
    //--------------------------------------------------------
	this.setAsOffspring = function( parent_0, parent_1 )
	{ 	
	    //console.log( parent_0 );
	    //console.log( parent_1 );
	    
	    /*
	    console.log( "----------------------------");
	    console.log( "setAsOffspring");
	    console.log( "----------------------------");

        for (let g=0; g<NUM_GENES; g++)
        {
            console.log( parent_0.genes[g] + ", " + parent_1.genes[g] );
        }
	    */
	    
        //-------------------------------------------
        // start with random parent either 1 or 2
        //-------------------------------------------
        let parent = 0;
        if ( Math.random() < ONE_HALF )
        {
            parent = 1;
        }

        //-------------------------------------------
        // scan genes
        //-------------------------------------------
        for (let g=0; g<NUM_GENES; g++ )
        {
            //-----------------------------------
            // crossover - switch to other parent 
            //-----------------------------------
            if ( Math.random() < CROSSOVER_RATE )
            {
                if ( parent === 0 )
                {
                    parent =  1;
                }
                else 
                {
                    parent = 0;
                }
            }

            //-----------------------------------
            // copy parent gene to child gene 
            //-----------------------------------
            if ( parent === 0 ) 
            {
                assert ( parent_0.getGeneValue(g) >= 0,         "Genotype: setAsOffspring: parent_0.getGeneValue(g) >= 0" );
                assert ( parent_0.getGeneValue(g) < BYTE_SIZE,  "Genotype: setAsOffspring: parent_0.getGeneValue(g) < BYTE_SIZE" );
                assertInteger( parent_0.getGeneValue(g),        "Genotype: setAsOffspring: assertInteger: parent_0.getGeneValue(g)" );	

                _genes[g] = parent_0.getGeneValue(g);
            }
            else 
            {
                assert ( parent_1.getGeneValue(g) >= 0,         "Genotype: setAsOffspring: parent_1.getGeneValue(g) >= 0" );
                assert ( parent_1.getGeneValue(g) < BYTE_SIZE,  "Genotype: setAsOffspring: parent_1.getGeneValue(g) < BYTE_SIZE" );
                assertInteger( parent_1.getGeneValue(g),        "Genotype: setAsOffspring: assertInteger: parent_1.getGeneValue(g)" );	
                
                _genes[g] = parent_1.getGeneValue(g);
            }
            
            assertInteger( _genes[g], "Genotype: setAsOffspring: assertInteger: _genes[g]" );	

            //-----------------------------------
            // mutation
            //-----------------------------------
            if ( Math.random() < MUTATION_RATE ) 
            {
                this.mutateGene(g);
            }
      
            assert ( _genes[g] >= 0, "_genes[g] >=   0" );
            assert ( _genes[g] < BYTE_SIZE, "_genes[g] < BYTE_SIZE" );
            assertInteger( _genes[g], "Genotype: setAsOffspring: AFTER MUTATION...assertInteger: _genes[g]" );	
        }
    }
     

   
    //-----------------------------
	this.mutateGene = function(g)
	{	
        assertInteger( _genes[g], "Genotype: at the start of mutateGene" );
        	
        assert ( _genes[g] >= 0, "mutateGene: _genes[g] >=   0" );
        assert ( _genes[g] < BYTE_SIZE, "mutateGene: _genes[g] < BYTE_SIZE" );
 	

	    //console.log( "mutate gene " + g );
	    
        let amplitude = Math.floor( Math.random() * Math.random() * BYTE_SIZE );
        //console.log( "amplitude = " + amplitude );
    
        //-------------------------------------
        // keep it an integer!!!
        //-------------------------------------
        amplitude = Math.round( amplitude );

        assert( amplitude >= 0, "mutateGene:amplitude >= 0" );
        assert( amplitude < BYTE_SIZE, "mutateGene:amplitude < BYTE_SIZE" );

        if ( Math.random() > ONE_HALF )
        {
            let before = _genes[g];
            _genes[g] += amplitude;
            
            if ( _genes[g] >= BYTE_SIZE ) 
            {
                _genes[g] -= BYTE_SIZE;
            }
            
            //console.log( "gene " + g + " mutated by " + amplitude + "; the value changed from " + before + " to " + _genes[g] );
        }
        else 
        {
            _genes[g] -= amplitude;

            if ( _genes[g] < 0 ) 
            {
                _genes[g] += BYTE_SIZE;
            }
        }

	
        assertInteger( _genes[g], "Genotype: mutateGene" );	
	
        
        assert ( _genes[g] >= 0, "Genotype: mutateGene:_genes[g] >=   0" );
        assert ( _genes[g] < BYTE_SIZE, "Genotype: mutateGene:_genes[g] < BYTE_SIZE" );
    }

   
    //-----------------------------
	this.zap = function( amount )
	{ 
        for (let g=0; g<NUM_GENES; g++ )
        {
            if ( Math.random() < amount )
            {
                this.mutateGene(g);
            }
        }
    }
}


 
 