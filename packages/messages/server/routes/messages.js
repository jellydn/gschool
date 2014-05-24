'use strict';
var messages = require('../controllers/messages');

var hasAuthorization = function(req, res, next) {
    if (req.message.to.indexOf(req.user.username) == -1 ) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

// The Package is past automatically as first parameter
module.exports = function(Messages, app, auth, database) {

     app.route('/messages')
        .get(messages.all).
        post(auth.requiresLogin, messages.send).
        delete(auth.requiresLogin, messages.clean);
     app.route('/api/unread').get(messages.unread,auth.requiresLogin);
     app.route('/api/users')
     .get(messages.suggest);

     app.route('/upload').post(auth.requiresLogin,messages.upload);

     app.route('/messages/:messageId')
        .put(auth.requiresLogin, hasAuthorization , messages.update)
        .delete(auth.requiresLogin, hasAuthorization, messages.destroy);

    // Finish with setting up the articleId param
    app.param('messageId', messages.message);
};
