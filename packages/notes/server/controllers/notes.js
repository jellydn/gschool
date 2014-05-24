'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Note = mongoose.model('Note'),
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
    
    q.sort({ dateCreate : 'desc' }).populate('createBy', 'name username').exec(function(err, notes) {
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

    console.log(req.body);

    note.sendToMembers = ['dunghd','admin'];
    note.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                note: note
            });
        } else {
            note.createBy = { username : req.user.username , name : req.user.name } ;
            res.jsonp(note);
        }
    });
};

exports.show = function(req, res) {
    res.jsonp(req.note);
};