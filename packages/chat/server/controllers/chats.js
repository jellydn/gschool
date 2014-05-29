'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Chat = mongoose.model('Chat'),
    User = mongoose.model('User'),
    _ = require('lodash');


/**
 * List of chat
 */
exports.all = function(req, res) {

    var q = Chat.find({ $or : [  { token : req.user._id + ':' + req.query.to }  ,  { token : req.query.to + ':' + req.user._id }] });
    
    q.sort({ dateCreate : 'asc' }).populate('to', 'name username avatar').populate('createBy', 'name username avatar').exec(function(err, chats) {
        if (err) {
            console.log(err);
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(chats);
        }
    });

};

// Get chat by id
exports.chat = function(req, res, next, id) {
    Chat.load(id, function(err, chat) {
        if (err) return next(err);
        if (!chat) return next(new Error('Failed to load chat ' + id));
        req.chat = chat;
        next();
    });
};

/**
 * Create a chat message
 */

 exports.create = function(req, res) {
    var chat = new Chat(req.body);
    chat.createBy = req.body.from;


    if (req.body.to.localeCompare(req.user._id)) {
        chat.token = req.body.to + ':' + req.user._id;
    }
    else
    {
        chat.token = req.user._id + ':' + req.body.to;
    };

    // todo: send to class and member
    chat.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                chat: chat
            });
        } else {
            res.jsonp(chat);
        }
    });
};

exports.show = function(req, res) {
    res.jsonp(req.chat);
};


exports.online = function(req,res){
     var q = User.find({ _id : { '$ne' : req.user._id }}).select('name username avatar');
     q.sort({ dateCreate : 'desc' }).exec(function(err, users) {
        if (err) {
            console.log(err);
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(users);
        }
    });
}

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