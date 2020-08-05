$( 
    function() 
    {
        // Handler for .ready() 

        // Initialize Firebase

        const collections = [ 'swimbots', 'pools' ];

        const firebaseCallback = 
        function( key, data ) 
        {
            let name = key.split('/')[0];

            switch ( name ) 
            {
                case 'swimbotsLookup':
                case 'poolsLookup':
                    // lookup table loaded - maybe we don 't care
                    $( '#' + name + '-data' ).html( JSON.stringify( data, null, 2 ) );
                    break;

                case 'swimbots':
                case 'pools':
                    // individual swimbot / pool loaded
                    $( '#' + name + '-data' ).html( JSON.stringify( data, null, 2 ) );
            }
        };

        let fb = new FirebaseDB( collections, firebaseCallback );

        // handle clear all button
        $( '#btn-clean-all' ).click 
        ( 
            function() 
            {
                fb.clearAll();
                window.location.reload();
            }
        );
    }
);