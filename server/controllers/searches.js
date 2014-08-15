'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Classes = mongoose.model('Class'),
    Note = mongoose.model('Note'),
    _ = require('lodash');

/**
 * Search callback
 */
exports.search = function(req, res) {
    
    switch(req.body.type){
        case 'class':
            var q = Classes.find({name: new RegExp(req.body.q, "i")});

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
            break;
        case 'user':
            var q = User.find({name: new RegExp(req.body.q, "i")});

            q.sort({ dateCreate : 'desc' }).exec(function(err, classes) {
                if (err) {
                    console.log(err);
                    res.render('error', {
                        status: 500
                    });
                } else {
                    res.jsonp(classes);
                }
            });
            break;
        case 'note':
            var q = Note.find({title: new RegExp(req.body.q, "i")});

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
            break;
        default:
            res.jsonp({});
    }

    
};
