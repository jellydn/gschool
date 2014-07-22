'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    _ = require('lodash');


/**
 * List of gallery
 */
exports.all = function(req, res) {
    var fs = require('fs-extra');
    var path = 'public/uploads/notes/' + req.user._id + '/';
    fs.readdir(path, function(err, files) {
        if (err) {
            console.error(err);
            res.jsonp({});
        }
        else {
            
            var items = [];
            var counter = 0;
            files.filter(function(file) { file = file.toLowerCase(); return file.substr(-4) == '.jpg' || file.substr(-4) == '.png' || file.substr(-5) == '.jpeg'; })
             .forEach(function(file) { 
                items[counter++] = {"image": 'http://' + req.headers.host + '/' + path +  file,"thumb": 'http://' + req.headers.host + '/' + path +  file, "title" : file};
              });

            res.jsonp(items);

        }
            
    });


    // res.jsonp(req.user)
};