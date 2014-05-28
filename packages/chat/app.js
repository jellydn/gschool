'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Chat = new Module('Chat');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Chat.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    Chat.routes(app, auth, database);

    //We are adding a link to the main menu for all authenticated users

    return Chat;
});
