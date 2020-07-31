"use strict";


function FamilyTree()
{
    function FamilyTreeNode()
    {
        this.index          = NULL_INDEX;
        this.parent1Index   = NULL_INDEX;
        this.parent2Index   = NULL_INDEX;
        this.birthTime      = 0;
        this.genes          = new Array();
    }
    
    let _nodes = new Array();  
    let _numNodes = 0;  
    
    //-----------------------
    this.reset = function()
    {
        _numNodes = 0;
        _nodes = [];
        _nodes.length = 0;
    }

    //------------------------------------------------------------------------------
    this.addNode = function( index, parent1Index, parent2Index, birthTime, genes )
    {
        _nodes[ _numNodes ] = new FamilyTreeNode
        _nodes[ _numNodes ].index         = index;
        _nodes[ _numNodes ].parent1Index  = parent1Index;
        _nodes[ _numNodes ].parent2Index  = parent2Index;
        _nodes[ _numNodes ].birthTime     = birthTime;
          
        for (let g=0; g<genes.length; g++)
        {
            _nodes[ _numNodes ].genes[g] = genes[g];
        }

        _numNodes ++;
    }
               
    //----------------------------------------------------------------------
    this.getNumNodes            = function(         ) { return _numNodes; }
    this.getNodeParent1Index    = function( index   ) { return _nodes[ index ].parent1Index; }
    this.getNodeParent2Index    = function( index   ) { return _nodes[ index ].parent2Index; }
    this.getNodeBirthTime       = function( index   ) { return _nodes[ index ].birthTime; }
    this.getNodeGenes           = function( index   ) { return _nodes[ index ].genes; }
}
