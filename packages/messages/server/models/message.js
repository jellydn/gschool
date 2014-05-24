'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


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
    to: {
        type: Array
    },
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
    }).populate('from', 'name username').exec(cb);
};


/**
 * Virtuals
 */
MessageSchema.virtual('status').set(function(status) {
    this._status = status;
}).get(function() {
    return this._status;
});

MessageSchema.virtual('attachment').set(function(file) {
    this._attachment = file;
}).get(function() {
    return this._attachment;
});

/**
 * Methods
 */
MessageSchema.methods = {
    hasRead: function(user) {
        var userArr = this.isRead;
        return ( userArr.indexOf(user) !== -1);
    }  
};

mongoose.model('Message', MessageSchema);
