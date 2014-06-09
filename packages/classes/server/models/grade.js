'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Grade Schema
 */
var GradeSchema = new Schema({
    createBy: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    ofClass: {
        type: Schema.ObjectId,
        ref: 'Class'
    },
    inQuiz: {
    },
    listAnswer: {
        type: Array
    },
    point : {

    },
    dateCreate: {
        type: Date,
        default: Date.now
    },
});


/**
 * Statics
 */
GradeSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('createBy', 'name username avatar').exec(cb);
};

mongoose.model('Grade', GradeSchema);
