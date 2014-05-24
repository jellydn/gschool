'use strict';
var comments = require('../controllers/comments');

// The Package is past automatically as first parameter
module.exports = function(Comments, app, auth, database) {

     app.route('/comments')
        .get(comments.all).post(auth.requiresLogin, comments.create);


     app.route('/comments/:commentId')
        .get(comments.show)
     // app.route('/notes/:noteId')
     //    .put(auth.requiresLogin, hasAuthorization , messages.update)
     //    .delete(auth.requiresLogin, hasAuthorization, messages.destroy);

    // Finish with setting up the articleId param
    app.param('commentId', comments.comment);
};
