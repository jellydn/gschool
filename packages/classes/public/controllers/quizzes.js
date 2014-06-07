'use strict';

angular.module('mean').controller('QuizzesController', ['$scope','$rootScope','$upload', '$stateParams','$http','$location', 'Global','Classes','Quizzes','Socket','WizardHandler',
    function($scope,$rootScope, $upload, $stateParams, $https, $location, Global,Classes,Quizzes,Socket,WizardHandler) {
        $scope.global = Global;
        $scope.global.classActive = "active";
        $scope.type = "one";        
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

        $scope.$on('LoadCreateQuizJs', function() {
                 
        });

        $scope.previewQuestion = function(){
             var listAnswerArr = [];

             var html = '';
             if ($scope.quizForm.question.$modelValue != undefined) {
                html = '<h4>' + $scope.quizForm.question.$modelValue + ' ?</h4>';
             };

             if ($scope.quizForm.answerA.$modelValue != undefined) 
                listAnswerArr.push($scope.quizForm.answerA.$modelValue);
            
            if ($scope.quizForm.answerB.$modelValue != undefined)
                listAnswerArr.push($scope.quizForm.answerB.$modelValue);
            
            if ($scope.quizForm.answerC.$modelValue != undefined)
                listAnswerArr.push($scope.quizForm.answerC.$modelValue);
            
            if ($scope.quizForm.answerD.$modelValue != undefined)
                listAnswerArr.push($scope.quizForm.answerD.$modelValue);
            
            if ($scope.quizForm.answerE.$modelValue != undefined)
                listAnswerArr.push($scope.quizForm.answerE.$modelValue);
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
            var html = '<h4> Correct answer </h4>';
            
            if ($scope.quizForm.type.$modelValue == 'one') {
                if($scope.quizForm.oneselectionA.$modelValue != undefined)
                    rightanswerArr.push($scope.quizForm.oneselectionA.$modelValue);
                
            }
            else
            {
                // process multi choice
                if($scope.quizForm.multiselectionA.$viewValue)
                    rightanswerArr.push($scope.quizForm.answerA.$modelValue);
                if($scope.quizForm.multiselectionB.$viewValue)
                    rightanswerArr.push($scope.quizForm.answerB.$modelValue);
                if($scope.quizForm.multiselectionC.$viewValue)
                    rightanswerArr.push($scope.quizForm.answerC.$modelValue);
                if($scope.quizForm.multiselectionD.$viewValue)
                    rightanswerArr.push($scope.quizForm.answerD.$modelValue);
                if($scope.quizForm.multiselectionE.$viewValue)
                    rightanswerArr.push($scope.quizForm.answerE.$modelValue);
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
            
        }

        $scope.showOneSelection = function(){
            return $scope.quizForm.type.$modelValue == 'one';
        }

        $scope.showMultiSelection = function(){
            return $scope.quizForm.type.$modelValue != 'one';
        }

        $scope.$on('LoadDateTimePicker', function() {

            $('#ondatetime').datetimepicker({
                      mask:true,
                      onChangeDateTime:function(dp,$input){
                        $scope.expireTime = $input.val();
                      } 
                  });
            
            
        });

        $scope.finishedWizard = function(){

            if (!$scope.quizForm.$valid) {
                alert('Please enter required field!');
                if (!$scope.quizForm.question.$valid) {
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
                if ($scope.quizForm.type.$modelValue == 'one') {
                    if($scope.quizForm.oneselectionA.$modelValue == undefined){
                        alert('Please select your answer!');
                        WizardHandler.wizard().previous();
                        return;
                    }
                    else
                    {
                        rightanswerArr.push($scope.quizForm.oneselectionA.$modelValue);
                    }
                    
                }
                else
                {
                    // process multi choice
                    if($scope.quizForm.multiselectionA.$viewValue)
                        rightanswerArr.push($scope.quizForm.answerA.$modelValue);
                    if($scope.quizForm.multiselectionB.$viewValue)
                        rightanswerArr.push($scope.quizForm.answerB.$modelValue);
                    if($scope.quizForm.multiselectionC.$viewValue)
                        rightanswerArr.push($scope.quizForm.answerC.$modelValue);
                    if($scope.quizForm.multiselectionD.$viewValue)
                        rightanswerArr.push($scope.quizForm.answerD.$modelValue);
                    if($scope.quizForm.multiselectionE.$viewValue)
                        rightanswerArr.push($scope.quizForm.answerE.$modelValue);

                    if(!rightanswerArr.length){
                        alert('Please select your answer!');
                        WizardHandler.wizard().previous();
                        return;
                    }
                }

                 if ($scope.quizForm.answerA.$modelValue != undefined && $scope.quizForm.answerA.$modelValue.length) 
                    listAnswerArr.push($scope.quizForm.answerA.$modelValue);
                
                if ($scope.quizForm.answerB.$modelValue != undefined && $scope.quizForm.answerB.$modelValue.length)
                    listAnswerArr.push($scope.quizForm.answerB.$modelValue);
                
                if ($scope.quizForm.answerC.$modelValue != undefined && $scope.quizForm.answerC.$modelValue.length)
                    listAnswerArr.push($scope.quizForm.answerC.$modelValue);
                
                if ($scope.quizForm.answerD.$modelValue != undefined && $scope.quizForm.answerD.$modelValue.length)
                    listAnswerArr.push($scope.quizForm.answerD.$modelValue);
                
                if ($scope.quizForm.answerE.$modelValue != undefined && $scope.quizForm.answerE.$modelValue.length)
                    listAnswerArr.push($scope.quizForm.answerE.$modelValue);

                // set expire time
                if ($scope.quizForm.occurChecked.$modelValue) {
                    if(!$scope.expireTime.length){
                        alert('Please select your expired date!');
                        return;
                    }
                };

                var quiz = new Quizzes({
                    ofClass : $stateParams.classId,
                    question : $scope.quizForm.question.$modelValue,
                    listAnswer : listAnswerArr,
                    rightAnswer : rightanswerArr,
                    type : $scope.quizForm.type.$modelValue,
                    expired : $scope.expireTime
                });

                quiz.$save(function(response) {
                    $location.path('classes/' + $stateParams.classId);
                });
                
            }
                
        }

}]);
