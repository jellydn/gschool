'use strict';
var statistics = require('../controllers/statistics');

// The Package is past automatically as first parameter
module.exports = function(Statistics, app, auth, database) {

     app.route('/statistics/:statisticId')
        .get(statistics.show)
    // Finish with setting up the articleId param
    app.param('statisticId', statistics.statistic);
};
