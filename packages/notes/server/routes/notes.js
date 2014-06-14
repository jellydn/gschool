'use strict';
var notes = require('../controllers/notes');
var hasNoteAuthorization = function(req, res, next) {

    if (req.note.createBy.id !== req.user.id) {
        return res.send(401, 'User is not authorized');
    }
    next();
};
// The Package is past automatically as first parameter
module.exports = function(Notes, app, auth, database) {

     app.route('/notes')
        .get(notes.all).post(auth.requiresLogin, notes.create);


     app.route('/notes/:noteId')
        .get(notes.show)
        .put(auth.requiresLogin, hasNoteAuthorization , notes.update)
        .delete(auth.requiresLogin, hasNoteAuthorization, notes.destroy);

     app.route('/upload/note').post(auth.requiresLogin,notes.upload);

    // Finish with setting up the articleId param
    app.param('noteId', notes.note);
};
