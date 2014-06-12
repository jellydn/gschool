'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Note = mongoose.model('Note'),
    Notifications = mongoose.model('Notification'),
    Comment = mongoose.model('Comment'),
    Classes = mongoose.model('Class'),
    Message = mongoose.model('Message'),
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
        console.log(note);
        Classes.find({ _id : { '$in' : note.sendToClassIds } }).populate('createBy', 'name username avatar').exec(function(e,classes){
            if (e) return next(e);
            if (!classes) return next(new Error('Failed to load classes of note ' + id));
            note.belongClasses = classes;
            console.log(classes);
            req.note = note;
            next();
        });
        
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
    note.sendToClass = req.body.classes;
    note.sendToClassIds = req.body.classesIds;
    note.sendToMembers = req.body.members;
    note.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                note: note
            });
        } else {
            res.jsonp(note);

            // notify to owner
            var notify = new Notifications();
            notify.source = note;
            notify.from = req.user;
            notify.to = req.user.username;
            notify.type = 'activity';
            notify.content =  req.user.name + ' has created note "' + note.title + '"' ;
            notify.save();

            // send to inbox
            if ( ( typeof req.body.members != 'undefined') ) {
              
                // send notification and inbox to msg
                if (req.body.members.length) {
                     var message = new Message();
                     message.from = req.user._id;
                     message.fromName = req.user.name;
                     message.to = req.body.members;
                     message.file = '';
                     message.message =  req.user.name + ' has shared note <a href="/#!/notes/' + note._id + '">' + note.title + '</a> with you.' ;
                     message.save(function(err){
                        if (err) {
                            return res.send('users/signup', {
                                errors: err.errors,
                                message: message
                            });
                        } 
                     });

                     // notify to shared note user
                     for (var i = 0; i < req.body.members.length; i++) {
                         var username = req.body.members[i];
                         var notify = new Notifications();
                            notify.source = note;
                            notify.from = req.user;
                            notify.to = username;
                            notify.type = 'activity';
                            notify.content =  req.user.name + ' has shared note "' + note.title + '" with you.' ;
                            notify.save();
                     };
                };
            };


            // send quick comment
            if ( (typeof req.body.quickComment != 'undefined') && req.body.quickComment != '' && req.body.quickComment.length) {
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