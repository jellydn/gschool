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
    fileNames : {
        type : Array
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
    sendToClassIds: {
        type: Array
    },
    sendToMembers: {
        type: Array
    },
    totalComments : {
        type: Number,
        default : 0
    }
});

NoteSchema
.virtual('belongClasses')
.get(function () {
  return this._belongClasses;
})
.set(function (obj) {
  this._belongClasses = obj;
});

NoteSchema.set('toJSON', {
   virtuals: true
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
