'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Classes = mongoose.model('Class'),
    Notifications = mongoose.model('Notification'),
    Questions = mongoose.model('Question'),
    Quizzes = mongoose.model('Quiz'),
    Grades = mongoose.model('Grade'),
    User = mongoose.model('User'),
    _ = require('lodash');

/**
 * List of grade belong a class
 */
exports.all = function(req, res) {
    var q = Grades.find({ofClass : req.query.classId});
    q.sort({ dateCreate : 'desc' }).populate('createBy', 'name username avatar').exec(function(err, questions) {
        if (err) {
            console.log(err);
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(questions);
        }
    });

};

/**
 * Create a quiz
 */

 exports.create = function(req, res) {

    Quizzes.load(req.body.quizId, function(err, item) {
        if (err) return next(err);
        if (!item) return next(new Error('Failed to load quiz ' + req.body.quizId));

            // check member play or not
            if(!req.body.isTeacher){
                for (var i = 0; i < item.playMembers.length; i++) {
                    if(item.playMembers[i].username == req.user.username)
                    {
                        return res.jsonp({point: item.playMembers[i].point , error : 'You could play one time!'});
                    }
                };
            }

            Questions.find({ _id : { '$in' : item.questions }}).select('rightAnswer').exec(function(e,questions){
                if (e) return next(e);
                if (!questions) return next(new Error('Failed to load questions of quiz ' + req.body.quizId));
                item.questionList = questions;
                req.quiz = item;
                
                var point = 0;
                var answerData = req.body.answer;
                
                if(answerData.length == questions.length)
                {
                    for (var i = 0; i < questions.length; i++) {
                        if ( questions[i].id == answerData[i]._id ) {
                            if(_.isEqual(questions[i].rightAnswer,answerData[i].rightAnswer)){
                                point++;
                            }
                        };
                    };
                }

                // add to quiz
                if(!req.body.isTeacher){

                    // check and insert to member of class
                    if (req.quiz.ofClass.members.indexOf(req.user.username) == -1) {
                        // insert user 
                        Classes.load(req.quiz.ofClass._id,function(e,classModel){
                            if (e) {
                                console.error(e);
                            }
                            else
                            {
                                // insert username
                                classModel.members.push(req.user.username);
                                classModel.save(function(e,classResult){
                                    if (e) {
                                        console.error(e);
                                    }
                                    else
                                    {
                                        console.log(classResult);
                                    }
                                });
                            }
                        });
                    };

                    var grade = new Grades();
                    grade.ofClass = req.quiz.ofClass;
                    grade.inQuiz = { _id : req.quiz._id , name : req.quiz.name };
                    grade.createBy = req.user;
                    grade.point = point + '/' + answerData.length;
                    grade.listAnswer = answerData;

                    item.playMembers.push({ id : req.user.id , name : req.user.name, username : req.user.username, point : grade.point });

                    item.save(function(er){
                        if(er)
                            console.error(er);
                        else
                            console.log(item);
                    });

                    grade.save(function(err){
                        if (err) {
                            return res.send('users/signup', {
                                errors: err.errors,
                                grade: grade
                            });
                        } else {
                            res.jsonp(grade);
                            // notify to student
                            var notify = new Notifications();
                            notify.source = grade;
                            notify.from = req.user;
                            notify.to = req.user.username;
                            notify.type = 'activity';
                            notify.content =  req.user.name + ' have got '+ grade.point + ' point.';
                            notify.save();
                        }
                    });
                }
                else
                {
                    res.jsonp({'point' : point + '/' + answerData.length});
                }

            });
            
    });

};
