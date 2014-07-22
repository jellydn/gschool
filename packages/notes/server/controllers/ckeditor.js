'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    _ = require('lodash');


/**
 * List of notes
 */
exports.image = function(req, res) {
    var formidable = require('formidable'),fs = require('fs-extra'), util = require('util');

    var form = new formidable.IncomingForm();
    console.log(req.query);
    form.parse(req, function(err, fields, files) {
      //res.jsonp({ files: files});
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
        var new_location = './public/uploads/notes/';
 
        fs.copy(temp_path, new_location  + req.user._id + '/' + file_name, function(err) {  
            if (err) {
                console.error(err);
            } else {
                console.log("upload success!")
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write("<script type='text/javascript'>window.parent.CKEDITOR.tools.callFunction("+req.query.CKEditorFuncNum+",\""+ new_location  + req.user._id + "/" + file_name +"\",\"Upload success\");</script>");
                res.end();
            }
        });
    });

};