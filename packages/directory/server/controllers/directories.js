'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    _ = require('lodash');


/**
 * List of User
 */
exports.all = function(req, res) {
    User.find().select('name username email type roles avatar').sort('-username').exec(function(err, users) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(users);
        }
    });
};

exports.rights = function(req,res){
    // find user is exist or not

    // set or remove admin
    User.findOne({username : req.body.username},'name username email type roles avatar').sort('-username').exec(function(err, user) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            
            if (req.body.admin == 1) {
                user.roles.push('admin');
                user.save();
            }
            else
            {
                var tmpRoles = [];
                for (var i = 0; i < user.roles.length; i++) {
                    if(user.roles[i] != 'admin')
                        tmpRoles.push(user.roles[i]);
                };
                user.roles = tmpRoles;
                user.save();
            }
            res.jsonp(user);
        }
    });
}
