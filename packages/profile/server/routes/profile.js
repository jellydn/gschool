'use strict';
var profiles = require('../controllers/profiles');

// The Package is past automatically as first parameter
module.exports = function(Profile, app, auth, database) {

    app.route('/upload/avatar').post(auth.requiresLogin,profiles.upload);

};
