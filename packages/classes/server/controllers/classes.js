'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Classes = mongoose.model('Class'),
    Notifications = mongoose.model('Notification'),
    Message = mongoose.model('Message'),
    Note = mongoose.model('Note'),
    Comment = mongoose.model('Comment'),
    Quizzes = mongoose.model('Quiz'),
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

exports.suggest = function(req, res) {
    if (req.user.type == 'teacher') 
        var q = Classes.find({createBy : req.user._id,name: new RegExp('^'+req.query.q, "i")});
    else
        var q = Classes.find({members : req.user.username,name: new RegExp('^'+req.query.q, "i")});

    q.sort({ dateCreate : 'desc' }).populate('createBy', 'name username avatar').exec(function(err, classes) {
        if (err) {
            console.log(err);
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(classes);
        }
    });

};

exports.members = function(req, res) {
    User.find( {name: new RegExp('^'+req.query.q, "i"), username : req.class.members } ,'username name avatar', function(err, users) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            
            res.jsonp(users);
        }
    });

};


/**
 * List of class
 */
exports.all = function(req, res) {
    if (req.user.type == 'teacher') 
        var q = Classes.find({createBy : req.user._id});
    else
        var q = Classes.find({members : req.user.username});

    q.sort({ dateCreate : 'desc' }).populate('createBy', 'name username avatar').exec(function(err, classes) {
        if (err) {
            console.log(err);
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(classes);
        }
    });

};

// Get class by id
exports.class = function(req, res, next, id) {
    Classes.load(id, function(err, item) {
        if (err) return next(err);
        if (!item) return next(new Error('Failed to load class ' + id));
        // Load all note belong to this class
        Note.find({sendToClassIds : id}).populate('createBy', 'name username avatar').exec(function(e,notes){
            if (e) return next(e);
            if (!notes) return next(new Error('Failed to load note of class ' + id));
            item.notes = notes;
            Quizzes.find({ofClass : id}).populate('createBy', 'name username avatar').exec(function(e,quizzes){
                if (e) return next(e);
                if (!quizzes) return next(new Error('Failed to load quizzes of class ' + id));
                item.quizzes = quizzes;
                User.find({username : {'$in' : item.members}},'name username avatar').exec(function(e,students){
                    if (e) return next(e);
                    if (!students) return next(new Error('Failed to load students of class ' + id));
                    item.students = students;
                    req.class = item;
                    next();
                });
            });
        });

    });
};

/**
 * Create a class
 */

 exports.create = function(req, res) {
    var classModel = new Classes(req.body);
    classModel.createBy = req.user;
    // todo: send to class and member
    classModel.tags = req.body.tags.split(',');

    if (classModel.file != "") {
         var fs = require('fs-extra');
         var path = require('path');

         // move file
        var new_location = './public/uploads/classes/' + req.user._id + '/';
        fs.mkdirs(new_location, function(err){
          if (err) return console.error(err);
          console.log("create folder!")
        });

        fs.copy('./public/uploads/tmp/' + req.user._id + classModel.file, new_location + classModel.file, function(err) {  
            if (err) {
                console.error(err);
            } else {
                console.log("move file success!")
                // remove tmp file
                fs.remove('./public/uploads/tmp/' + req.user._id + classModel.file,function(e){
                    if(e)
                        return console.error(e);
                });
                 // check if is image file
                if(classModel.file.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/))
                {

                    // check file file type png, will convert to jpg

                    var new_file_name = classModel.file;
                    var easyimg = require('easyimage');

                    // crop file
                    // small size
                    easyimg.thumbnail(
                      {
                         src: new_location + new_file_name, dst: new_location + 'small_' + classModel.file,
                         width:30, height:30
                    },
                      function(err, image) {
                         if (err) console.error(err)
                            else
                            console.log('Resized : ' + image.width + ' x ' + image.height);
                      }
                    );

                    // medium
                    easyimg.thumbnail(
                      {
                         src: new_location + new_file_name, dst: new_location + 'medium_' + classModel.file,
                         width:160, height:160
                         },
                      function(err, image) {
                         if (err) console.error(err)
                            else
                            console.log('Resized : ' + image.width + ' x ' + image.height);
                      }
                    );
                }
            }   
        });
        
    };

    classModel.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                class: classModel
            });
        } else {
            res.jsonp(classModel);
            var notify = new Notifications();
            notify.source = classModel;
            notify.from = req.user;
            notify.to = req.user.username;
            notify.type = 'activity';
            notify.content =  req.user.name + ' has created class '+ classModel.name;
            notify.save();
        }
    });
};

exports.show = function(req, res) {
    res.jsonp(req.class);
};


exports.join = function(req,res){
    var classModel = req.class;
    // join member
    if ( ( typeof req.query.username != 'undefined') ) {
        // todo, check usernaem is valid
        var username = req.query.username.trim();
        if(req.query.task == 'join'){
            if (classModel.members.indexOf(username) === -1) {
               classModel.members.push(username);
            };
        }
        else
        {
            if (classModel.members.indexOf(username) !== -1) {
               for (var i in classModel.members) {
                    if (classModel.members[i] === username) {
                        classModel.members.splice(i, 1);
                    }
                }
            };
        }
        
    }

    classModel.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                class: classModel
            });
        } else {
            res.jsonp(classModel);
            classModel.populate('createBy','name').exec(function(item){
                if (req.query.task == 'join') {
                    // notify to member and teacher of class
                    var notify = new Notifications();
                    notify.source = item;
                    notify.from = req.user;
                    notify.to = item.createBy.username;
                    notify.type = 'activity';
                    notify.content =  req.user.name + ' has joined class '+ item.name;
                    notify.save();
                };
            })
            
            
        }
    });
}

/**
 * Update an class
 */
exports.update = function(req, res) {
    var classModel = req.class;
    var isUpload = req.body.file != classModel.file ;

    classModel = _.extend(classModel, req.body);

    // invite member
    if ( ( typeof req.query.recipients != 'undefined') ) {
        if (typeof req.query.recipients == 'string') {
            var recipientsArr = [];
            recipientsArr.push(req.query.recipients);
        }
        else
        {
            var recipientsArr = req.query.recipients;
        }
            
        var sendNotificationArr = [];
        for (var i = recipientsArr.length - 1; i >= 0; i--) {
            if (classModel.pendingMembers.indexOf(recipientsArr[i].trim()) === -1 && classModel.members.indexOf(recipientsArr[i].trim()) === -1) {
                classModel.pendingMembers.push(recipientsArr[i].trim());
                sendNotificationArr.push(recipientsArr[i].trim());
            };            
        };

        // send notification and inbox to msg
        if (sendNotificationArr.length) {
             var message = new Message();
             message.from = req.user._id;
             message.fromName = req.user.name;
             message.to = sendNotificationArr;
             message.file = '';
             message.message = 'You have recevied invitation to join class <a href="/#!/classes/' + classModel.id + '">' + classModel.name + '</a>' ;
             message.save(function(err){
                if (err) {
                    return res.send('users/signup', {
                        errors: err.errors,
                        message: message
                    });
                } 
             });
        };
    };

    if (isUpload) {
         var fs = require('fs-extra');
         var path = require('path');

         //todo: remove old file

         // move file
        var new_location = './public/uploads/classes/' + req.user._id + '/';
        fs.mkdirs(new_location, function(err){
          if (err) return console.error(err);
          console.log("create folder!")
        });

        fs.copy('./public/uploads/tmp/' + req.user._id + classModel.file, new_location + classModel.file, function(err) {  
            if (err) {
                console.error(err);
            } else {
                console.log("move file success!")
                // remove tmp file
                fs.remove('./public/uploads/tmp/' + req.user._id + classModel.file,function(e){
                    if(e)
                        return console.error(e);
                });
                 // check if is image file
                if(classModel.file.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/))
                {

                    // check file file type png, will convert to jpg

                    var new_file_name = classModel.file;
                    var easyimg = require('easyimage');

                    // crop file
                    // small size
                    easyimg.thumbnail(
                      {
                         src: new_location + new_file_name, dst: new_location + 'small_' + classModel.file,
                         width:30, height:30
                    },
                      function(err, image) {
                         if (err) console.error(err)
                            else
                            console.log('Resized : ' + image.width + ' x ' + image.height);
                      }
                    );

                    // medium
                    easyimg.thumbnail(
                      {
                         src: new_location + new_file_name, dst: new_location + 'medium_' + classModel.file,
                         width:160, height:160
                         },
                      function(err, image) {
                         if (err) console.error(err)
                            else
                            console.log('Resized : ' + image.width + ' x ' + image.height);
                      }
                    );
                }
            }   
        });
        
    };

    classModel.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                class: classModel
            });
        } else {
            res.jsonp(classModel);
        }
    });
};

/**
 * Delete an note
 */
exports.destroy = function(req, res) {
    var classModel = req.class;
    //todo: remove all file
    classModel.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                class: classModel
            });
        } else {
            res.jsonp(classModel);
        }
    });
};