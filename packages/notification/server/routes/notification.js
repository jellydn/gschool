'use strict';
var notifications = require('../controllers/notifications');

var hasAuthorization = function(req, res, next) {
    if (req.notification.to == req.user.id ) {
        return res.send(401, 'User is not authorized');
    }
    next();
};
// The Package is past automatically as first parameter
module.exports = function(Notification, app, auth, database) {

    app.route('/notifications')
        .get(notifications.all);

    app.route('/api/notifications/unread').get(notifications.unread,auth.requiresLogin);

    app.route('/notifications/:notificationId')
        .put(auth.requiresLogin, hasAuthorization , notifications.update)
        .delete(auth.requiresLogin, hasAuthorization, notifications.destroy);

    // Finish with setting up the articleId param
    app.param('notificationId', notifications.notification);
};
