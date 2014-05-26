'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Notes = new Module('Notes');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Notes.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    Notes.routes(app, auth, database);

    return Notes;
});
