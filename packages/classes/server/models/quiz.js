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
    }).select('name createBy ofClass playMembers questions questionList dateCreate').populate('createBy', 'name username avatar').populate('ofClass', 'name').exec(cb);
};


QuizSchema
.virtual('questionList')
.get(function () {
  return this._questionList;
})
.set(function (obj) {
  this._questionList = obj;
});

QuizSchema.set('toJSON', {
   virtuals: true
});


mongoose.model('Quiz', QuizSchema);
