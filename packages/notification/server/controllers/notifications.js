'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Notifications = mongoose.model('Notification'),
    User = mongoose.model('User'),
    Schedule = mongoose.model('Schedule'),
    _ = require('lodash');


// unread inbox
exports.unread = function(req,res){
    var typeArr = req.query.type.split(',');
    if (typeArr.length>1) {
        var query = Notifications.find({to : req.user._id, type : { '$in' : typeArr } , status : 'unread' });
    }
    else
        var query = Notifications.find({to : req.user._id, type : req.query.type , status : 'unread' });

    query.count(function(err,totals){

        // find msg has read
        res.jsonp({'totals' : totals });
        
    });
};


/**
 * List of messages
 */
exports.all = function(req, res) {
   var today = new Date();  
   if ( _.isString(req.query.type)) {
        var query = Notifications.find({to : req.user.id , type : req.query.type }).limit(req.query.limit);
   }
   else {
        if (req.query.today != undefined) {
            if (req.query.all != undefined) {
                var query = Notifications.find({ dateCreate : { "$gte": new Date(today.getFullYear(),today.getMonth(),today.getDate()), "$lt": new Date(today.getFullYear(),today.getMonth(),today.getDate() + 1)} , type : { '$in' : req.query.type } }).limit(req.query.limit);
            }
            else
                var query = Notifications.find({ dateCreate : { "$gte": new Date(today.getFullYear(),today.getMonth(),today.getDate()), "$lt": new Date(today.getFullYear(),today.getMonth(),today.getDate() + 1)} , to : req.user.id , type : { '$in' : req.query.type } }).limit(req.query.limit);
        }
        else
            var query = Notifications.find({to : req.user.id , type : { '$in' : req.query.type } }).limit(req.query.limit);
            
   }
        
   query.populate('from', 'name username').populate('to', 'name username').sort({ dateCreate : 'desc' }).exec(function(err,items){
        if (err) {
                console.log(err);
                res.render('error', {
                    status: 500
                });
            } else {
                res.jsonp(items);
            }
   });
    
};

// Get message by id
exports.notification = function(req, res, next, id) {
    Notifications.load(id, function(err, notification) {
        if (err) return next(err);
        if (!notification) return next(new Error('Failed to load notification ' + id));
        req.notification = notification;
        next();
    });
};

exports.update = function(req, res) {
    var notification = req.notification;
    notification = _.extend(notification, req.body);
    notification.dateOpen = Date.now();
    notification.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                notification: notification
            });
        } else {
            res.jsonp(notification);
        }
    });
};

/**
 * Delete an notification
 */
exports.destroy = function(req, res) {
    var notification = req.notification;

    // if only me on this message, this message will remove
    if ( notification.to == req.user.username ) {
         notification.remove(function(err) {
            if (err) {
                return res.send('users/signup', {
                    errors: err.errors,
                    notification: notification
                });
            } 
        });
    }
   
};