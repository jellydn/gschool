'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Note = mongoose.model('Note'),
    Notifications = mongoose.model('Notification'),
    Comment = mongoose.model('Comment'),
    User = mongoose.model('User'),
    _ = require('lodash');


/**
 * List of notes
 */
exports.all = function(req, res) {
    var q = Comment.find({onNote : req.query.noteId});


    
    q.sort({ dateCreate : 'desc' }).populate('createBy', 'name username avatar').exec(function(err, comments) {
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

    var async = require('async');

    // find and pregmatch username from list
    var re = /(@\w+)/gi;
    var found = comment.content.match(re);
    var userArr =[];
    var IdsArr = [];
    async.waterfall([
        function(callback){
            if(found != undefined && (found instanceof Array))
            {
                for (var i = 0; i < found.length; i++) {
                    userArr[i] = found[i].replace('@','');
                };
                
            }
            callback(null, 'one');
        },
        function(arg1,callback){
            User.find({ username : {'$in': userArr} },'id name username',function(err,users){
                if (err) {
                    console.error(err)
                }
                else {
                    async.each(users, function( user, cb) {
                      IdsArr.push(user._id);
                      comment.content = comment.content.replace('@' + user.username, '<a href="/#!/profile/' + user.username + '">@' + user.username + '</a>');

                      cb();
                    }, function(err){
                        if (err) {
                            console.error(err)
                        };
                    });

                }
                callback(null, 'two');
            });
        }
    ],
    // optional callback
    function(err, results){

        comment.save(function(err) {
            if (err) {
                return res.send('users/signup', {
                    errors: err.errors,
                    comment: comment
                });
            } else {
                // update comment
                res.jsonp(comment);
                
                Note.load(comment.onNote , function(err, note) {
                    if (err) return next(err);
                    if (!note) return next(new Error('Failed to load note ' + id));
                    var query = Comment.find( {onNote : comment.onNote } );
                        query.count(function(err,totals){
                            if (err) {
                                console.error(err);
                            }
                            else
                            {
                                note.totalComments = totals;

                                // notify to member and owner of note
                                for (var i = 0; i < note.sendToMembers.length; i++) {
                                    var userid = note.sendToMembers[i];
                                    var notify = new Notifications();
                                    notify.source = comment;
                                    notify.from = req.user;
                                    notify.to = userid;
                                    notify.type = 'comment';
                                    notify.content =  req.user.name + ' has commented on note "' + note.title + '"' ;
                                    notify.save();
                                };

                                for (var i = 0; i < userArr.length; i++) {
                                    var userid = userArr[i];
                                    var notify = new Notifications();
                                    notify.source = comment;
                                    notify.from = req.user;
                                    notify.to = IdsArr[i];
                                    notify.type = 'comment';
                                    notify.content =  req.user.name + ' has mentioned you on a comment of note <a href="#!/notes/' + note._id + '">' + note.title + '</a>' ;
                                    notify.save();
                                };

                                note.save(); 
                            }
                        });
                });
                
            }
        });
    });
    
};

exports.show = function(req, res) {
    res.jsonp(req.comment);
};