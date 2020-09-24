
"use strict";


//--------------------------
const FIRST_INFO_PAGE = 1;
const LAST_INFO_PAGE  = 28;

let _currentInfoPage = FIRST_INFO_PAGE;
let _graph = new Graph(); 
let _tweakGenesCategory = 0;

//----------------------------
function initializeUI()
{
    initializeEcosystemUI();    
    
    _graph.initialize();      
  
    //--------------------------------------------------
    // This starts an update loop that is called 
    // periodically to adjust UI states and stuff. 
    //--------------------------------------------------
    //console.log( "setTimeout" );
        
    setTimeout( "updateUI()", 1 );
 }



//----------------------------
function chooseAttraction()
{
    //console.log( "chooseAttraction" );

    let radioButtons = document.getElementsByName( 'attractionRadioButton' );

    /*
    console.log( "radioButtons.length = " + radioButtons.length );

    for (let i = 0; i < radioButtons.length; i++) 
    {
        console.log( radioButtons[i].value );
    }
    */
    
    for (let i = 0; i < radioButtons.length; i++) 
    {
        if ( radioButtons[i].type === 'radio' ) 
        {
            //console.log( "if ( radioButtons[i].type === 'radio' ) " );

            if ( radioButtons[i].checked )
            {
                let value = radioButtons[i].value;  
                let attraction = ATTRACTION_SIMILAR_COLOR;

                     if ( value === "colorful"          ) { attraction = ATTRACTION_COLORFUL;           }
                else if ( value === "big"               ) { attraction = ATTRACTION_BIG;                }
                else if ( value === "hyper"             ) { attraction = ATTRACTION_HYPER;              }
                else if ( value === "long"              ) { attraction = ATTRACTION_LONG;               }
                else if ( value === "straight"          ) { attraction = ATTRACTION_STRAIGHT;           }
                
                else if ( value === "noColor"           ) { attraction = ATTRACTION_NO_COLOR;           }
                else if ( value === "small"             ) { attraction = ATTRACTION_SMALL;              }
                else if ( value === "still"             ) { attraction = ATTRACTION_STILL;              }
                else if ( value === "short"             ) { attraction = ATTRACTION_SHORT;              }
                else if ( value === "crooked"           ) { attraction = ATTRACTION_CROOKED;            }
                
                else if ( value === "similarColor"      ) { attraction = ATTRACTION_SIMILAR_COLOR;      }
                else if ( value === "similarSize"       ) { attraction = ATTRACTION_SIMILAR_SIZE;       }
                else if ( value === "similatHyper"      ) { attraction = ATTRACTION_SIMILAR_HYPER;      }
                else if ( value === "similatLength"     ) { attraction = ATTRACTION_SIMILAR_LENGTH;     }
                else if ( value === "similarStraight"   ) { attraction = ATTRACTION_SIMILAR_STRAIGHT;   }
                
                else if ( value === "random"            ) { attraction = ATTRACTION_RANDOM;             }
                else if ( value === "closest"           ) { attraction = ATTRACTION_CLOSEST;            }
            
                //console.log ( "Attraction set to " + attraction );
                genePool.setAttraction( attraction );
            }
        }
    }
}


//-------------------------
function openTweakPanel()
{
    document.getElementById( 'tweakDefaultButton' ).style.visibility = 'visible';
    updateEcosystemUI();
}    



//--------------------------------
function setEcosystemValue( id )
{
    let input = document.getElementById( id );
    
         if ( id === "foodGrowthDelay"      ) { genePool.setFoodGrowthDelay     ( input.value ); }
    else if ( id === "foodSpread"           ) { genePool.setFoodSpread          ( input.value ); }
    else if ( id === "foodBitEnergy"        ) { genePool.setFoodBitEnergy       ( input.value ); }
    else if ( id === "hungerThreshold"      ) { genePool.setHungerThreshold     ( input.value ); }
    else if ( id === "energyToOffspring"    ) { genePool.setOffspringEnergyRatio( input.value ); }
        
    updateEcosystemUI(); 
}

//------------------------------------
function setEcosystemToDefaults()
{   
    genePool.setFoodGrowthDelay     ( DEFAULT_FOOD_REGENERATION_PERIOD  );
    genePool.setFoodSpread          ( DEFAULT_FOOD_BIT_MAX_SPAWN_RADIUS );
    genePool.setFoodBitEnergy       ( DEFAULT_FOOD_BIT_ENERGY           );
    genePool.setHungerThreshold     ( DEFAULT_SWIMBOT_HUNGER_THRESHOLD  );
    genePool.setOffspringEnergyRatio( DEFAULT_CHILD_ENERGY_RATIO        );
    
    updateEcosystemUI(); 
}



//----------------------------
function initializeEcosystemUI()
{
    document.getElementById( 'foodGrowthDelay'  ).min = MIN_FOOD_REGENERATION_PERIOD;
    document.getElementById( 'foodGrowthDelay'  ).max = MAX_FOOD_REGENERATION_PERIOD;

    document.getElementById( 'foodSpread'       ).min = MIN_FOOD_BIT_MAX_SPAWN_RADIUS;
    document.getElementById( 'foodSpread'       ).max = MAX_FOOD_BIT_MAX_SPAWN_RADIUS;

    document.getElementById( 'foodBitEnergy'    ).min = MIN_FOOD_BIT_ENERGY;
    document.getElementById( 'foodBitEnergy'    ).max = MAX_FOOD_BIT_ENERGY;
    
    document.getElementById( 'hungerThreshold'  ).min = MIN_SWIMBOT_HUNGER_THRESHOLD;
    document.getElementById( 'hungerThreshold'  ).max = MAX_SWIMBOT_HUNGER_THRESHOLD;
        
    document.getElementById( 'energyToOffspring').min = MIN_CHILD_ENERGY_RATIO;
    document.getElementById( 'energyToOffspring').max = MAX_CHILD_ENERGY_RATIO;
    
    updateEcosystemUI();
}
    


//----------------------------
function updateEcosystemUI()
{
    if ( typeof genePool != "undefined" ) 
    {    
        document.getElementById( "foodGrowthDelay"          ).value     = genePool.getFoodGrowthDelay();
        document.getElementById( "foodGrowthDelayValue"     ).innerHTML = genePool.getFoodGrowthDelay();        
    
        document.getElementById( "foodSpread"               ).value     = genePool.getFoodSpread();
        document.getElementById( "foodSpreadValue"          ).innerHTML = genePool.getFoodSpread();

        document.getElementById( "foodBitEnergy"            ).value     = genePool.getFoodBitEnergy();
        document.getElementById( "foodBitEnergyValue"       ).innerHTML = genePool.getFoodBitEnergy();
    
        document.getElementById( "hungerThreshold"          ).value     = genePool.getHungerThreshold();
        document.getElementById( "hungerThresholdValue"     ).innerHTML = genePool.getHungerThreshold();

        document.getElementById( "energyToOffspring"        ).value     = genePool.getEnergyToOffspring();
        document.getElementById( "energyToOffspringValue"   ).innerHTML = genePool.getEnergyToOffspring();   
        
    
        //--------------------------------------------------------------------------    
        // the radio buttons need to be reset to reflect any changes in attraction    
        //--------------------------------------------------------------------------    
        let radioButtons = document.getElementsByName( 'attractionRadioButton' );
        //console.log ( "updateEcosystemUI: genePool.getAttraction() = " + genePool.getAttraction() );
    
        for (let i = 0; i < radioButtons.length; i++) 
        {
            assert( i < NUM_ATTRACTIONS, "ui.js: updateEcosystemUI: i < NUM_ATTRACTIONS" );
        
            if ( radioButtons[i].type === 'radio' ) 
            {
                if ( genePool.getAttraction() === i )
                {
                    radioButtons[i].checked = true;
                }
                else
                {
                    radioButtons[i].checked = false;
                }
            }
        }
    } 
}




//----------------------------
function closeAllPanels()
{
    document.getElementById('poolPanel'    ).style.visibility = 'hidden';		        
    document.getElementById('swimbotPanel' ).style.visibility = 'hidden';		        
    document.getElementById('graphPanel'   ).style.visibility = 'hidden';		        
    document.getElementById('tweakPanel'   ).style.visibility = 'hidden';		        
    document.getElementById('infoPanel'    ).style.visibility = 'hidden';		        
    document.getElementById('infoText'     ).style.visibility = 'hidden';
    
    document.getElementById('prevInfoButton' ).style.visibility = 'hidden';	
    document.getElementById('nextInfoButton' ).style.visibility = 'hidden';	
    
    document.getElementById('noSelectedSwimbotPanel' ).style.visibility = 'hidden';	
    document.getElementById('selectedSwimbotPanel'   ).style.visibility = 'hidden';	

    document.getElementById('menuPoolButton'    ).style.top = 24;		        
    document.getElementById('menuSwimbotButton' ).style.top = 24;			        
    document.getElementById('menuTweakButton'   ).style.top = 24;			        
    document.getElementById('menuInfoButton'    ).style.top = 24;			        
    document.getElementById('menuGraphButton'   ).style.top = 24;	

    /*  
    document.getElementById('menuPoolButton'    ).style.height = 30;		        
    document.getElementById('menuSwimbotButton' ).style.height = 30;			        
    document.getElementById('menuTweakButton'   ).style.height = 30;			        
    document.getElementById('menuInfoButton'    ).style.height = 30;			        
    document.getElementById('menuGraphButton'   ).style.height = 30;	
    */

    /*
    document.getElementById('menuPoolButton'    ).style.visibility = 'visible';		        
    document.getElementById('menuSwimbotButton' ).style.visibility = 'visible';		        
    document.getElementById('menuTweakButton'   ).style.visibility = 'visible';		        
    document.getElementById('menuInfoButton'    ).style.visibility = 'visible';		        
    document.getElementById('menuGraphButton'   ).style.visibility = 'visible';		        
    */
        
    closePopupPanel();		        
                    
    _graph.clear();        	        
}


//----------------------------
function openPanel( buttonID )
{
    closeAllPanels(); 
    
    //document.getElementById( buttonID ).style.visibility = 'hidden';
    
    let panelID = 'poolPanel';
            
    if ( buttonID === 'menuPoolButton'      ) { panelID = 'poolPanel'; }
    if ( buttonID === 'menuSwimbotButton'   ) { panelID = 'swimbotPanel';   openSwimbotPanel(); }
    if ( buttonID === 'menuTweakButton'     ) { panelID = 'tweakPanel';     openTweakPanel(); }
    if ( buttonID === 'menuInfoButton'      ) { panelID = 'infoPanel';      openInfoPanel(); }
    if ( buttonID === 'menuGraphButton'     ) { panelID = 'graphPanel'; }

//document.getElementById( buttonID ).style.height = 50;
document.getElementById( buttonID ).style.top = 33;


    document.getElementById( panelID  ).style.visibility = 'visible';
}


//--------------------------
function openSwimbotPanel()
{
    if ( genePool.getASwimbotIsSelected() )
    {
        //console.log( "openSwimbotPanel ----SELECTED!" );
        document.getElementById( 'selectedSwimbotPanel'   ).style.visibility = 'visible';		        	        
        document.getElementById( 'noSelectedSwimbotPanel' ).style.visibility = 'hidden';
    }		    
    else
    {
        //console.log( "openSwimbotPanel ----NOT SELECTED!" );
        document.getElementById( 'selectedSwimbotPanel'   ).style.visibility = 'hidden';		        	        
        document.getElementById( 'noSelectedSwimbotPanel' ).style.visibility = 'visible';
    }		    
}    




//------------------------------------------------
function openTweakGenesPanel( selectedSwimbotID )
{
    if ( selectedSwimbotID != NULL_INDEX )
    {
        document.getElementById( 'tweakGenesPanel'      ).style.visibility = 'visible';		        	        
        document.getElementById( 'closeTweakGenesPanel' ).style.visibility = "visible"; 

        document.getElementById( 'tweakGenesPanel' ).innerHTML = "<div id = 'tweakGenesTitle' >Tweak the genes of swimbot " + selectedSwimbotID + "</div>"; 
        document.getElementById( 'tweakGenesPanel' ).innerHTML += "<div id = 'tweakGenesCategoryNote' >(choose which body part category to tweak)</div>"; 

        let numCategories = genePool.getNumGeneCategories();        
        for (let c=0; c<numCategories; c++)
        {
            document.getElementById( 'tweakGenesPanel' ).innerHTML            
            += "<div id = 'category" + (c+1) + "' >" + (c+1)
            +  "<input "
            +  "type         = 'radio' " 
            +  "id           = 'geneTweakerCategory" + c + "'"
            +  "name         = 'geneTweakerCategory'" 
            +  "oninput      = 'setGeneTweakCategory( " + selectedSwimbotID + ", " + c + ")' "
            +  "onchange     = 'setGeneTweakCategory( " + selectedSwimbotID + ", " + c + ")' "
            +  "></div>";
        }
        
        let num = genePool.getNumGenesPerCategory();
        num += 2; //add the two first (global: non-category) genes
        
        for (let g=0; g<num; g++)
        {
            let geneTweakerName  = genePool.getGeneName(g);
            let geneTweakerValue = genePool.getGeneValue( selectedSwimbotID, g );
            
            let top = 60 + g * 20;
            if ( g > 1 ) //skip the two first (global: non-category) genes
            {
                top += 80.0;
            }
            
            //----------------------------------------------------
            // construct the gene value display
            //----------------------------------------------------
            document.getElementById( 'tweakGenesPanel' ).innerHTML            
            += "<div class = 'geneTweakerValue' id = 'gene" + g + "Value' style = 'top:" + top + "px;'>" + geneTweakerValue + "</div>";

            //----------------------------------------------------
            // construct the slider
            //----------------------------------------------------
            document.getElementById( 'tweakGenesPanel' ).innerHTML            
            += "<input "
            +  "style        = 'top:" + ( top - 3 ) + "px;' "
            +  "type         = 'range' " 
            +  "class        = 'geneTweakerSlider' "
            +  "min          = '0'"
            +  "max          = '255'"   
            +  "value        = '" + geneTweakerValue + "'"   
            +  "id           = 'geneTweaker" + g + "'"
            +  "name         = 'geneTweaker" 
            +  "step         = 1 "
            +  "autocomplete = 'off' "
            +  "oninput      = 'tweakGene( " + selectedSwimbotID + ", " + g + ")' "
            +  ">";
            
            //----------------------------------------------------
            // construct the gene name
            //----------------------------------------------------
            document.getElementById( 'tweakGenesPanel' ).innerHTML            
            += "<div class = 'geneTweakerName' style = 'top:" + top + "px;'>" + geneTweakerName + "</div>";
        }
        

        //----------------------------------------------------
        // initialize tweak category
        //----------------------------------------------------
        _tweakGenesCategory = 0;

        //----------------------------------------------------
        // set radio button check status
        //----------------------------------------------------
        let radioButtons = document.getElementsByName( 'geneTweakerCategory' );

        for (let i = 0; i < radioButtons.length; i++) 
        {
            if ( i === _tweakGenesCategory ) 
            {
                radioButtons[i].checked = true;
            }
            else
            {
                radioButtons[i].checked = false;
            }
        }    
    }
    else
    {
        document.getElementById( 'tweakGenesPanel'      ).style.visibility = 'hidden';		        	        
        document.getElementById( 'closeTweakGenesPanel' ).style.visibility = "hidden"; 
    }    
}


//----------------------------
function closeTweakGenesPanel()
{
    document.getElementById( 'tweakGenesPanel'      ).style.visibility = "hidden"; 
    document.getElementById( 'closeTweakGenesPanel' ).style.visibility = "hidden"; 
}


//---------------------------------------------
function updateGeneSliders( selectedSwimbotID )
{
    let num = genePool.getNumGenesPerCategory();
    num += 2; //add the two first (global: non-category) genes
    
    for (let g=0; g<num; g++)
    {
        let geneIndex = g;
    
        if ( g > 1 )
        {
            geneIndex += genePool.getNumGenesPerCategory() * _tweakGenesCategory;   
        }
    
        let geneTweakerValue = genePool.getGeneValue( selectedSwimbotID, geneIndex );
        
        let id = "geneTweaker" + g;
        let slider = document.getElementById( id );
        slider.value = geneTweakerValue;

        id = "gene" + g + "Value";
        document.getElementById( id ).innerHTML = geneTweakerValue;
    }
}


//-------------------------
function closePopupPanel()
{
    document.getElementById( 'popUpPanel'               ).style.visibility = 'hidden';
    document.getElementById( 'cancelPopUpPanelButton'   ).style.visibility = 'hidden';
    document.getElementById( 'PopUpPanelError'          ).style.visibility = 'hidden';
    document.getElementById( 'cancelErrorButton'        ).style.visibility = 'hidden';  
    document.getElementById( 'popUpPanelInput'          ).style.visibility = 'hidden';
    document.getElementById( 'savePopUpPanelButton'     ).style.visibility = 'hidden';
    document.getElementById( 'noSavePopUpPanelButton'   ).style.visibility = 'hidden';
    document.getElementById( 'tweakDefaultButton'       ).style.visibility = 'hidden';
    document.getElementById( 'submitFilenameButton'     ).style.visibility = 'hidden';
    document.getElementById( 'dataDisplayButton'        ).style.visibility = "hidden";
    
// I don't know why these are popping an error that they don't exist.... ??     
//document.getElementById( "PopupText"                ).style.visibility = "hidden";   
//document.getElementById( "loadedList"               ).style.visibility = "hidden";   
    
    //---------------------------------------------------------------------   
    // move focus to the canvas in case it had been on the popup input  
    //---------------------------------------------------------------------   
    document.getElementById( "Canvas" ).focus();     
}


//-------------------------
function closeAccountPanel()
{
    document.getElementById( 'cancelAccountPanelButton' ).style.visibility = "hidden";    
    document.getElementById( 'accountPanel'             ).style.visibility = "hidden";  
    document.getElementById( 'accountEmailInput'        ).style.visibility = "hidden";
    document.getElementById( 'accountPasswordInput'     ).style.visibility = "hidden";
    document.getElementById( 'submitAccountButton'      ).style.visibility = 'hidden';
    
    document.getElementById( 'accountButton'    ).style.visibility = "visible";      
    document.getElementById( 'loginButton'      ).style.visibility = "visible";      
}



//-------------------------
function closeErrorPanel()
{
    document.getElementById( 'PopUpPanelError'      ).style.visibility = "hidden";    
    document.getElementById( 'cancelErrorButton'    ).style.visibility = "hidden";    
}





//----------------------------------
function toggleSimulationRunning()
{
    if ( genePool.getSimulationRunning() )
    {
        genePool.setSimulationRunning( false ); 
        document.getElementById( "freezeButton" ).innerHTML = "unfreeze";
        document.getElementById( "freezeButton" ).style = "border-style: solid; border-width: 3; border-color: #770000;"
    }
    else
    {
        genePool.setSimulationRunning( true ); 
        document.getElementById( "freezeButton" ).innerHTML = "freeze";
        document.getElementById( "freezeButton" ).style = "background-color: #ffffff;";
    }
}



//---------------------------
function toggleGoalOverlay()
{
    genePool.toggleGoalOverlay();
    
    if ( genePool.getRenderingGoals() )
    {
        document.getElementById( "viewGoalButton" ).style.backgroundColor = '#ffffff';
    }
    else
    {
        document.getElementById( "viewGoalButton" ).style.backgroundColor = '#cccccc';
    }
}



//-------------------------------
function clearViewMode()
{
    //console.log( "ui.js: clearViewMode");

    genePool.clearViewMode();
    clearViewModeButtons();
}


//-------------------------------
function clearViewModeButtons()
{
    document.getElementById( 'viewWholePoolButton'  ).style.backgroundColor = '#e7e7e7'; 
    document.getElementById( 'viewAutoTrackButton'  ).style.backgroundColor = '#e7e7e7'; 
    document.getElementById( 'viewSelectedButton'   ).style.backgroundColor = '#e7e7e7'; 
    document.getElementById( 'viewMutualButton'     ).style.backgroundColor = '#e7e7e7'; 
    document.getElementById( 'viewProlificButton'   ).style.backgroundColor = '#e7e7e7'; 
    document.getElementById( 'viewEfficientButton'  ).style.backgroundColor = '#e7e7e7'; 
    document.getElementById( 'viewVirginButton'     ).style.backgroundColor = '#e7e7e7'; 
    document.getElementById( 'viewGluttonButton'    ).style.backgroundColor = '#e7e7e7'; 
}


//---------------------------------------
function setViewMode( buttonID, viewMode )
{
    //---------------------------
    // clear out the buttons...
    //---------------------------
    clearViewModeButtons();

    genePool.setViewMode( viewMode );
        
    closePopupPanel();		        

    if ( buttonID === 'viewSelectedButton' )
    {
        if ( genePool.getSelectedSwimbotID() != -1 )
        {
            document.getElementById( buttonID ).style.backgroundColor = '#ffffff';             
        }
    }
    else
    {
        document.getElementById( buttonID ).style.backgroundColor = '#ffffff'; 
    }
}

//-------------------------------
function choosePoolToLoad( pool )
{
    _chosenPoolToLoad = pool;
}


//------------------------------------
function requestToLoadPoolFromFile()
{
    if ( _username === "anonymous" )
    {   
        showAccountRequiredPopup( "Cannot load pool" );
    }
    else
    {
        //----------------------------------------
        // get the name of the pool to load...
        //----------------------------------------
        let poolText = "from file";

        //-----------------------------------------------
        // make the appropriate UI elements visible...
        //-----------------------------------------------
        document.getElementById( 'popUpPanel'               ).style.visibility = "visible";   
        document.getElementById( 'cancelPopUpPanelButton'   ).style.visibility = "visible";
        document.getElementById( 'savePopUpPanelButton'     ).style.visibility = "visible";   
        document.getElementById( 'noSavePopUpPanelButton'   ).style.visibility = "visible";   

        //-----------------------------------------------
        // ask the question...
        //-----------------------------------------------
        document.getElementById( 'popUpPanel' ).innerHTML 
        = "<br>" 
        + "Do you want to save the current pool" 
        + "<br>" 
        + "before loading " + poolText + "?";
    }
}



//--------------------------------------
function requestToLoadPoolFromPreset()
{
    //console.log( "requestToLoadPool " + _chosenPoolToLoad );

    //----------------------------------------
    // get the name of the pool to load...
    //----------------------------------------
    let poolText = "(ERROR)";

         if ( _chosenPoolToLoad === SimulationStartMode.RANDOM         ) { poolText = "'random'";        }     
    else if ( _chosenPoolToLoad === SimulationStartMode.NEIGHBORHOOD   ) { poolText = "'neighborhood'";  }
    else if ( _chosenPoolToLoad === SimulationStartMode.FROGGIES       ) { poolText = "'froggies'";      }
    else if ( _chosenPoolToLoad === SimulationStartMode.TANGO          ) { poolText = "'tango'";         }
    else if ( _chosenPoolToLoad === SimulationStartMode.RACE           ) { poolText = "'race'";          }
    else if ( _chosenPoolToLoad === SimulationStartMode.BIG_BANG       ) { poolText = "'big bang'";      }
    else if ( _chosenPoolToLoad === SimulationStartMode.BAD_PARENTS    ) { poolText = "'bad parents'";   }
    else if ( _chosenPoolToLoad === SimulationStartMode.EMPTY          ) { poolText = "'empty'";         }
    //else if ( _chosenPoolToLoad === SimulationStartMode.FILE           ) { poolText = "from file";       }

    //-----------------------------------------------
    // make the appropriate UI elements visible...
    //-----------------------------------------------
    document.getElementById( 'popUpPanel'               ).style.visibility = "visible";   
    document.getElementById( 'cancelPopUpPanelButton'   ).style.visibility = "visible";
    document.getElementById( 'savePopUpPanelButton'     ).style.visibility = "visible";   
    document.getElementById( 'noSavePopUpPanelButton'   ).style.visibility = "visible";   

    //-----------------------------------------------
    // ask the question...
    //-----------------------------------------------
    document.getElementById( 'popUpPanel' ).innerHTML 
    = "<br>" 
    + "Do you want to save the current pool" 
    + "<br>" 
    + "before loading " + poolText + "?";
}



//----------------------------------
function switchToChosenPresetPool()
{
    //console.log( "switchToChosenPresetPool" );

    closePopupPanel();
    genePool.startSimulation( _chosenPoolToLoad ); 
    clearViewMode(); 
    updateEcosystemUI(); 
    _graph.initialize(); 
}


//--------------------------------
function loadSwimbotFromPreset(p)
{
    let genes = genePool.getPresetGenotype(p);
    genePool.createNewSwimbotWithGenes( genes );
}



//------------------------------------------------------
function setGeneTweakCategory( selectedSwimbotID, c )
{    
    _tweakGenesCategory = c;    
    updateGeneSliders( selectedSwimbotID );//
    //console.log( "_tweakGenesCategory = " + _tweakGenesCategory );
}


//---------------------------------------------
function tweakGene( swimbotIndex, sliderIndex )
{    
    let geneIndex = sliderIndex;
    
    if ( sliderIndex > 1 )
    {
        geneIndex += genePool.getNumGenesPerCategory() * _tweakGenesCategory;   
    }
    
    //-----------------------------------------
    // get the gene value...
    //-----------------------------------------
    //console.log( "geneIndex = " + geneIndex );

    let id = "geneTweaker" + sliderIndex;
 
    //console.log( id );
    
    let input = document.getElementById( id );

    let geneValue = input.value;

    //----------------------------------------------------------
    // update the gene value in the simulation...
    //----------------------------------------------------------
    genePool.tweakGene( swimbotIndex, geneIndex, geneValue );
        
    //----------------------------------------------------------
    // update the html that displays the value...
    //----------------------------------------------------------
    id = "gene" + sliderIndex + "Value";
    document.getElementById( id ).innerHTML = geneValue;
}


//----------------------------
function openInfoPanel()
{		    
    document.getElementById( 'infoPanel' ).style.visibility = 'visible'; 
    document.getElementById( 'infoText'  ).style.visibility = 'visible';
    
    //let the current page load up
    setInfoPage( _currentInfoPage );
}


//---------------------------------------
function advanceInfoPage( increment )
{		    
    _currentInfoPage += increment;    
    
    if ( _currentInfoPage < FIRST_INFO_PAGE )
    {
        _currentInfoPage = FIRST_INFO_PAGE;
    }

    if ( _currentInfoPage > LAST_INFO_PAGE )
    {
        _currentInfoPage = LAST_INFO_PAGE;
    }

    setInfoPage( _currentInfoPage );
}




//---------------------------------------------
function setInfoPage( pageNumber )
{
    document.getElementById( 'pageNumberLabel'  ).innerHTML = "page " + _currentInfoPage + " of 28";
    document.getElementById( "infoText"         ).innerHTML = getInfoText( _currentInfoPage );    

    if ( _currentInfoPage === FIRST_INFO_PAGE )
    {
        document.getElementById( 'prevInfoButton' ).style.visibility = 'hidden'
    }
    else
    {
        document.getElementById( 'prevInfoButton' ).style.visibility = 'visible'
    }

    if ( _currentInfoPage === LAST_INFO_PAGE )
    {
        document.getElementById( 'nextInfoButton' ).style.visibility = 'hidden'
    }
    else
    {
        document.getElementById( 'nextInfoButton' ).style.visibility = 'visible'
    }
}



//-----------------------
function updateUI()
{
    //console.log( "updateUI" );
    
    //-----------------------------------------------------------------------------------
    // check that we have a genePool......
    //-----------------------------------------------------------------------------------
    let genePoolIsDefined = typeof genePool != 'undefined';
    
    if ( genePoolIsDefined )
    {    
        //-----------------------------------------------------------------------------------
        // update the view buttons...
        //-----------------------------------------------------------------------------------
        //console.log( "ui.js: updateUI: genePool.getViewMode() = " + genePool.getViewMode() ); 
    
        if ( genePool.getViewMode() === ViewMode.NULL )
        {
            clearViewModeButtons();
        }
    
        //-----------------------------------------------------------------------------------
        // update the swimbot panel....
        //-----------------------------------------------------------------------------------
        if ( document.getElementById( 'swimbotPanel' ).style.visibility === 'visible' )
        {
            let selectedSwimbot = genePool.getSelectedSwimbotID();
        
            if ( selectedSwimbot === NULL_INDEX )
            {
                document.getElementById( 'selectedSwimbotPanel'   ).style.visibility = 'hidden';		        	        
                document.getElementById( 'noSelectedSwimbotPanel' ).style.visibility = 'visible';	        	        
            }
            else
            {
                document.getElementById( 'selectedSwimbotPanel'   ).style.visibility = 'visible';		        	        
                document.getElementById( 'noSelectedSwimbotPanel' ).style.visibility = 'hidden';	
            
                let brainState = genePool.getSwimbotBrainState( selectedSwimbot );
                let mateString = genePool.getSwimbotChosenMate( selectedSwimbot ).toString();
                let goalDescription = "";

                     if ( brainState ===  BRAIN_STATE_RESTING            ) { goalDescription = "resting";                       }
                else if ( brainState ===  BRAIN_STATE_LOOKING_FOR_MATE   ) { goalDescription = "looking for mate";              }
                else if ( brainState ===  BRAIN_STATE_PURSUING_MATE      ) { goalDescription = "pursuing mate " + mateString;   }
                else if ( brainState ===  BRAIN_STATE_LOOKING_FOR_FOOD   ) { goalDescription = "looking for food bit";          }
                else if ( brainState ===  BRAIN_STATE_PURSUING_FOOD      ) { goalDescription = "pursuing food bit";             }
            
                document.getElementById( 'swimbotDataPanel' ).innerHTML
                = "<br>"
                + "ID = " + genePool.getSwimbotIndex( selectedSwimbot ).toString()
                + "<br>"
                + "age = " + genePool.getSwimbotAge( selectedSwimbot ).toString()
                + "<br>"
                + "goal = " + goalDescription
                + "<br>"
                + "energy = " + Math.floor( genePool.getSwimbotEnergy( selectedSwimbot ).toString() )
                + "<br>"
                + "food bits eaten = " + Math.floor( genePool.getSwimbotNumFoodBitsEaten( selectedSwimbot ).toString() )
                + "<br>"
                + "num offspring = " + Math.floor( genePool.getSwimbotNumOffspring( selectedSwimbot ).toString() )
                + "<br>"
                + "sexual attraction = " + genePool.getSwimbotAttractionDescription( selectedSwimbot );
            }              
        }

        //-----------------------------------------------------------------------------------
        // always update the graph....
        //-----------------------------------------------------------------------------------
        if ( genePoolIsDefined )
        {    
            _graph.update( genePool.getTimeStep(), genePool.getNumSwimbots(), genePool.getNumFoodBits() );
        }
    
        //-----------------------------------------------------------------------------------
        // render the graph....
        //-----------------------------------------------------------------------------------
        if ( document.getElementById( 'graphPanel' ).style.visibility === 'visible' )
        {
            document.getElementById( 'graphData' ).innerHTML
            = "time step: " + genePool.getTimeStep()
            + "<br>"
            + "swimbots: " + genePool.getNumSwimbots()
            + "<br>"
            + "food bits: " + genePool.getNumFoodBits();
            
            _graph.render();
        }
    }
    
    //---------------------------
    // trigger next update...
    //---------------------------
    //this.timer = setTimeout( "updateUI()", 100 );
    setTimeout( "updateUI()", 500 );
}	


//----------------------------------------
function notifyGeneTweakPanelMouseDown()
{ 
    let selectedSwimbotID = genePool.getSelectedSwimbotID();
    
    if ( selectedSwimbotID === -1 )
    {
        console.log( "NULL" );
        closeTweakGenesPanel();
    }
    else
    {
        if ( document.getElementById( 'tweakGenesPanel' ).style.visibility === 'visible' )
        {		        	        
            console.log( selectedSwimbotID );
            openTweakGenesPanel( selectedSwimbotID );
        }
    }
}



//----------------------
// under construction
//----------------------
function resize()
{ 
    let rightMargin = 400;

    // I can't get this to work...
    /*
    let masterPanel = document.getElementById( "masterPanel" );
    let masterPanelStyle = window.getComputedStyle( masterPanel, null );
    console.log( masterPanelStyle.width.toString() )      
    let rightMargin = masterPanelStyle.width;
    */

    let width  = window.innerWidth  - rightMargin;
    let height = window.innerHeight;
    
//if ( width  < rightMargin ) { width = rightMargin; }
    
    canvasID.width  = width;
    canvasID.height = height - 15;
    
///temp fix until I fix the simulation to take non-square proportions    
//canvasID.height = canvasID.width;    // make it square...

//canvasID.width = canvasID.height;
    
    let genePoolIsDefined = typeof genePool != 'undefined';
    if ( genePoolIsDefined )
    {    
        genePool.setCanvasDimensions( canvasID.width, canvasID.height );  
    }

    // this successfully places an image in the background, and I can use clearRect 
    // instead of fillrect in pool.render, but I don't yet know how to make the image scroll.
    
    /*
    canvasID.style.backgroundImage = "url( 'images/background.png' )";  
    canvasID.style.backgroundSize = canvasID.width + "px " + canvasID.height + "px";        
    canvasID.style.backgroundRepeat = "no-repeat";    
    */
    
}


//------------------------------------------------------------
document.getElementById( 'Canvas' ).onmousedown = function(e) 
{
    clearViewMode();

    genePool.touchDown( e.pageX - document.getElementById( 'Canvas' ).offsetLeft, e.pageY - document.getElementById( 'Canvas' ).offsetTop );  
    
    notifyGeneTweakPanelMouseDown();
}

//------------------------------------------------------------
document.getElementById( 'Canvas' ).onmousemove = function(e) 
{
    genePool.touchMove( e.pageX - document.getElementById( 'Canvas' ).offsetLeft, e.pageY - document.getElementById( 'Canvas' ).offsetTop );
}

//------------------------------------------------------------
document.getElementById( 'Canvas' ).onmouseup = function(e) 
{
    genePool.touchUp( e.pageX - document.getElementById( 'Canvas' ).offsetLeft, e.pageY - document.getElementById( 'Canvas' ).offsetTop );
} 			

//------------------------------------------------------------
document.getElementById( 'Canvas' ).onmouseout = function(e) 
{
    genePool.touchOut( e.pageX - document.getElementById( 'Canvas' ).offsetLeft, e.pageY - document.getElementById( 'Canvas' ).offsetTop );
} 			


/*
//-------------------------------------------------------------------
// This is a rather hacky way of getting a two-finger translational
// gesture (a 2D vector) to be used for scrolling and stuff
//-------------------------------------------------------------------
window.onwheel = function(e) 
{
    genePool.touchTwoFingerMove(e); 
    //e.preventDefault();
}
*/

//--------------------------------
// key down
//--------------------------------
document.onkeydown = function(e) 
{
    e = e || window.event;
    
    //-----------------------------
    // keys for camera navigation
    //-----------------------------
    let cameraNavAction = -1; 
    
    if ( e.keyCode ===  37 ) { cameraNavAction = CameraNavigationAction.LEFT;    } // left arrow key
    if ( e.keyCode ===  39 ) { cameraNavAction = CameraNavigationAction.RIGHT;   } // right arrow key
    if ( e.keyCode ===  38 ) { cameraNavAction = CameraNavigationAction.UP;      } // up arrow key
    if ( e.keyCode ===  40 ) { cameraNavAction = CameraNavigationAction.DOWN;    } // down arrow key
    if ( e.keyCode ===  61 ) { cameraNavAction = CameraNavigationAction.IN;      } // plus key
    if ( e.keyCode === 173 ) { cameraNavAction = CameraNavigationAction.OUT;     } // minus key

    //apparently, Chrome and Safari  use different key codes...
    if ( e.keyCode === 187 ) { cameraNavAction = CameraNavigationAction.IN;      } // plus key
    if ( e.keyCode === 189 ) { cameraNavAction = CameraNavigationAction.OUT;     } // minus key
    
    if ( cameraNavAction != -1 )
    {
        if ( ! genePool.getCameraNavigationActive( cameraNavAction ) ) 
        { 
            genePool.startCameraNavigation( cameraNavAction );
            clearViewMode(); 
        }
    }
    
    //-----------------------------
    // other key pres events
    //-----------------------------
    /*
    if ( e.keyCode === 75 ) // K key
    { 
        let selectedSwimbot = genePool.getSelectedSwimbotID();
        if ( selectedSwimbot != -1 )
        {
            genePool.killSwimbot( selectedSwimbot ); 
        } 
    }
    if ( e.keyCode === 67 ) // C key
    { 
        let selectedSwimbot = genePool.getSelectedSwimbotID();
        if ( selectedSwimbot != -1 )
        {
            genePool.cloneSwimbot( selectedSwimbot ); 
        } 
    }
    */
    
                            
    //console.log( "onkeydown " + e.keyCode );
}

//------------------------------
document.onkeyup = function(e) 
{
    genePool.stopCameraNavigation( CameraNavigationAction.LEFT  );
    genePool.stopCameraNavigation( CameraNavigationAction.RIGHT );
    genePool.stopCameraNavigation( CameraNavigationAction.UP    );
    genePool.stopCameraNavigation( CameraNavigationAction.DOWN  );
    genePool.stopCameraNavigation( CameraNavigationAction.IN    );
    genePool.stopCameraNavigation( CameraNavigationAction.LEFT  );
};      
