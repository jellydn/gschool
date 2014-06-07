'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Classes = mongoose.model('Class'),
    Quizzes = mongoose.model('Quiz'),
    User = mongoose.model('User'),
    _ = require('lodash');

/**
 * List of class
 */
exports.all = function(req, res) {
    var q = Quizzes.find({ofClass : req.class._id});
    q.sort({ dateCreate : 'desc' }).populate('createBy', 'name username avatar').exec(function(err, quizzes) {
        if (err) {
            console.log(err);
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(quizzes);
        }
    });

};

// Get quiz by id
exports.quiz = function(req, res, next, id) {
    Quizzes.load(id, function(err, item) {
        if (err) return next(err);
        if (!item) return next(new Error('Failed to load quiz ' + id));
            req.quiz = item;
            next();
    });
};

/**
 * Create a quiz
 */

 exports.create = function(req, res) {
    var quiz = new Quizzes(req.body);
    quiz.createBy = req.user;

    // quiz will default expired in a year
    if (req.body.expired.length) {
        quiz.expireAt = req.body.expired;
    }
    else
    {
        var nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        quiz.expireAt = nextYear;
    }

    quiz.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                quiz: quiz
            });
        } else {
            res.jsonp(quiz);
        }
    });
};

exports.show = function(req, res) {
    res.jsonp(req.quiz);
};

/**
 * Update an note
 */
exports.update = function(req, res) {
    var quiz = req.quiz;

    quiz = _.extend(quiz, req.body);

    quiz.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                quiz: quiz
            });
        } else {
            res.jsonp(quiz);
        }
    });
};

/**
 * Delete an note
 */
exports.destroy = function(req, res) {
    var quiz = req.quiz;
    //todo: remove all file
    quiz.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                quiz: quiz
            });
        } else {
            res.jsonp(quiz);
        }
    });
};