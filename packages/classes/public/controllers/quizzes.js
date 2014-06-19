'use strict';

angular.module('mean').controller('QuizzesController', ['$scope','$rootScope','$upload', '$stateParams','$timeout','$translate','dialogs','$http','$location','toaster','Global','Classes','Quizzes','Grades','Socket','WizardHandler',
    function($scope,$rootScope, $upload, $stateParams,$timeout,$translate,dialogs, $https, $location,toaster, Global,Classes,Quizzes,Grades,Socket,WizardHandler) {
        $scope.global = Global;
        $scope.global.classActive = "active";
        $scope.expireTime = "";
        $scope.answerArr = {};
        // utility function
        $scope.$on('LoadJs', function() {
        		// load menu
                $('#nav-accordion').dcAccordion({
			        eventType: 'click',
			        autoClose: true,
			        saveState: true,
			        disableLink: true,
			        speed: 'slow',
			        showCount: false,
			        autoExpand: false,
			        classExpand: 'dcjq-current-parent'
			    });

        });

        $scope.$on('LoadCreateQuizJs', function() {
               var ajaxUrl = "/api/questions/" + $stateParams.classId + '/';
               $("#selectQuestion").select2({
                    placeholder: "Search a question",
                    multiple: true,
                    ajax: { 
                        url: ajaxUrl,
                        dataType: 'jsonp',
                        data: function (term, page) {
                            return {
                                q: term, // search term
                                page_limit: 10,
                            };
                        },
                        results: function (data, page) {
                            var classData = [];
                            for (var i = 0; i < data.length; i++) {
                                classData[i] = { id : data[i]._id , text : data[i].description , owner : data[i]._id };
                            };
                            return {results: classData};
                        }
                    },
                    initSelection: function(element, callback) {
                        var id=$(element).val();
                    },
                    formatResult: userFormatResult, 
                    formatSelection: userFormatSelection,  
                    escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
                });   
        });

        $scope.$on('LoadDateTimePicker', function() {

            $('#ondatetime').datetimepicker({
                      mask:true,
                      onChangeDateTime:function(dp,$input){
                        $scope.expireTime = $input.val();
                      } 
                  });
            
            
        });

        // process input

        $scope.getName = function(id,type,index){
            if (type == 'one') {
                return id;
            }
            else
            {
                return id + '-' + index;
            }
        }


        $scope.getType = function(type){
            if (type == 'one') {
                return 'radio';
            }
            else
                return 'checkbox';
        }

        $scope.processQuestion = function(index,id,type){
            
        }

        // submit answer
        $scope.evaluate = function(questionsList){
            var userData = [];
            for (var i = 0; i < questionsList.length; i++) {
                var item = questionsList[i];

                if (item.type == 'one') {
                    var answerData = [];
                    if ( item._id in $scope.answerArr) {
                        answerData.push($scope.answerArr[item._id]);
                        userData.push({ _id : item._id , rightAnswer: answerData});
                    }
                    else
                    {
                        WizardHandler.wizard().goTo(i);
                        toaster.pop("info","Question " + (i + 1),"Please select your answer!");
                        return ;
                    }
                }
                else
                {
                    // check has select
                    var hasSelected = false;
                    var answerData = [];
                    for (var j = 0; j < item.listAnswer.length; j++) {
                        var key = (item._id + '-' +j );
                        if ( key in $scope.answerArr) {
                            if($scope.answerArr[key])
                            {
                                hasSelected = true;
                                answerData.push(item.listAnswer[j]);
                            }
                        }
                    };
                    if (!hasSelected) {
                        WizardHandler.wizard().goTo(i);
                        toaster.pop("info","Question " + (i + 1),"Please select your answer!");
                        return ;
                    }
                    else
                    {
                        userData.push({ _id : item._id , rightAnswer: answerData });
                    }
                }
                
            };

            // ask to join
            

            // teacher play
            var isTeacher = 0;
            var isMember = 0;

            if ($scope.global.user._id == $scope.quiz.createBy._id) {
                isTeacher = 1;
            } 
            else
            {
                if($scope.quiz.ofClass.members.indexOf($scope.global.user._id) == -1)
                {
                    var dlg = dialogs.confirm("Confirm To Join Class","Are you want to join this class? <br/> If you click on 'Yes', you will become a member. Otherwise, you will be back to class.");
                        dlg.result.then(function(btn){
                            isMember = 1;
                            Grades.save({
                                quizId: $stateParams.quizId,
                                answer: userData,
                                isTeacher : isTeacher,
                                isMember : isMember
                            }, function(resp) {
                                if (resp.error != undefined) {
                                    toaster.pop("warning","Your point","Your point is " + resp.point + "." + resp.error);
                                }
                                else 
                                    toaster.pop("sucess","Your point","Your point is " + resp.point);
                                if(!isTeacher){
                                    $timeout(function(){ 
                                     $location.path('classes/' + $scope.quiz.ofClass._id );
                                    },1500);
                                }
                            });
                        },function(btn){
                            isMember = 0;
                            // redirect to class
                            $location.path('classes/' + $scope.quiz.ofClass._id );
                        });

                }
                else
                    isMember = 1;
            }

            if(isMember || isTeacher){
                Grades.save({
                    quizId: $stateParams.quizId,
                    answer: userData,
                    isTeacher : isTeacher,
                    isMember : isMember
                }, function(resp) {
                    if (resp.error != undefined) {
                        toaster.pop("warning","Your point","Your point is " + resp.point + "." + resp.error);
                    }
                    else 
                        toaster.pop("sucess","Your point","Your point is " + resp.point);
                    if(!isTeacher){
                        $timeout(function(){ 
                         $location.path('classes/' + $scope.quiz.ofClass._id );
                        },1500);
                    }
                });
            };
            
        }


        // find a quiz
        $scope.findOne = function() {
            $('#myModalDetail').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();

            Quizzes.get({
                quizId: $stateParams.quizId
            }, function(quiz) {
                $scope.quiz = quiz;

                if (!quiz.ofClass) {
                    toaster.pop("warning","Your request is not exist!");
                    $timeout(function(){ 
                     $location.path('classes');
                    },1500);
                };
                
            },function(err){
                if (err.status == 500) {
                    toaster.pop("warning","Your request is not exist!");
                    $timeout(function(){ 
                     $location.path('classes');
                    },1500);
                };
            });
        };

        $scope.listGrade = function(){

        }

        // create quiz
        $scope.create = function() {
            var questionsSelection = $('#selectQuestion').select2('val');
            console.log(questionsSelection);
            var quiz = new Quizzes({
                name : $scope.name,
                ofClass : $stateParams.classId,
                expired : $scope.expireTime,
                questions : questionsSelection
            });

            quiz.$save(function(msg) {
                // select file again
                Socket.emit('createQuiz', { quiz : quiz , user : $scope.global.user});
                $location.path('classes/' + $stateParams.classId );
            });

            this.name = '';
        };

}]);
