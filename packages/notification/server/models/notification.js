'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Notification Schema
 */
var NotificationSchema = new Schema({
    from: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    to: {
        type: String
    },
    source: {
        type: Schema.ObjectId
    },
    content: {
        type: String,
        default: '',
        trim: true
    },
    dateCreate: {
        type: Date,
        default: Date.now
    },
    dateOpen: {
        type: Date,
        default: '',
    },
    status : {
        type: String,
        default: 'unread'
    },
    group : {
        type: String,
        default: 'System'
    },
    type : {
        type: String
    },
    data : {
    }
});


/**
 * Statics
 */
NotificationSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('from', 'name username').exec(cb);
};

NotificationSchema.pre('save', function(next) {
    if (!this.isNew) return next();

    var Statistics = mongoose.model('Statistic');
    var userid = this.from;
    var type = this.type;
    var data = this.data;
    // save point
    var coin = Statistics.findOne({createBy : userid},function(err,item){
        if (err) {
            console.error(err);
            next();
        }
        else
        {
            if (item != null) {
                if (type == 'coins') {
                    item.coins += data;
                    item.quizzes += 1;
                };
            }
            else {
                item = new Statistics();
                item.createBy = userid;
                if (type == 'coins') {
                    item.coins = data;
                    item.quizzes = 1;
                };
            }


            item.save(function(e,coin){
                if (e) {
                    console.error(e);
                }
                 next();
            });
                
        }
        
    });

   
});

mongoose.model('Notification', NotificationSchema);
