'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Chat Schema
 */
var ChatSchema = new Schema({
    createBy: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    to: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        default: '',
        trim: true
    },
    token : {
        type : String,
        default : '',
        trim : true
    },
    dateCreate: {
        type: Date,
        default: Date.now
    },
    file : {
        type: String
    }
});


/**
 * Statics
 */
ChatSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('createBy', 'name username avatar').populate('to', 'name username avatar').exec(cb);
};


ChatSchema.post('save',function(doc){
    var Notifications = mongoose.model('Notification');
    var notify = new Notifications();
    notify.source = doc;
    notify.from = doc.createBy;
    notify.to = doc.to;
    notify.type = 'chat';
    notify.content = '{subject} messaged to you.';
    notify.save();
});

mongoose.model('Chat', ChatSchema);
