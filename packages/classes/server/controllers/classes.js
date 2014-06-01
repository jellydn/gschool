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

    classModel = _.extend(classModel, req.body);
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