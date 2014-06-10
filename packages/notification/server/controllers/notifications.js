'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Notificatons = mongoose.model('Notification'),
    User = mongoose.model('User'),
    Schedule = mongoose.model('Schedule'),
    _ = require('lodash');


// unread inbox
exports.unread = function(req,res){
    var query = Notificatons.find({to : req.user.id});

    query.count(function(err,totals){

        // find msg has read
        var q = Notificatons.find({to : req.user.username,isRead : req.user.username});
        q.count(function(e,t){
            res.jsonp({'totals' : totals - t});
        });
        
    });
};


/**
 * List of messages
 */
exports.all = function(req, res) {

    // from schedule
    if (req.query.schedule == 1) {
        var query = Schedule.find({from : req.user._id});
    }
    else
    {
        // from inbox
        if (req.query.inbox == 1) {
            var query = Message.find({to : req.user.username});
        }
        else
        {
            // from trash
            if (req.query.trash) {
                var query = Message.find({isTrashReceiver : req.user.username});
            }
            else // from sent box
                var query = Message.find({from : req.user._id});
        }
    }

    
    
    query.count(function(err, totals) {
        var page = req.query.page;
        var limit = req.query.limit;

        if (req.query.schedule == 1) {
            var q = Schedule.find({from : req.user._id}).skip((page - 1) * limit).limit(limit);
        }
        else
        {
            if (req.query.inbox == 1) {
                var q = Message.find({to : req.user.username}).skip((page - 1) * limit).limit(limit);
            }
            else
            {
                if (req.query.trash) {
                    var q = Message.find({isTrashReceiver : req.user.username}).skip((page - 1) * limit).limit(limit);
                }
                else
                    var q = Message.find({from : req.user._id}).skip((page - 1) * limit).limit(limit);
            }
        }

        q.sort({ dateSent : 'desc' }).exec(function(err, messages) {
            if (err) {
                console.log(err);
                res.render('error', {
                    status: 500
                });
            } else {
                messages.push({'totals' : totals , 'pages' : Math.ceil(totals / limit) });
                res.jsonp(messages);
            }
        });
    });

};

// Get message by id
exports.notification = function(req, res, next, id) {
    Notificatons.load(id, function(err, notification) {
        if (err) return next(err);
        if (!message) return next(new Error('Failed to load notification ' + id));
        req.notification = notification;
        next();
    });
};

/**
 * Delete an notification
 */
exports.destroy = function(req, res) {
    var notification = req.notification;

    // if only me on this message, this message will remove
    if ( notification.to.id == req.user.id ) {
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