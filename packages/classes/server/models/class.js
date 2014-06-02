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
    description: {
        type: String,
        default: '',
        trim: true
    },
    members: {
        type: Array
    },
    pendingMembers: {
        type: Array
    },
    tags: {
        type: Array
    },
    dateCreate: {
        type: Date,
        default: Date.now
    },
    file : {
        type: String
    },
    notes : {}
});


/**
 * Statics
 */
ClassSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('createBy', 'name username avatar').exec(cb);
};

/**
 * Virtuals
 */
// ClassSchema.virtual('notes').set(function(notes) {
//     this._notesOfClass= notes;
// }).get(function() {
//     return this._notesOfClass;
// });

mongoose.model('Class', ClassSchema);
