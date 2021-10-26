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
//  constants
//------------------------
const MAX_SPECIES = 200;
const MIN_SWIMBOTS_PER_SPECIES = 10;

//--------------------
function PhyloTree()
{
    //------------------
    function Species()
    {
        this.ID             = NULL_INDEX;
        this.parentID       = NULL_INDEX;
        this.mode           = new Array();
        this.numSwimbots    = 0;
        this.startTime      = 0;
        this.endTime        = 0;
    }
    
	//-----------------------
	// variables
	//-----------------------
    let _numSpecies = 0;
    let _numJunkGenes = 0;
    let _species = new Array( MAX_SPECIES );
    
    for (let s=0; s<MAX_SPECIES; s++)
    {
        _species[s] = new Species();
    }
    
	//-------------------------------------------
	this.initialize = function( numJunkGenes )
	{
        console.log( "initialize phylo tree! numJunkGenes = " + numJunkGenes );

        _numSpecies = 0;

        for (let s=0; s<MAX_SPECIES; s++)
        {
            _species[s].numSwimbots = 0;
            _species[s].ID          = NULL_INDEX;
            _species[s].parentID    = NULL_INDEX;
            _species[s].startTime   = 0;
            _species[s].endTime     = 0;
        }

    	_numJunkGenes = numJunkGenes;
	}
    
	//------------------------------------------
	this.addJunkDNA = function( junkDNAArray )
	{
        for (let g=0; g<_numJunkGenes; g++)
        {
        }          	
    }
    
} // function PhyloTree()

	  
       
