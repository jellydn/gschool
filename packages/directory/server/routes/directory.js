'use strict';

var directories = require('../controllers/directories');



// The Package is past automatically as first parameter
module.exports = function(Directory, app, auth, database) {

    app.route('/users')
        .get(directories.all);

};
