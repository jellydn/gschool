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
    }
    ,
    dateCreate: {
        type: Date,
        default: Date.now
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

mongoose.model('Chat', ChatSchema);
