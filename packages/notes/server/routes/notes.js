'use strict';
var notes = require('../controllers/notes');

// The Package is past automatically as first parameter
module.exports = function(Notes, app, auth, database) {

     app.route('/notes')
        .get(notes.all).post(auth.requiresLogin, notes.create);


     app.route('/notes/:noteId')
        .get(notes.show)
     // app.route('/notes/:noteId')
     //    .put(auth.requiresLogin, hasAuthorization , messages.update)
     //    .delete(auth.requiresLogin, hasAuthorization, messages.destroy);

    // Finish with setting up the articleId param
    app.param('noteId', notes.note);
};
