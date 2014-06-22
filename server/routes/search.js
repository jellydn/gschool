'use strict';

module.exports = function(app) {

    // Home route
    var searches = require('../controllers/searches');

    app.route('/search')
        .post(searches.search);

};
