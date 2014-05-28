'use strict';
var chats = require('../controllers/chats');
var hasNoteAuthorization = function(req, res, next) {

    if (req.chat.createBy.id !== req.user.id) {
        return res.send(401, 'User is not authorized');
    }
    next();
};
// The Package is past automatically as first parameter
module.exports = function(Chat, app, auth, database) {

     app.route('/chats')
        .get(chats.all)
        .post(auth.requiresLogin, chats.create);

    app.route('/chats/online')
        .get(chats.online);

     app.route('/chats/:chatId')
        .get(chats.show)
        .put(auth.requiresLogin, hasNoteAuthorization , chats.update)
        .delete(auth.requiresLogin, hasNoteAuthorization, chats.destroy);

    // Finish with setting up the articleId param
    app.param('chatId', chats.chat);
};
