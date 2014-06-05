'use strict';
var quizzes = require('../controllers/quizzes');
var hasQuizAuthorization = function(req, res, next) {

    if (req.quiz.createBy.id !== req.user.id) {
        return res.send(401, 'User is not authorized');
    }
    next();
};
// The Package is past automatically as first parameter
module.exports = function(Quiz, app, auth, database) {

     app.route('/quizzes')
        .get(quizzes.all).post(auth.requiresLogin, quizzes.create);

     app.route('/quizzes/:quizId')
        .get(quizzes.show)
        .put(auth.requiresLogin, hasQuizAuthorization , quizzes.update)
        .delete(auth.requiresLogin, hasQuizAuthorization, quizzes.destroy);

    // Finish with setting up the articleId param
    app.param('quizId', quizzes.quiz);
};
