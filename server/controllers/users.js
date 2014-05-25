'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    _ = require('lodash');

/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
    res.redirect('/');
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.redirect('#!/login');
};

/**
 * Logout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res) {
    res.redirect('/');
};

/**
 * Create user
 */
exports.create = function(req, res, next) {
    var user = new User(req.body);
    console.log(user);
    user.provider = 'local';

    // because we set our user.provider to local our models/user.js validation will always be true
    req.assert('email', 'You must enter a valid email address').isEmail();
    req.assert('password', 'Password must be between 6-20 characters long').len(6, 20);
    req.assert('username', 'Username cannot be more than 20 characters').len(1,20);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }

    // Hard coded for now. Will address this with the user permissions system in v0.3.5
    user.roles = ['authenticated'];
    user.save(function(err) {
        if (err) {
            switch (err.code) {
                case 11000:
                case 11001:
                    res.status(400).send('Username already taken');
                    break;
                default:
                    res.status(400).send('Please fill all the required fields');
            }

            return res.status(400);
        }
        req.logIn(user, function(err) {
            if (err) return next(err);
            return res.redirect('/');
        });
        res.status(200);
    });
};
/**
 * Send User
 */
exports.me = function(req, res) {
    res.jsonp(req.user || null);
};

/**
 * Update User information and avatar
 */
exports.update = function(req, res) {
    var user = req.user;
    user = _.extend(user, req.body);
    // Check if upload photo
    console.log(req.user);
    if (user.avatar != "") {
         var fs = require('fs-extra');
         var path = require('path');

         // move file
        var new_location = './public/uploads/users/' + user._id + '/';
        fs.mkdirs(new_location, function(err){
          if (err) return console.error(err);
          console.log("create folder!")
        });

        fs.copy('./public/uploads/tmp/' + user.avatar, new_location + user.avatar, function(err) {  
            if (err) {
                console.error(err);
            } else {
                console.log("move file success!")
                // remove tmp file
                fs.remove('./public/uploads/tmp/' + user.avatar,function(e){
                    if(e)
                        return console.error(e);
                });

                // crop file
                var easyimg = require('easyimage');
                // small size
                easyimg.thumbnail(
                  {
                     src: new_location + user.avatar, dst: new_location + 'small_' + user.avatar,
                     width:30, height:30,
                     },
                  function(err, image) {
                     if (err) throw err;
                     console.log('Resized : ' + image.width + ' x ' + image.height);
                  }
                );

                // medium
                easyimg.thumbnail(
                  {
                     src: new_location + user.avatar, dst: new_location + 'medium_' + user.avatar,
                     width:160, height:160,
                     },
                  function(err, image) {
                     if (err) throw err;
                     console.log('Resized : ' + image.width + ' x ' + image.height);
                  }
                );

            }
        });
    };

    

    user.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                user: user
            });
        } else {
            res.jsonp(user);
        }
    });
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};