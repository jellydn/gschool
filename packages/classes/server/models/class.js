'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Class Schema
 */
var ClassSchema = new Schema({
    createBy: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        default: '',
        trim: true
    },
    members: {
        type: Array
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
});


/**
 * Statics
 */
ClassSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('createBy', 'name username').exec(cb);
};

mongoose.model('Class', ClassSchema);
