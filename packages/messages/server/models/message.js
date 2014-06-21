'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash'),
    fs = require('fs'),
    nconf = require('nconf');


/**
 * Message Schema
 */
var MessageSchema = new Schema({
    from: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    fromName: {
        type: String
    },
    to: [ {
        type: Schema.ObjectId,
        ref: 'User'
    }
    ],
    isRead : {
        type : Array
    },
    dateSent: {
        type: Date,
        default: Date.now
    },
    message: {
        type: String,
        default: '',
        trim: true
    },
    isTrashSender : {
        type : Array
    },
    isTrashReceiver : {
        type : Array
    },
    file : {
        type: String
    }
});


/**
 * Statics
 */
MessageSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('from', 'name username').populate('to', 'name username').exec(cb);
};

MessageSchema.post('save', function (doc) {
  var Notifications = mongoose.model('Notification');
    //notify 
    nconf.use('file', { file: './user-setting.json' });

    for (var i = 0; i < doc.to.length; i++) {

        if (nconf.get('message:' + doc.to.toString()) == undefined || nconf.get('message:' + doc.to.toString()) ) {
            var username = doc.to[i];
            var notify = new Notifications();
            notify.source = doc;
            notify.from = doc.from;
            notify.to = username;
            notify.type = 'mail';
            notify.content =  doc.fromName + ' has sent mail to you.';
            notify.save();
        }
        
    };
})

MessageSchema.post('remove',function(doc){
    console.log('Remove all mail relate stuff');
    console.log(doc);
});


/**
 * Virtuals
 */
MessageSchema.virtual('status').set(function(status) {
    this._status = status;
}).get(function() {
    return this._status;
});

MessageSchema.virtual('recipients').set(function(obj) {
    this._recipients = obj;
}).get(function() {
    return this._recipients;
});


MessageSchema.virtual('attachment').set(function(file) {
    this._attachment = file;
}).get(function() {
    return this._attachment;
});


MessageSchema.set('toJSON', {
   virtuals: true
});


mongoose.model('Message', MessageSchema);
