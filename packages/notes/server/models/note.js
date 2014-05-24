'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Note Schema
 */
var NoteSchema = new Schema({
    createBy: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        default: '',
        trim: true
    },
    content: {
        type: String,
        default: '',
        trim: true
    },
    tags: {
        type: Array
    },
    dateCreate: {
        type: Date,
        default: Date.now
    },
    sendToClass: {
        type: Array
    },
    sendToMembers: {
        type: Array
    }
});


/**
 * Statics
 */
NoteSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('createBy', 'name username').exec(cb);
};

mongoose.model('Note', NoteSchema);
