'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Classes = mongoose.model('Class'),
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

/**
 * List of class
 */
exports.all = function(req, res) {
    var q = Classes.find({createBy : req.user._id});
    
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
    classModel.members = ['dunghd','admin'];


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


/**
 * Update an note
 */
exports.update = function(req, res) {
    var classModel = req.class;
    var isUpload = req.body.file != classModel.file ;

    classModel = _.extend(classModel, req.body);
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