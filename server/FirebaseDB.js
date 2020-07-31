class FirebaseDB 
{
    constructor
    ( 
        collectionNames  /* ['swimbots', 'pools'] */ ,
        onLoadedCallback /* function */
    ) 
    {
        firebase.initializeApp( config );
        this.onLoadedCallback = onLoadedCallback;
        this.db = firebase.database();
        this.dbRef = this.db.ref();
        this.refMap = {};
        this.loadedLookupTable = {};

        // for each collection name, get a list of the lookup table for that collection.
        // for example, for "swimbots" get "swimbotsLookup"
        collectionNames.forEach
        (
            name => 
            {
                const nameLookup = name + 'Lookup';
                const refLookup = this.dbRef.child( nameLookup );
                this.refMap[ nameLookup ] = refLookup;

                refLookup.on
                ( 
                    "value", 
                    snap => 
                    {
                        let collection = [];
                        snap.forEach
                        (
                            childSnap => 
                            {
                                collection.push( childSnap.val() );
                            }
                        );
                        
                        // call the callback with the lookup table
                        this.loadedLookupTable[ name ] = collection;
                        onLoadedCallback( nameLookup, collection );
                    }
                );

                const ref = this.dbRef.child( name );
                this.refMap[ name ] = ref;
            }
        );
    }

    //---------------------------------------
    // get the lookup table for a collection
    //---------------------------------------
    getLookupTable( collection ) 
    {
        return this.loadedLookupTable[ collection ];
    }



    //--------------------------------------------------------------------
    // load an item from the database (using an id and a collection name)
    //--------------------------------------------------------------------
    loadObject( collectionName, id, callback ) 
    {
        const self = this;
        
        let ref = collectionName + '/' + id;
        
        //console.log( "FirebaseDB.js:loadObject: attempting to load object with reference '" + ref + "'" );
    
        let obj = this.db.ref( ref );
    
        obj.on
        ( 
            'value', 
            function ( snapshot ) 
            {
                let data = snapshot.val();
                
                if ( data ) 
                {
                    //console.log( "callback" );
                    callback( data );
                }
            }
        );
    }




    //-----------------------------------------------------------------
    // add an item to the database (add data to a collection)
    //-----------------------------------------------------------------
    add( collectionName, data ) 
    {
        const refLookup = this.refMap[ collectionName + 'Lookup' ];
        
        this.refMap[ collectionName ].push
        (
            data, 
            function ( error ) 
            {
                if ( error != null )
                {
                    alert( "error in FirebaseDB.js: add function" );
                }
                
                //console.log( "FirebaseDB.js:add: preparing to add the following object:" );
                //console.log( JSON.stringify( data ) );
            }
        ).then
        (
            function( snap ) 
            {
                refLookup.push
                (
                    {
                        key:  snap.key,
                        name: data.name,
                        user: data.user,
                        date: data.date,
                    }
                );
            }
        );
    }
    
    //--------------------------------------------------
    // don't do this unless you really have to!!!
    //--------------------------------------------------
    clearAll() 
    {
        this.dbRef.set('/', null);
    }
    
  
};