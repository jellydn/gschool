'use strict';
var questions = require('../controllers/questions');
var hasQuestionAuthorization = function(req, res, next) {

    if (req.question.createBy.id !== req.user.id) {
        return res.send(401, 'User is not authorized');
    }
    next();
};
// The Package is past automatically as first parameter
module.exports = function(Question, app, auth, database) {

     app.route('/questions')
        .get(questions.all).post(auth.requiresLogin, questions.create);

    app.route('/api/questions/:classId')
        .get(questions.suggest);

     app.route('/questions/:questionId')
        .get(questions.show)
        .put(auth.requiresLogin, hasQuestionAuthorization , questions.update)
        .delete(auth.requiresLogin, hasQuestionAuthorization, questions.destroy);

    // Finish with setting up the articleId param
    app.param('questionId', questions.question);
};
