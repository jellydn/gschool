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
    if (req.query.share == 1) {
        var q = Note.find({sendToMembers : req.user.username});
    }
    else
    {
        var q = Note.find({createBy : req.user._id});
    }
    
    q.sort({ dateCreate : 'desc' }).populate('createBy', 'name username avatar').exec(function(err, notes) {
        if (err) {
            console.log(err);
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(notes);
        }
    });

};

// Get note by id
exports.note = function(req, res, next, id) {
    Note.load(id, function(err, note) {
        if (err) return next(err);
        if (!note) return next(new Error('Failed to load note ' + id));
        req.note = note;
        next();
    });
};

/**
 * Create a ntoe
 */

 exports.create = function(req, res) {
    var note = new Note(req.body);
    note.createBy = req.user;
    // todo: send to class and member
    note.tags = req.body.tags.split(',');
    note.sendToClass = req.body.classes.split(',');
    note.sendToMembers = ['dunghd','admin'];
    note.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                note: note
            });
        } else {
            res.jsonp(note);
            // send quick comment
            if ( req.body.quickComment != 'undefined' && req.body.quickComment.length) {
                var comment = new Comment({ content : req.body.quickComment , onNote: note._id});
                comment.createBy = req.user;
                // todo: send to class and member

                comment.save(function(err) {
                    if (err) {
                        console.error(err);
                    } else {
                        // update comment
                        var query = Comment.find( {onNote : comment.onNote } );
                        query.count(function(err,totals){
                            if (err) {
                                console.error(err);
                            }
                            else
                            {
                                note.totalComments = totals;
                                note.save(); 
                            }
                        });
                        
                    }
                });
            };
        }
    });
};

exports.show = function(req, res) {
    res.jsonp(req.note);
};


/**
 * Update an note
 */
exports.update = function(req, res) {
    var note = req.note;

    note = _.extend(note, req.body);
    note.sendToClass = note.classes.split(',');
    note.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                note: note
            });
        } else {
            res.jsonp(note);
        }
    });
};

/**
 * Delete an note
 */
exports.destroy = function(req, res) {
    var note = req.note;

    note.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                note: note
            });
        } else {
            res.jsonp(note);
        }
    });
};