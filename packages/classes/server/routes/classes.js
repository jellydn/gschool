'use strict';
var classes = require('../controllers/classes');
var hasClassAuthorization = function(req, res, next) {

    if (req.class.createBy.id !== req.user.id) {
        return res.send(401, 'User is not authorized');
    }
    next();
};
// The Package is past automatically as first parameter
module.exports = function(Class, app, auth, database) {

     app.route('/classes')
        .get(classes.all).post(auth.requiresLogin, classes.create);

     app.route('/classes/suggest')
        .get(classes.suggest);

    app.route('/api/members/:classId')
        .get(classes.members);

     app.route('/upload/class').post(auth.requiresLogin,classes.upload);


     app.route('/classes/:classId')
        .get(classes.show)
        .post(auth.requiresLogin,classes.join)
        .put(auth.requiresLogin, hasClassAuthorization , classes.update)
        .delete(auth.requiresLogin, hasClassAuthorization, classes.destroy);

    // Finish with setting up the articleId param
    app.param('classId', classes.class);
};
