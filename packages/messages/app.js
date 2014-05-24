'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Messages = new Module('Messages');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Messages.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    Messages.routes(app, auth, database);

    /*
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Messages.settings({
	'someSetting': 'some value'
    }, function(err, settings) {
	//you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Messages.settings({
	'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Messages.settings(function(err, settings) {
	//you now have the settings object
    });
    */

    return Messages;
});
