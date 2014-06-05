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
    question: {
        type: String,
        default: '',
        trim: true
    },
    rightAnswer: {
        type: Array
    },
    listAnswer: {
        type: Array
    },
    playMembers: {
        type: Array
    },
    dateCreate: {
        type: Date,
        default: Date.now
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
