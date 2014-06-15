'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Statistic Schema
 */
var StatisticSchema = new Schema({
    createBy: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    coins: {
        type: Number,
        default: 0
    },
    notes: {
        type: Number,
        default: 0
    },
    classes: {
        type: Number,
        default: 0
    },
    quizzes: {
        type: Number,
        default: 0
    }
});

StatisticSchema.set('toJSON', {
   virtuals: true
});

/**
 * Statics
 */
StatisticSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('createBy', 'name username').exec(cb);
};

mongoose.model('Statistic', StatisticSchema);
