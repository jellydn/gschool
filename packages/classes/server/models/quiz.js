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
    }).select('name createBy ofClass playMembers questions questionList dateCreate').populate('createBy', 'name username avatar').populate('ofClass', 'name members').exec(cb);
};

QuizSchema.post('save',function(doc){
    var Classes = mongoose.model('Class');
    var Notifications = mongoose.model('Notification');
    Classes.load(doc.ofClass,function(e,classModel){
        if (e) {
            console.error(e)
        }
        else
        {
            for(var index = 0 ; index <classModel.members.length ; index++){
                var notify = new Notifications();
                notify.source = doc;
                notify.from = doc.createBy;
                notify.to = classModel.members[index];
                notify.type = 'quiz';
                notify.content =  classModel.createBy.name + ' has created quiz: '+ doc.name;
                notify.save();
            }
        }
    });
});

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
