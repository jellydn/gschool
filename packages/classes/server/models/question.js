'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Question Schema
 */
var QuestionSchema = new Schema({
    createBy: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    ofClass: {
        type: Schema.ObjectId,
        ref: 'Class'
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    rightAnswer: {
        type: Array
    },
    listAnswer: {
        type: Array
    }
});


/**
 * Statics
 */
QuestionSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('createBy', 'name username avatar').exec(cb);
};

mongoose.model('Question', QuestionSchema);
