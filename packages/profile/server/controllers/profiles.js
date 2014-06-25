'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Classes = mongoose.model('Class'),
    Notes = mongoose.model('Note'),
    Notifications = mongoose.model('Notification'),
    _ = require('lodash');

exports.detail = function(req,res){
    // find user by username
    User.findOne({username : req.query.username},'username name email type roles avatar').exec(function(err,user){
        if (err) {
            console.error(err);
            res.render('error', {
                status: 500
            });
        }
        else {
            // get public activity

            // get notes - createBy 
            var notes = [];
            Notes.find( { createBy : user._id},function(err,notes){
                if (err) {
                    console.error(err);
                    res.render('error', {
                        status: 500
                    });
                }
                else
                {
                    // get class
                    Classes.find(
                        { 
                            $or : [ {createBy : user._id} , {members : user._id.toString()} ] 
                        },function(e,classes){
                            if (e) {
                                console.error(e);
                                res.render('error', {
                                    status: 500
                                });
                            }
                            else
                            {
                                var today = new Date();  

                                var query = Notifications.find({ to : user._id , dateCreate : { "$gte": new Date(today.getFullYear(),today.getMonth(),today.getDate()), "$lt": new Date(today.getFullYear(),today.getMonth(),today.getDate() + 1)} , type : { '$in' : ['create','comment','join','activity'] } }).limit(req.query.limit);
                                query.populate('from', 'name username').populate('to', 'name username').sort({ dateCreate : 'desc' }).exec(function(err,items){
                                    if (err) {
                                            console.error(err);
                                            res.render('error', {
                                                status: 500
                                            });
                                        } else {
                                            res.jsonp({profile : user, notes : notes,classes : classes, activities : items});
                                        }
                               });

                            }

                        });


                }


            })
            
        }
            
    })
}

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