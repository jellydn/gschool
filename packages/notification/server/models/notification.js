'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Notification Schema
 */
var NotificationSchema = new Schema({
    from: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    to: {
        type: String
    },
    source: {
        type: Schema.ObjectId
    },
    content: {
        type: String,
        default: '',
        trim: true
    },
    dateCreate: {
        type: Date,
        default: Date.now
    },
    dateOpen: {
        type: Date,
        default: '',
    },
    status : {
        type: String,
        default: 'unread'
    },
    group : {
        type: String,
        default: 'System'
    },
    type : {
        type: String
    },
    data : {
    }
});


/**
 * Statics
 */
NotificationSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('from', 'name username').exec(cb);
};

mongoose.model('Notification', NotificationSchema);
