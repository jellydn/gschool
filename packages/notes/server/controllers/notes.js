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

// process upload file
exports.upload = function(req,res){
    var formidable = require('formidable'),fs = require('fs-extra'), util = require('util');

    var form = new formidable.IncomingForm();
    
    form.parse(req, function(err, fields, files) {
      res.jsonp({ files: files});
    });
    
    form.on('error', function(err) {
        console.error(err);
    });

    form.on('progress', function(bytesReceived, bytesExpected) {
        var percent_complete = (bytesReceived / bytesExpected) * 100;
        console.log(percent_complete.toFixed(2));
    });

    form.on('end', function(fields, files) {
        /* Temporary location of our uploaded file */
        var temp_path = this.openedFiles[0].path;
        /* The file name of the uploaded file */
        var file_name = this.openedFiles[0].name;
        /* Location where we want to copy the uploaded file */
        // Todo: Clean temp folder
        var new_location = './public/uploads/tmp/';
 
        fs.copy(temp_path, new_location  + req.user._id + file_name, function(err) {  
            if (err) {
                console.error(err);
            } else {
                console.log("upload success!")
            }
        });
    });
    

}

/**
 * List of notes
 */
exports.all = function(req, res) {
    if (req.query.share == 1) {
        var q = Note.find({sendToMembers : req.user._id.toString()});
    }
    else
    {
        var q = Note.find({createBy : req.user._id});
    }
    
    q.sort({  orderNumber : 'desc' }).populate('createBy', 'name username avatar').exec(function(err, notes) {
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

    if (note.fileNames.length) {
         var fs = require('fs-extra');
         var path = require('path');

         // move file
        var new_location = './public/uploads/notes/' + req.user._id + '/';
        fs.mkdirs(new_location, function(err){
          if (err) return console.error(err);
          console.log("create folder!")
        });


        for (var i = 0; i < note.fileNames.length; i++) {
            var fileName = note.fileNames[i];
            fs.copy('./public/uploads/tmp/' + req.user._id + fileName, new_location + fileName, function(err) {  
            if (err) {
                console.error(err);
            } else {
                console.log("move file success!")
                // remove tmp file
                fs.remove('./public/uploads/tmp/' + req.user._id + fileName,function(e){
                    if(e)
                        return console.error(e);
                });
                
            }   
        });
        };

        
        
    };

    note.tags = req.body.tags.split(',');
    note.sendToClass = req.body.classes;
    note.sendToClassIds = req.body.classesIds;

    note.sendToMembers = req.body.members;

    // find Teacher of class

    Classes.find({ _id : {'$in' : note.sendToClassIds }},function(e,classes){

        if (e) {
            console.log(e);
        }
        else
        {
            
            for (var i = 0; i < classes.length; i++) {
                 note.sendToMembers.push(classes[i].createBy.toString());
            };

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
                notify.to = req.user._id;
                notify.type = 'activity';
                notify.content = 'You have created note "' + note.title + '"' ;
                notify.save();

                // send to inbox
                if ( ( typeof req.body.members != 'undefined') ) {
                  
                    // send notification and inbox to msg
                    if (note.sendToMembers.length) {
                         var message = new Message();
                         message.from = req.user._id;
                         message.fromName = req.user.name;
                         message.to = note.sendToMembers;
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
                         for (var i = 0; i < note.sendToMembers.length; i++) {
                             var username = note.sendToMembers[i];
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

    // upload file

    note = _.extend(note, req.body);

    if (note.fileNames.length) {
         var fs = require('fs-extra');
         var path = require('path');

         // move file
        var new_location = './public/uploads/notes/' + req.user._id + '/';
        fs.mkdirs(new_location, function(err){
          if (err) return console.error(err);
          console.log("create folder!")
        });


        for (var i = 0; i < note.fileNames.length; i++) {
            var fileName = note.fileNames[i];
            fs.copy('./public/uploads/tmp/' + req.user._id + fileName, new_location + fileName, function(err) {  
            if (err) {
                console.error(err);
            } else {
                console.log("move file success!")
                // remove tmp file
                fs.remove('./public/uploads/tmp/' + req.user._id + fileName,function(e){
                    if(e)
                        return console.error(e);
                });
                
            }   
        });
        };
        
    };

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

exports.order = function(req,res){

    // check current user 
    if( req.user._id == req.body.uid ){
        Note.find({ _id : { '$in' : req.body.notes } }).exec(function(e,notes){
            if (e) return next(e);
            if (!notes) return next(new Error('Failed to load classes of note '));
             
             notes.forEach(function(note){
                note.orderNumber = notes.length - req.body.notes.indexOf(note._id.toString());
                note.save();
             });

             res.jsonp(notes);
        });
    }


}