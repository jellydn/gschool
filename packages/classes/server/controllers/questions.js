'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Classes = mongoose.model('Class'),
    Questions = mongoose.model('Question'),
    User = mongoose.model('User'),
    _ = require('lodash');

/**
 * List of question belong a class
 */
exports.all = function(req, res) {
    var q = Questions.find({ofClass : req.query.classId});
    q.sort({ dateCreate : 'desc' }).populate('createBy', 'name username avatar').exec(function(err, questions) {
        if (err) {
            console.log(err);
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(questions);
        }
    });

};


// questions
exports.suggest = function(req, res) {
    Questions.find( {description: new RegExp('^'+req.query.q, "i"), ofClass : req.class._id } ,'description', function(err, questions) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(questions);
        }
    });

};


// Get question by id
exports.question = function(req, res, next, id) {
    Questions.load(id, function(err, item) {
        if (err) return next(err);
        if (!item) return next(new Error('Failed to load question ' + id));
            req.question = item;
            next();
    });
};

/**
 * Create a quiz
 */

 exports.create = function(req, res) {
    var question = new Questions(req.body);
    question.createBy = req.user;

    question.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                question: question
            });
        } else {
            res.jsonp(question);
        }
    });
};

exports.show = function(req, res) {
    res.jsonp(req.question);
};

/**
 * Update an note
 */
exports.update = function(req, res) {
    var question = req.question;

    question = _.extend(question, req.body);

    question.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                question: question
            });
        } else {
            res.jsonp(question);
        }
    });
};

/**
 * Delete an note
 */
exports.destroy = function(req, res) {
    var question = req.question;
    //todo: remove all file
    question.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                question: question
            });
        } else {
            res.jsonp(question);
        }
    });
};