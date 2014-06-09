'use strict';
var grades = require('../controllers/grades');

// The Package is past automatically as first parameter
module.exports = function(Question, app, auth, database) {

     app.route('/grades')
        .get(grades.all).post(auth.requiresLogin, grades.create);
};
