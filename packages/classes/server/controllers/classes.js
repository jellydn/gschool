'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Classes = mongoose.model('Class'),
    Message = mongoose.model('Message'),
    Note = mongoose.model('Note'),
    Comment = mongoose.model('Comment'),
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


/**
 * List of class
 */
exports.all = function(req, res) {
    if (req.user.type == 'teacher') 
        var q = Classes.find({createBy : req.user._id});
    else
        var q = Classes.find({members : req.user.username});

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

// Get class by id
exports.class = function(req, res, next, id) {
    Classes.load(id, function(err, item) {
        if (err) return next(err);
        if (!item) return next(new Error('Failed to load class ' + id));
        req.class = item;
        next();
    });
};

/**
 * Create a ntoe
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
        }
    });
};

exports.show = function(req, res) {
    res.jsonp(req.class);
};


exports.join = function(req,res){
    var classModel = req.class;
    // join member
    if ( ( typeof req.query.join != 'undefined') ) {
        // todo, check usernaem is valid
        var usernameJoin = req.query.join.trim();
        if (classModel.members.indexOf(usernameJoin) === -1) {
           classModel.members.push(usernameJoin);
        };
    }

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
}

/**
 * Update an note
 */
exports.update = function(req, res) {
    var classModel = req.class;
    var isUpload = req.body.file != classModel.file ;

    classModel = _.extend(classModel, req.body);

    // invite member
    if ( ( typeof req.query.recipients != 'undefined') ) {
        var recipientsArr = req.query.recipients.split(',');
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