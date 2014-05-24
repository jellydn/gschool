'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Comment Schema
 */
var CommentSchema = new Schema({
    createBy: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    onNote: {
        type: Schema.ObjectId,
        ref: 'Note'
    },
    content: {
        type: String,
        default: '',
        trim: true
    },
    dateCreate: {
        type: Date,
        default: Date.now
    }
});


/**
 * Statics
 */
CommentSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('createBy', 'name username').exec(cb);
};

mongoose.model('Comment', CommentSchema);
