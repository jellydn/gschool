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
    }
});


/**
 * Statics
 */
ClassSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('createBy', 'name username avatar').exec(cb);
};

ClassSchema
.virtual('notes')
.get(function () {
  return this._notes;
})
.set(function (obj) {
  this._notes = obj;
});

ClassSchema
.virtual('quizzes')
.get(function () {
  return this._quizzes;
})
.set(function (obj) {
  this._quizzes = obj;
});

ClassSchema.set('toJSON', {
   virtuals: true
});

mongoose.model('Class', ClassSchema);
