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

const InputMode = 
{
    NULL                        : -1,
    LOAD_SWIMBOT_FROM_PRESET    :  0,
    LOAD_SWIMBOT_FROM_FILE      :  1,
    SAVE_SWIMBOT                :  2,
    LOAD_POOL_FROM_PRESET       :  3,
    LOAD_POOL_FROM_FILE         :  4,
    SAVE_POOL                   :  5
};

/*
//----------------------------------------------
// There are two collections in the database...
//----------------------------------------------
const collections = [ 'swimbots', 'pools' ];
*/

//----------------------------------------------------------
// Is this needed? 
//----------------------------------------------------------
//const firebaseCallback = function ( key, data ) 
{
    //console.log( "firebaseCallback: " + name );

    /*
    let name = key.split('/')[0];

    switch ( name )
    {
        case 'swimbotsLookup':
        case 'poolsLookup':
        case 'swimbots':
        case 'pools':
    }
    */
};


let _inputFilenameString    = "";
//let _inputEmailString       = "";
//let _inputPasswordString    = "";
let _inputMode              = InputMode.NULL;
//let _creatingNewAccount     = false;
//let _username               = "anonymous"; 
//let _savedBeforeLoad        = false;
let _chosenPoolToLoad       = 0;
//let _database               = new FirebaseDB( collections, firebaseCallback );

//console.log("_savedBeforeLoad = " + _savedBeforeLoad );
//console.log( "_inputMode = " + _inputMode );




/*
//-------------------------------------
// is there a user logged in? 
//-------------------------------------
firebase.auth().onAuthStateChanged
(
    function( user ) 
    {
        if ( user ) 
        {
            _username = firebase.auth().currentUser.email;
            console.log( _username + "' is signed in" );
        } 
        else
        {
            console.log( "There is no user signed in" );
            _username = "anonymous";
        }
    }
);
*/



/*
//----------------------------
// create an account
//----------------------------
function createAccount()
{
    if ( _username === "anonymous" )
    {
        //console.log( "createAccount" );
    
        //document.getElementById( 'accountButton'            ).style.visibility = "hidden";  
        document.getElementById( 'accountPanel'             ).style.visibility = "visible";  
        document.getElementById( 'accountEmailInput'        ).style.visibility = "visible";
        document.getElementById( 'accountPasswordInput'     ).style.visibility = "visible";
        document.getElementById( 'cancelAccountPanelButton' ).style.visibility = "visible";    
        document.getElementById( 'submitAccountButton'      ).style.visibility = "visible";   
        document.getElementById( 'accountEmailInput'        ).focus();     
        document.getElementById( 'submitAccountButton'      ).innerHTML = "create";
        document.getElementById( 'accountPanel'             ).innerHTML 
        = "<big><big>Create a new account</big></big>"
        + "<br>"
        + "<br>"
        + "(creating a user account allows you to"
        + "<br>"
        + "save and load pools and swimbots)"
        + "<br>"
        + "<br>"
        + "<br>"
        + "enter a valid email address:"
        + "<br>"
        + "<br>"
        + "<br>"
        + "<br>"
        + "create a password:"

        _creatingNewAccount  = true;
        _inputEmailString    = "";
        _inputPasswordString = "";
        document.getElementById( "accountEmailInput"    ).value = "";
        document.getElementById( "accountPasswordInput" ).value = "";
    }
}


//----------------------------------------------------------
// sign in or out (on or off) to/from an existing account
//----------------------------------------------------------
function signOnOrOff()
{
    console.log( "signOnOrOff" );
    //console.log( "_inputEmailString = " + _inputEmailString );
    console.log( "firebase.auth().currentUser = " + firebase.auth().currentUser );
    
    //let user2 = firebase.auth().currentUser;

    //---------------------------------------------------
    // make sure there is no one currently logged in...
    //---------------------------------------------------
    if ( _username === "anonymous" )
    {
        console.log( "signIn" );
        
        document.getElementById( 'accountPanel'             ).style.visibility = "visible";  
        document.getElementById( 'accountEmailInput'        ).style.visibility = "visible";
        document.getElementById( 'accountPasswordInput'     ).style.visibility = "visible";
        document.getElementById( 'cancelAccountPanelButton' ).style.visibility = "visible";    
        document.getElementById( 'submitAccountButton'      ).style.visibility = "visible";   
        document.getElementById( 'submitAccountButton'      ).innerHTML = "sign in";
        document.getElementById( 'accountEmailInput'        ).focus();     
        document.getElementById( 'accountPanel'             ).innerHTML 
        = "<big><big>Sign-in</big></big>"
        + "<br>"
        + "<br>"
        + "<br>"
        + "sign in with the email and password for your account:"
        + "<br>"
        + "<br>"
        + "<br>"
        + "enter your email address:"
        + "<br>"
        + "<br>"
        + "<br>"
        + "<br>"
        + "enter your password:";
    
        _creatingNewAccount  = false;
        _inputEmailString    = "";
        _inputPasswordString = "";
        document.getElementById( "accountEmailInput"    ).value = "";
        document.getElementById( "accountPasswordInput" ).value = "";    
    }
    else
    {
        signOut();
    }        
}



//-------------------------------
// sign out 
//-------------------------------
function signOut()
{
    firebase.auth().signOut().then
    (
        function() 
        {
            console.log( "signout successful" );
            
            _username = "anonymous";

            //---------------------------------------------------------------------------
            // change the account button names to reflect the user being logged on...
            //---------------------------------------------------------------------------
            document.getElementById( "accountButton" ).innerHTML = "create account";
            document.getElementById( "loginButton"   ).innerHTML = "sign in";
        }
    ).catch
    (
        function(error) 
        {
            console.log( "error in signout!" );
        }
    );
}



//---------------------------------------
function addToAccountEmailInputString(e)
{
    //-------------------------------------------------
    // characters accumulate as the user types keys...
    //-------------------------------------------------
	_inputEmailString = e.currentTarget.value;
		
	if ( e.key === 'Enter' )
	{
	    submitAccountInput();
	}
}

//------------------------------------------
function addToAccountPasswordInputString(e)
{
    //-------------------------------------------------
    // characters accumulate as the user types keys...
    //-------------------------------------------------
	_inputPasswordString = e.currentTarget.value;
		
	if ( e.key === 'Enter' )
	{
	    submitAccountInput();
	}
}
*/

//-----------------------------------
function addToFilenameInputString(e)
{
    //-------------------------------------------------
    // characters accumulate as the user types keys...
    //-------------------------------------------------
	_inputFilenameString = e.currentTarget.value;
		
	if ( e.key === 'Enter' )
	{
	    submitFilenameInput();
	}
}


/*
//-------------------------------
function submitAccountInput()
{
    console.log( "submitAccountInput: " + _inputEmailString + ", " + _inputPasswordString );
    
    //-------------------------------------------------------------------------------------------
    // the user has entered an email address and password in order to create a new account...
    //-------------------------------------------------------------------------------------------
    if ( _creatingNewAccount )
    {
        firebase.auth().createUserWithEmailAndPassword( _inputEmailString, _inputPasswordString )
        .then
        (
            function( firebaseUser ) 
            {
                notifySuccessInCreatingAccount( firebaseUser );
            }
        )
        .catch
        (
            function( error ) 
            {
                notifyErrorInCreatingAccount( error )
            }
        );
    }
    //----------------------------------------------------------------------------------------------------------
    // the user has entered an email address and password in order to sign in with an existing account...
    //----------------------------------------------------------------------------------------------------------
    else
    {    
        firebase.auth().signInWithEmailAndPassword( _inputEmailString, _inputPasswordString )
                
        .then
        (
            function( firebaseUser ) 
            {
                notifySuccessInSigningIn( firebaseUser );
            }
        )
        
        .catch
        (
            function( error ) 
            {
                notifyErrorInSigningIn( error );
             }
        );
    }
}



//------------------------------------------------------
function notifySuccessInCreatingAccount( firebaseUser )
{
    console.log( "Account created successfully" );

    document.getElementById( 'accountEmailInput'        ).style.visibility = "hidden";
    document.getElementById( 'accountPasswordInput'     ).style.visibility = "hidden"; 
    document.getElementById( 'submitAccountButton'      ).style.visibility = "hidden";   
    
    document.getElementById( 'accountPanel' ).innerHTML 
    = "<big>Your account was created successfully</big>"
    + "<br>"
    + "<br>"
    //+ "user: " + firebaseUser;
    + "user: '" + _inputEmailString + "'"
    + "<br>"
    + "<br>"
    + "Please sign in with your email address and password ";
}



//-------------------------------------------------
function notifySuccessInSigningIn( firebaseUser )
{                
    console.log( "Successfully signed in:" );
    console.log( "firebaseUser = " + firebaseUser );
    
    let _username = firebase.auth().currentUser.email;
    
    //console.log( user );
    console.log( "_username = " + _username );
    
    //_username = "we need to get the username from Firebase"; //_inputEmailString;
    
    
//FirebaseUser user = FirebaseAuth.getInstance().getCurrentUser();
//let email = user.getEmail();   
    
//let email = user.getAuth().password.email;    
    
//let email = firebase.auth().currentUser.providerData[0].providerId    
//console.log( "email = " + email );     
    
    document.getElementById( 'loginButton'              ).style.visibility = "visible";  
    document.getElementById( 'accountPanel'             ).style.visibility = "hidden";  
    document.getElementById( 'accountEmailInput'        ).style.visibility = "hidden";
    document.getElementById( 'accountPasswordInput'     ).style.visibility = "hidden";
    document.getElementById( 'cancelAccountPanelButton' ).style.visibility = "hidden";    
    document.getElementById( 'submitAccountButton'      ).style.visibility = "hidden";   
    
    //-------------------------------------------------------------------
    // change the "create account" button text to the username...
    //-------------------------------------------------------------------
    document.getElementById( "accountButton" ).innerHTML = _username;
    document.getElementById( "loginButton"   ).innerHTML = "sign off";
}


//-------------------------------------------------
function notifyErrorInCreatingAccount( error )
{
    console.log( "oops! error in 'createUserWithEmailAndPassword'" );
    console.log( "errorCode = " + error.code );
    console.log( "errorMessage = " + error.message );        

    //document.getElementById( 'loginButton'              ).style.visibility = "hidden";  
    document.getElementById( 'accountPanel'             ).style.visibility = "visible";  
    document.getElementById( 'accountEmailInput'        ).style.visibility = "visible";
    document.getElementById( 'accountPasswordInput'     ).style.visibility = "visible";
    document.getElementById( 'cancelAccountPanelButton' ).style.visibility = "visible";    
    document.getElementById( 'submitAccountButton'      ).style.visibility = "visible";   
    document.getElementById( 'submitAccountButton'      ).innerHTML = "create";
    document.getElementById( 'accountEmailInput'        ).focus();     
    document.getElementById( 'accountPanel'             ).innerHTML 
    = "<big><big>Create a new account</big></big>"
    + "<br>"
    + "<br>"
    + "<font size = 3 color = '#990000' face='arial'>Error ..." + " '" + error.message + "'</font>"
    + "<br>"
    + "<br>"
    + "enter a valid email address:"
    + "<br>"
    + "<br>"
    + "<br>"
    + "<br>"
    + "create a password:"
}


//-------------------------------------------------
function notifyErrorInSigningIn( error )
{               
    console.log( "oops! error in 'signInWithEmailAndPassword'" );
    console.log( "errorCode = " + error.code );
    console.log( "errorMessage = " + error.message );

    //document.getElementById( 'loginButton'              ).style.visibility = "hidden";  
    document.getElementById( 'accountPanel'             ).style.visibility = "visible";  
    document.getElementById( 'accountEmailInput'        ).style.visibility = "visible";
    document.getElementById( 'accountPasswordInput'     ).style.visibility = "visible";
    document.getElementById( 'cancelAccountPanelButton' ).style.visibility = "visible";    
    document.getElementById( 'submitAccountButton'      ).style.visibility = "visible";   
    document.getElementById( 'submitAccountButton'      ).innerHTML = "sign in";
    document.getElementById( 'accountEmailInput'        ).focus();     
    document.getElementById( 'accountPanel'             ).innerHTML 
    = "<big><big>Sign-in</big></big>"
    + "<br>"
    + "<br>"
    + "<font size = 3 color = '#990000' face='arial'>Error ..." + " '" + error.message + "'</font>"
    + "<br>"
    + "<br>"
    + "enter your email address:"
    + "<br>"
    + "<br>"
    + "<br>"
    + "<br>"
    + "enter your password:";
}


//----------------------------
function getCurrentUser()
{        
    firebase.auth().onAuthStateChanged
    (
        function( user ) 
        {
            if ( user ) 
            {
                // User is signed in.
            } 
            else
            {
                // No user is signed in.
            }
        }
    );
}
*/


//------------------------------
function submitFilenameInput()
{
    //console.log( "submitFilenameInput" );

    if ( _savedBeforeLoad )
    {
        //--------------------------------------------------------
        // This handles the case in which the user had chosen to 
        // save the current pool before loading a new one....
        //---------------------------------------------------------
        // visibility of this button is not being handled correctly yet        
//document.getElementById( 'dataDisplayButton' ).style.visibility = "hidden";   
        //console.log( "loadPool" );
        loadPool();        
        _savedBeforeLoad = false;
        //console.log( "_savedBeforeLoad = " + _savedBeforeLoad );

        //----------------------------------------------
        // set input mode to LOAD_POOL_FROM_FILE
        //----------------------------------------------
        _inputMode = InputMode.LOAD_POOL_FROM_FILE;
    }
    else
    {    
        //-------------------------------------------------------
        // load swimbot
        //-------------------------------------------------------
        if ( _inputMode === InputMode.LOAD_SWIMBOT_FROM_FILE )
        {
            console.log( 'LOAD_SWIMBOT_FROM_FILE: ' + _inputFilenameString );
        
            let swimbotLookup = _database.getLookupTable( 'swimbots' );

            let userOfSwimbot = "";

            //----------------------------------------------------------
            // find the key for the swimbot with the specified name
            //----------------------------------------------------------
            let swimbotToLoad = swimbotLookup.find
            (
                function ( swimbot ) 
                {
                    userOfSwimbot = swimbot.user;
                    return swimbot.name === _inputFilenameString;
                }
            );
            
            if (( swimbotToLoad )
            &&  ( userOfSwimbot === _username ))
            {
                //--------------------
                // found it :)
                //--------------------
                document.getElementById( 'PopUpPanelError' ).style.visibility = "visible";  
                document.getElementById( 'PopUpPanelError' ).style.borderWidth = 2; 
                document.getElementById( 'PopUpPanelError' ).style.borderColor = "#555555";
                document.getElementById( 'PopUpPanelError' ).innerHTML 
                = "<br>"
                + "&nbsp&nbsp loading data for swimbot '" + _inputFilenameString + "'";

                _database.loadObject
                (
                    'swimbots', 
                    swimbotToLoad.key, 
                
                    function( data ) 
                    {
                        if ( data ) 
                        {
                            genePool.createNewSwimbotWithGenes( data.genes );
                            closePopupPanel();
                            _inputFilenameString = "";
                        }
                    }
                );
            }
            else
            //--------------------
            // Did not find it!
            //--------------------
            {
                document.getElementById( 'cancelErrorButton' ).style.visibility = "visible";  
                  
                document.getElementById( 'PopUpPanelError' ).style.visibility = "visible";        
                document.getElementById( 'PopUpPanelError' ).style.borderWidth = 5; 
                document.getElementById( 'PopUpPanelError' ).style.borderColor = "#883300";
                document.getElementById( 'PopUpPanelError' ).innerHTML 
                = "<br>"
                + "&nbsp&nbsp ERROR:"
                + "<br>"
                + "&nbsp&nbsp Could not find swimbot file '" + _inputFilenameString + "'"
                + "<br>"
                + "&nbsp&nbsp Try a different name";
            }
        }

        //-------------------------------------------------------
        // save swimbot
        //-------------------------------------------------------
        else if ( _inputMode === InputMode.SAVE_SWIMBOT )
        {
            let selectedSwimbot = genePool.getSelectedSwimbotID();

            if ( selectedSwimbot != -1 )
            {
                console.log( 'SAVE_SWIMBOT: ' + _inputFilenameString );
            
                let date = new Date();
                let dateInSeconds = date.getTime();
            
                let genes = genePool.getSwimbotGenes( selectedSwimbot );
                let swimbotWithMetaData = ( { 'name': _inputFilenameString, 'date' : dateInSeconds, 'user': _username, 'genes': genes } );
            
                _database.add( 'swimbots', swimbotWithMetaData );            
                closePopupPanel();
                _inputFilenameString = "";
            }
        }
    
        //---------------------------------------------------
        // load pool
        //---------------------------------------------------
        else if ( _inputMode === InputMode.LOAD_POOL_FROM_FILE )
        {
            console.log( 'LOAD_POOL_FROM_FILE: ' + _inputFilenameString );
        
            let poolLookup = _database.getLookupTable( 'pools' );

            //----------------------------------------------------------
            // find the key for the pool with the specified name
            //----------------------------------------------------------
            let poolToLoad = poolLookup.find
            (
                function ( pool ) 
                {
                    return pool.name === _inputFilenameString;
                }
            );

            if ( poolToLoad ) 
            {
                document.getElementById( 'PopUpPanelError' ).style.visibility  = "visible";   
                document.getElementById( 'PopUpPanelError' ).style.borderWidth = 2; 
                document.getElementById( 'PopUpPanelError' ).style.borderColor = "#555555";
                document.getElementById( 'PopUpPanelError' ).innerHTML 
                = "<br>"
                + "&nbsp&nbsp loading data for pool '" + _inputFilenameString + "'";

                _database.loadObject
                (
                    'pools', 
                    poolToLoad.key, 
                
                    function( data ) 
                    {
                        if ( data ) 
                        {
                            genePool.setPoolData( data.pool );
                            closePopupPanel();
                            _inputFilenameString = "";
                        }
                    }
                );
            }       
            else
            {
                document.getElementById( 'PopUpPanelError' ).style.visibility  = "visible";  
                document.getElementById( 'PopUpPanelError' ).style.borderWidth = 5; 
                document.getElementById( 'PopUpPanelError' ).style.borderColor = "#883300";
                document.getElementById( 'PopUpPanelError' ).innerHTML 
                = "<br>"
                + "&nbsp&nbsp ERROR:"
                + "<br>"
                + "&nbsp&nbsp Could not find pool file '" + _inputFilenameString + "'"
                + "<br>"
                + "&nbsp&nbsp Try a different name";
            } 
        }
    
        //---------------------------------------------------
        // save pool
        //---------------------------------------------------
        else if ( _inputMode === InputMode.SAVE_POOL )
        {
            console.log( 'SAVE_POOL: ' + _inputFilenameString );
        
            let date = new Date();
            let dateInSeconds = date.getTime();
            let pool = genePool.getPoolData();      
        
            //console.log( pool );
        
            let poolWithMetaData = ( { 'name': _inputFilenameString, 'date': dateInSeconds, 'user': _username, 'pool': pool } );        
        
            _database.add( 'pools', poolWithMetaData );
            closePopupPanel();
            _inputFilenameString = "";
        }

        //----------------------------
        // cancel input mode
        //----------------------------
        _inputMode = InputMode.NULL;
    }

    //console.log( "_inputMode = " + _inputMode );
}



//--------------------------------------------------
// these four save/load calls are made from html...
//--------------------------------------------------


/*
//-------------------------------
function requestToSaveSwimbot()
{
    if ( _username === "anonymous" )
    {   
        showAccountRequiredPopup( "Cannot save swimbot" );
    }
    else
    {
        let selectedSwimbot = genePool.getSelectedSwimbotID();
    
        if ( selectedSwimbot != -1 )
        {
            openPopupPanelForInput( "Save selected swimbot genes to a file", InputMode.SAVE_SWIMBOT );               
        } 
    }
}


//---------------------------------------------
function requestToSavePool( savedBeforeLoad )
{
    if ( _username === "anonymous" )
    {   
        showAccountRequiredPopup( "Cannot save pool" );
    }
    else
    {
        _savedBeforeLoad = savedBeforeLoad; 
        //console.log( "_savedBeforeLoad = " + _savedBeforeLoad );
    
        openPopupPanelForInput( "Save the current pool to a file", InputMode.SAVE_POOL );               
    }
}

//--------------------------------------
function requestToLoadSwimbotFromFile()
{
*/

/*
// this is how to read a file that was uploaded using the fileInput element:
document.getElementById( 'fileInput' ).style.visibility = "visible";   

let selectedFile = document.getElementById('fileInput').files[0];
console.log( "selectedFile = ", selectedFile );
*/

/*

    if ( _username === "anonymous" )
    {   
        showAccountRequiredPopup( "Cannot load swimbot" );
    }
    else
    {
        openPopupPanelForInput( "Load in a new swimbot from a file", InputMode.LOAD_SWIMBOT_FROM_FILE );   
    }
}
*/


function readLocalFile( event )
{
    //console.log( event );
    
    let fileList = event.target.files;
    
    let file = fileList[0];    
    
    let reader = new FileReader();
    
    
    console.log( file );
}


/*
const inputElement = document.getElementById("fileInput");
inputElement.addEventListener("change", handleFiles, false);
function handleFiles() 
{
    console.log( "hello!" );

  const fileList = this.files; 
}
*/


//--------------------------
function printFamilyTree()
{


//------------------------------------------------------------
// This is a quick test to generating a phylogenetic tree. 
// I will remove this once I've got it working.  Aug.12.2021
//------------------------------------------------------------
genePool.generatePhyloTree();

    let w = window.open
    (
        "", 
        "swimbot data", 
        "left           = 400, \
         top            = 100, \
         width          = 600, \
         height         = 700, \
         status         = 0, \
         resizable      = 0, \
         channelmode    = 0, \
         menubar        = 0, \
         toolbar        = 0, \
         location       = 0, \
         titlebar       = 0" 
    );
    
    
    w.document.title = "Swimbot Data (copy and paste into a text file, then load into Gene Pool Lab)";

    let familyTree = genePool.getFamilyTree();
     
    //let f = JSON.stringify( { familyTree } );
    
    let f = "";

//for (let n=0; n<familyTree.getNumNodes(); n++)

//YO - this is Luka's change to cull the data so it is not too big...

let THROTTLE = 5;


for (let n=0; n<familyTree.getNumNodes(); n +=THROTTLE )
    {
        f += "swimbot index: " + n.toString();
        f += "<br>";
        f += "parent 1 index: " + familyTree.getNodeParent1Index(n).toString();
        f += "<br>";
        f += "parent 2 index: " + familyTree.getNodeParent2Index(n).toString();
        f += "<br>";
        f += "birth time: " + familyTree.getNodeBirthTime(n).toString();
        f += "<br>";
        f += "death time: " + familyTree.getNodeDeathTime(n).toString();
        f += "<br>";
        f += "genes: ";
        f += "<br>";

        let genes = familyTree.getNodeGenes(n);

        for (let g=0; g<genes.length; g++)
        {
            f += genes[g].toString();
            if ( g < genes.length - 1 ) 
            {
                f += ", ";
            }
        }

        f += "<br>";
        f += "<br>";
    }

    w.document.body.innerHTML = f;

    //-------------------------------------------------------------------
    // the following code displays the data in a div element:
    //-------------------------------------------------------------------
    /*
    document.getElementById( 'dataDisplay'      ).style.visibility = "visible"; 
    document.getElementById( 'closeDataDisplay' ).style.visibility = "visible"; 
    document.getElementById( 'dataDisplay'      ).innerHTML 
    = 
    "<br>" 
    + "<big>Swimbot Data</big>"
    + "<br>" 
    + "(This is a work in progress...these data are intended to be loaded into in the Gene Pool Lab)" 
    + "<br>" 
    + "<br>" 
    + 
    "(" + familyTree.getNumNodes().toString() + " swimbots)"
    + "<br>"
    + "<br>"
    + f;
    */
}



//--------------------
function loadPool()
{
    console.log( "loadPool!!!!" );
    
    if ( _chosenPoolToLoad === SimulationStartMode.FILE )
    {
        openPopupPanelForInput( "Load a new pool from a file", InputMode.LOAD_POOL_FROM_FILE );               
    }
    else
    {
        switchToChosenPresetPool();
    }
}


/*
//-----------------------------------------
function showAccountRequiredPopup( text )
{
    console.log( "oops - cannot save or load: user is '" + _username + "'" );
    
    document.getElementById( 'noSavePopUpPanelButton'   ).style.visibility = "hidden";   
    document.getElementById( 'savePopUpPanelButton'     ).style.visibility = "hidden";      
    
    document.getElementById( 'popUpPanel'               ).style.visibility = "visible";   
    document.getElementById( 'cancelPopUpPanelButton'   ).style.visibility = "visible";
    document.getElementById( 'popUpPanel' ).innerHTML
    = "<font size = 3 color = '#770000' face='arial'>" + text + "</font>"
    + "<br>"
    + "<br>"
    + "<font size = 3 color = '#770000' face='arial'>You must have an account and be signed-in.</font>" 
    + "<br>"
    + "<br>"
    + "<br>"
    + "<font size = 2 color = '#000000' face='arial'>If you don't have an account, select the 'create account' button at the upper-right. (It's free :)"
    + "<br>"
    + "<br>"
    + "Once you are signed in, you will be able to save and load swimbots and pools.</font>";
}
*/

//----------------------------------------------
function openPopupPanelForInput( text, mode )
{
    //-----------------------------------------------  
    // set the input mode to the incoming mode ...  
    //-----------------------------------------------  
    _inputMode = mode;   
    //console.log( "_inputMode = " + _inputMode );

    //----------------------------------------------------------------------------------    
    // make sure these are turned off  
    //----------------------------------------------------------------------------------   
    document.getElementById( 'noSavePopUpPanelButton'   ).style.visibility = "hidden";   
    document.getElementById( 'savePopUpPanelButton'     ).style.visibility = "hidden";  
    document.getElementById( 'dataDisplayButton'        ).style.visibility = "hidden";    


    //----------------------------------------------------------------------------------    
    // turn these on  
    //----------------------------------------------------------------------------------    
    document.getElementById( 'popUpPanel'               ).style.visibility = "visible";   
    document.getElementById( 'cancelPopUpPanelButton'   ).style.visibility = "visible";    
    document.getElementById( 'popUpPanelInput'          ).style.visibility = "visible";   
    document.getElementById( 'submitFilenameButton'     ).style.visibility = "visible";   
    
    
    //-------------------   
    // clear out  
    //-------------------   
//let innerHTML = "";
    
    
    
    /*
    let innerHTML = 
    text
    + "<br>"
    + "<br>"
    + "enter filename...";
    */
    
        
        /*
        innerHTML = 
        text
        + "<br>"
        + "<br>"
        + "choose from the list of saved swimbots:"
        + "<br>"
        + "<br>"
        + "<div style = 'position: absolute; overflow:auto; left: 25; width:300px; height:100px; border:1px solid #000000;' >";
        */
    
//document.getElementById( 'popUpPanel' ).appendChild( "ya ya" );    
    
    
    //----------------------------------------------------   
    // give focus to the input  
    //----------------------------------------------------   
    document.getElementById( "popUpPanelInput" ).focus();     

    // default case...
    document.getElementById( "popUpPanelInput"      ).style.top = "185px";         
    document.getElementById( "submitFilenameButton" ).style.top = "185px";     
    
    // not working in all cases...test it...
    if ( _inputMode === InputMode.SAVE_SWIMBOT )
    {
        document.getElementById( "loadedList"   ).style.visibility = "hidden";   
    
        //----------------------------------------------------   
        // add textual instructions...  
        //----------------------------------------------------   
        /*
        document.getElementById( "popUpPanelInput" ).innerHTML
        = text
        + "<br>"
        + "<br>"
        + "enter filename...";
        */

        document.getElementById( "PopupText" ).style.visibility = "visible";   
        document.getElementById( "PopupText" ).innerHTML 
        = text
        + "<br>"
        + "<br>"
        + "Name this swimbot...";

        //----------------------------------------------------   
        // give user option to display data...  
        //----------------------------------------------------   
        document.getElementById( 'dataDisplayButton'    ).style.visibility = "visible";   
    }
    else if ( _inputMode === InputMode.LOAD_SWIMBOT_FROM_FILE )
    {
        //----------------------------------------------------   
        // add textual instructions...  
        //---------------------------------------------------- 
        document.getElementById( "PopupText" ).style.visibility = "visible";   
        document.getElementById( "PopupText" ).innerHTML
        = text
        + "<br>"
        + "<br>"
        + "choose from the list of saved swimbots:"
        + "<br>"
        + "<br>";
        
        document.getElementById( "popUpPanelInput"      ).style.top = "290px";     
        document.getElementById( "submitFilenameButton" ).style.top = "290px";  
        
        //--------------------------------------------------------------------------
        // display the list of the swimbots that the user has previously loaded...
        //--------------------------------------------------------------------------
        document.getElementById( "loadedList" ).style.visibility = "visible";   
        document.getElementById( "loadedList" ).innerHTML = "";  
        
        let swimbotLookup = _database.getLookupTable( 'swimbots' );

        //console.log( "number of swimbots = " + swimbotLookup.length );
        //console.log( "my saved swimbots:" );
        for (let s=0; s<swimbotLookup.length; s++)
        {    
            if ( swimbotLookup[s].user === _username )
            {
                //------------------------------------------------
                // construct a button for this loaded swimbot...
                //------------------------------------------------
                let loadSwimbotButton = document.createElement( "BUTTON" );

                loadSwimbotButton.id = "swimbotLoadButton_" + s.toString();

                loadSwimbotButton.innerHTML = swimbotLookup[s].name 

                document.getElementById( "loadedList" ).appendChild( loadSwimbotButton );
                //document.getElementById( "loadedList" ).innerHTML += "<br>";

                loadSwimbotButton.onmousedown = function(e) 
                {
                    console.log( loadSwimbotButton.id );
                    _inputFilenameString = swimbotLookup[s].name;
                    document.getElementById('popUpPanelInput').value = swimbotLookup[s].name;
                }

                //var element = document.getElementById(elementId);
                //element.parentNode.removeChild(element);


                /*
                let a = document.createElement('a');
                let linkText = document.createTextNode( swimbotLookup[s].name );
                //a.appendChild(linkText);
                a.title = swimbotLookup[s].name;
                //a.href = "http://example.com";
                document.body.appendChild(a);   
                */


                /*          
                var a = document.createElement('a');
                var linkText = document.createTextNode("my title text");
                a.appendChild(linkText);
                a.title = "my title text";
                a.href = "http://example.com";
                document.body.appendChild(a);   
                */             
            }
        }
    }
    
    //-----------------------------------------  
    // add the inner html to the panel...  
    //-----------------------------------------
//document.getElementById( 'popUpPanel' ).innerHTML = innerHTML;

    //-----------------------------  
    // clear-out input string...  
    //-----------------------------  
    _inputFilenameString = "";
    document.getElementById('popUpPanelInput').value = '';
}






//--------------------------------
function displayData( filename )
{
    if ( _inputMode === InputMode.SAVE_SWIMBOT )
    {
        console.log( "showSwimbotGenes..." );
        showSwimbotGenes( genePool.getSelectedSwimbotID() );


        /*
        if ( selectedSwimbot != -1 )
        {        
            let genes = genePool.getSwimbotGenes( selectedSwimbot );        
            let json = JSON.stringify( { genes } );
            //console.log( json );
            
            document.getElementById( 'dataDisplay'      ).style.visibility = "visible"; 
            document.getElementById( 'closeDataDisplay' ).style.visibility = "visible"; 
            document.getElementById( 'dataDisplay'      ).innerHTML 
            = "Copy the text below, put it in a new text file, and then give"
            + "<br>" 
            + "the file a unique name ending in '.json' (example: 'my_swimbot.json')"
            + "<br>"
            + "<br>"
            + "_________________"
            + "<br>"
            + "<br>"
            + json;
        }
        */
    }
    else if ( _inputMode === InputMode.SAVE_POOL )
    {
        console.log( "show pool data..." );
        
        let pool = genePool.getPoolData();
        let json = JSON.stringify( { pool } );

        document.getElementById( 'dataDisplay'      ).style.visibility = "visible"; 
        document.getElementById( 'closeDataDisplay' ).style.visibility = "visible"; 
        document.getElementById( 'dataDisplay'      ).innerHTML
        = "Copy the text below, put it in a new text file, and then give"
        + "<br>" 
        + "the file a unique name ending in '.json' (example: 'my_pool.json')"
        + "<br>"
        + "<br>"
        + "_________________"
        + "<br>"
        + "<br>"
        + json;        
    }
}


//----------------------------
function showSwimbotGenes(s)
{
    if ( s != -1 )
    {        
        let genes = genePool.getSwimbotGenes(s);        
        let json = JSON.stringify( { genes } );
        //console.log( json );
    
        document.getElementById( 'dataDisplay'      ).style.visibility = "visible"; 
        document.getElementById( 'closeDataDisplay' ).style.visibility = "visible"; 
        document.getElementById( 'dataDisplay'      ).innerHTML 
        = "<br>" 
        + "<big><b>Save genes of swimbot " + s.toString() + "</b></big>"
        + "<br>" 
        + "<br>" 
        + "Please copy the genetic data below and put it in an "
        + "<br>"
        + "empty text file. Give it a cool name and save it."
        + "<br>"
        + "<br>"
        + "This is formatted as JSON, which is required "
        + "<br>"
        + "for it to be loaded back into the pool."
        + "<br>"
        + "<br>"
        + "<br>"
        + "<br>"
        + json;
    }
}


//----------------------------
function closeDataDisplay()
{
    document.getElementById( 'dataDisplay'      ).style.visibility = "hidden"; 
    document.getElementById( 'closeDataDisplay' ).style.visibility = "hidden"; 
}

