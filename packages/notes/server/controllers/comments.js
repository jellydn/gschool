'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Note = mongoose.model('Note'),
    Comment = mongoose.model('Comment'),
    User = mongoose.model('User'),
    _ = require('lodash');


/**
 * List of notes
 */
exports.all = function(req, res) {
    var q = Comment.find({onNote : req.query.noteId});


    
    q.sort({ dateCreate : 'desc' }).populate('createBy', 'name username').exec(function(err, comments) {
        if (err) {
            console.log(err);
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(comments);
        }
    });

};

// Get note by id
exports.comment = function(req, res, next, id) {
    Comment.load(id, function(err, comment) {
        if (err) return next(err);
        if (!comment) return next(new Error('Failed to load comment ' + id));
        req.comment = comment;
        next();
    });
};

/**
 * Create a ntoe
 */

 exports.create = function(req, res) {
    var comment = new Comment(req.body);
    comment.createBy = req.user;
    // todo: send to class and member

    comment.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                comment: comment
            });
        } else {
            comment.createBy = { username : req.user.username , name : req.user.name } ;
            res.jsonp(comment);
        }
    });
};

exports.show = function(req, res) {
    res.jsonp(req.comment);
};