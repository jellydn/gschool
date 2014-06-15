'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Note = mongoose.model('Note'),
    Notifications = mongoose.model('Notification'),
    Statistics = mongoose.model('Statistic'),
    User = mongoose.model('User'),
    _ = require('lodash');


/**
 * List of notes
 */
exports.all = function(req, res) {
    var q = Statistics.find();
    
    q.sort({ dateCreate : 'desc' }).populate('createBy', 'name username avatar').exec(function(err, stats) {
        if (err) {
            console.log(err);
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(stats);
        }
    });

};

// Get note by id
exports.statistic = function(req, res, next, id) {
    Statistics.findOne({createBy : id}, function(err, statistic) {
        if (err) return next(err);
        if (!statistic) return next(new Error('Failed to load stats ' + id));
        req.statistic = statistic;
        next();
    });
};



exports.show = function(req, res) {
    res.jsonp(req.statistic);
};