'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Schedule Schema
 */
var ScheduleSchema = new Schema({
    from: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    fromName: {
        type: String
    },
    to: [ {
        type: Schema.ObjectId,
        ref: 'User'
        }
    ],
    message: {
        type: String,
        default: '',
        trim: true
    },
    dateSent: {
        type: Date,
        default: Date.now
    },
    file : {
        type: String
    },
    repeat : {
        type: String
    }
});


/**
 * Statics
 */
ScheduleSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('from', 'name username').populate('to', 'name username').exec(cb);
};

mongoose.model('Schedule', ScheduleSchema);
