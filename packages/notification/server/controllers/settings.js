'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    _ = require('lodash'),
    fs = require('fs'),
    nconf = require('nconf');


// Get setting by by userid

exports.show = function(req, res) {
    nconf.use('file', { file: './user-setting.json' });
    if (nconf.get('message:' + req.user._id.toString()) == undefined) {
        nconf.set('message:' + req.user._id.toString(),true);
        nconf.set('chat:' + req.user._id.toString(),true);
        nconf.save(function (err) {
            fs.readFile('./user-setting.json' , function (err, data) {
              console.dir(JSON.parse(data.toString()))
            });
          });
    }
    res.jsonp({ 'message' : nconf.get('message:' + req.user._id.toString()),'chat' : nconf.get('chat:' + req.user._id.toString()) });
};

exports.update = function(req, res) {
    var setting;
    nconf.use('file', { file: './user-setting.json' });
    nconf.set('message:' + req.user._id.toString(),req.body.message);
    nconf.set('chat:' + req.user._id.toString(),req.body.chat);

    nconf.save(function (err) {
        fs.readFile('./user-setting.json' , function (err, data) {
          console.dir(JSON.parse(data.toString()))
        });
      });
    res.jsonp({ 'message' : nconf.get('message:' + req.user._id.toString()),'chat' : nconf.get('chat:' + req.user._id.toString()) });

};

exports.logo = function(req,res){
    // chagne logo
    var fs = require('fs-extra');
    var path = require('path');

    fs.copy('./public/uploads/tmp/' + req.body.logo, './public/lib/images/logo1.png', function(err) {  
            if (err) {
                console.error(err);
            } else {
                console.log("move file success!")
                // remove tmp file
                fs.remove('./public/uploads/tmp/' + req.body.logo,function(e){
                    if(e)
                        return console.error(e);
                });

                var easyimg = require('easyimage');

                // crop file
                // small size
                easyimg.thumbnail(
                  {
                     src: './public/lib/images/logo1.png', dst: './public/lib/images/logo1.png',
                     width:168, height:32
                },
                  function(err, image) {
                     if (err) console.error(err)
                        else
                        console.log('Resized : ' + image.width + ' x ' + image.height);
                  }
                );
            }
    });
    res.jsonp({status : 'success'});

}
