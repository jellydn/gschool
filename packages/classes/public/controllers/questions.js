'use strict';

angular.module('mean').controller('QuestionsController', ['$scope','$window','$rootScope','$upload', '$stateParams','$http','$location','toaster', 'Global','Classes','Questions','Socket','WizardHandler',
    function($scope,$window,$rootScope, $upload, $stateParams, $https, $location,toaster, Global,Classes,Questions,Socket,WizardHandler) {
        $scope.global = Global;
        $scope.global.classActive = "active";
        $scope.question = {type : "one" };        
        $scope.expireTime = "";
        $scope.questionHtml = "";
        $scope.answerHtml = "";
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

        $scope.$on('LoadCreateQuestionJs', function() {

        });

        $scope.previewQuestion = function(){
             var listAnswerArr = [];

             var html = '';
             if ($scope.question.description != undefined && $scope.question.description.length) {
                html = '<h4>' + $scope.question.description + ' ?</h4>';
             };

             if ($scope.question.answerA != undefined && $scope.question.answerA.length) 
                listAnswerArr.push($scope.question.answerA);
            
            if ($scope.question.answerB != undefined && $scope.question.answerB.length)
                listAnswerArr.push($scope.question.answerB);
            
            if ($scope.question.answerC != undefined && $scope.question.answerC.length)
                listAnswerArr.push($scope.question.answerC);
            
            if ($scope.question.answerD != undefined && $scope.question.answerD.length)
                listAnswerArr.push($scope.question.answerD);
            
            if ($scope.question.answerE != undefined && $scope.question.answerE.length)
                listAnswerArr.push($scope.question.answerE);

            if (html != undefined) {
                html += '<ul>';
                for (var i = 0; i < listAnswerArr.length; i++) {
                    if(listAnswerArr[i].length)
                        html += '<li>' + listAnswerArr[i] + '.</li>';
                };
                html += '</ul>';
            };
            $scope.questionHtml = html;
            return $scope.questionHtml ;
        }

        $scope.previewCorrectAnswer = function(){
            var rightanswerArr = [];
            var html = '<h4> Correct answer: </h4>';
            
            if ($scope.question.type == 'one') {
                if($scope.question.oneselection != undefined  && $scope.question.oneselection.length)
                    rightanswerArr.push($scope.question.oneselection);
            }
            else
            {
                // process multi choice
                if($scope.question.multiselectionA)
                    rightanswerArr.push($scope.question.answerA);
                if($scope.question.multiselectionB)
                    rightanswerArr.push($scope.question.answerB);
                if($scope.question.multiselectionC)
                    rightanswerArr.push($scope.question.answerC);
                if($scope.question.multiselectionD)
                    rightanswerArr.push($scope.question.answerD);
                if($scope.question.multiselectionE)
                    rightanswerArr.push($scope.question.answerE);
            }



            html += '<ul>';
            for (var i = 0; i < rightanswerArr.length; i++) {
                html += '<li>' + rightanswerArr[i] + '</li>';
            };
            html += '</ul>';
            $scope.answerHtml = html;
            return $scope.answerHtml ;
        }
        

        $scope.validForm = function(step){
            if(step == 1 &&  $scope.defaultQuizForm == undefined){
                 $scope.defaultQuizForm  = angular.copy($scope.quizForm);
            }
        }

        $scope.showOneSelection = function(){
            return $scope.question.type == 'one';
        }

        $scope.showMultiSelection = function(){
            return $scope.question.type != 'one';
        }

        $scope.$on('LoadDateTimePicker', function() {

            $('#ondatetime').datetimepicker({
                      mask:true,
                      onChangeDateTime:function(dp,$input){
                        $scope.expireTime = $input.val();
                      } 
                  });
            
            
        });

        $scope.$on('addQuestion', function(question) {
            $scope.find();
            
        });

        $scope.remove = function(question) {
            if (question) {
                question.$remove();

                for (var i in $scope.questions) {
                    if ($scope.questions[i] === question) {
                        $scope.questions.splice(i, 1);
                    }
                }
            }
        };
        // list all
        $scope.find = function() {
            Questions.query( { 'classId' : $stateParams.classId},  function(questions) {
                $scope.questions = questions;
            });

        };
        // create question
        $scope.finishedWizard = function(){

            if (!$scope.quizForm.$valid) {
                toaster.pop("info","Add a question","Please enter required field!");
                if ($scope.question.description == undefined || !$scope.question.description.length) {
                    WizardHandler.wizard().goTo(0);
                } else {
                    WizardHandler.wizard().previous();
                }
            }
            else
            {
                var listAnswerArr = [];
                var rightanswerArr = [];

                // process one selection
                if ($scope.question.type == 'one') {
                    if($scope.question.oneselection == undefined){
                        toaster.pop("info","Add a question","Please select your answer!");
                        WizardHandler.wizard().previous();
                        return;
                    }
                    else
                    {
                        rightanswerArr.push($scope.question.oneselection);
                    }
                    
                }
                else
                {
                    // process multi choice
                    if($scope.question.multiselectionA)
                        rightanswerArr.push($scope.question.answerA);
                    if($scope.question.multiselectionB)
                        rightanswerArr.push($scope.question.answerB);
                    if($scope.question.multiselectionC)
                        rightanswerArr.push($scope.question.answerC);
                    if($scope.question.multiselectionD)
                        rightanswerArr.push($scope.question.answerD);
                    if($scope.question.multiselectionE)
                        rightanswerArr.push($scope.question.answerE);

                    if(!rightanswerArr.length){
                        toaster.pop("info","Add a question","Please select your answer!");
                        WizardHandler.wizard().previous();
                        return;
                    }
                }

                if ($scope.question.answerA != undefined && $scope.question.answerA.length) 
                    listAnswerArr.push($scope.question.answerA);
                
                if ($scope.question.answerB != undefined && $scope.question.answerB.length)
                    listAnswerArr.push($scope.question.answerB);
                
                if ($scope.question.answerC != undefined && $scope.question.answerC.length)
                    listAnswerArr.push($scope.question.answerC);
                
                if ($scope.question.answerD != undefined && $scope.question.answerD.length)
                    listAnswerArr.push($scope.question.answerD);
                
                if ($scope.question.answerE != undefined && $scope.question.answerE.length)
                    listAnswerArr.push($scope.question.answerE);

                var question = new Questions({
                    ofClass : $stateParams.classId,
                    description : $scope.question.description,
                    listAnswer : listAnswerArr,
                    rightAnswer : rightanswerArr,
                    type : $scope.question.type
                });

                question.$save(function(response) {
                    $rootScope.$broadcast('addQuestion',response);
                    toaster.pop("success","Add a question","Your question has been added!");
                    // reset data
                    $scope.type = "one";
                    $('#form-quiz :input[type="text"]').each(function(){
                        $(this).val('');
                    });
                    $scope.quizForm = angular.copy($scope.defaultQuizForm);
                    $scope.question = {type : "one"} ;
                    WizardHandler.wizard().goTo(0);
                    $scope.find();
                });
                
            }
                
        }

}]);
