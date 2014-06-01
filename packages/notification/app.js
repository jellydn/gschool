'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Notification = new Module('Notification');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Notification.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    Notification.routes(app, auth, database);
    return Notification;
});
