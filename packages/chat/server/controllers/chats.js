'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Chat = mongoose.model('Chat'),
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
 
        fs.copy(temp_path, new_location + file_name, function(err) {  
            if (err) {
                console.error(err);
            } else {
                console.log("upload success!")
            }
        });
    });
    

}
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

    if (chat.file != "") {
         var fs = require('fs-extra');
         var path = require('path');

         // move file
        var new_location = './public/uploads/chats/' + req.user._id + '/';
        fs.mkdirs(new_location, function(err){
          if (err) return console.error(err);
          console.log("create folder!")
        });

        fs.copy('./public/uploads/tmp/' + chat.file, new_location + chat.file, function(err) {  
            if (err) {
                console.error(err);
            } else {
                console.log("move file success!")
                // remove tmp file
                fs.remove('./public/uploads/tmp/' + chat.file,function(e){
                    if(e)
                        return console.error(e);
                });

            }
        });
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