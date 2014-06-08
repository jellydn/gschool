'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Quiz Schema
 */
var QuizSchema = new Schema({
    createBy: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    ofClass: {
        type: Schema.ObjectId,
        ref: 'Class'
    },
    name: {
        type: String,
        default: '',
        trim: true
    },
    questions: {
    },
    playMembers: {
        type: Array
    },
    dateCreate: {
        type: Date,
        default: Date.now
    },
    expireAt: {
        type: Date,
        expires: 0
    }
});


/**
 * Statics
 */
QuizSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('createBy', 'name username avatar').exec(cb);
};

mongoose.model('Quiz', QuizSchema);
