'use strict';

angular.module('mean').controller('QuizzesController', ['$scope','$rootScope','$upload', '$stateParams','$http','$location', 'Global','Classes','Quizzes','Socket','WizardHandler',
    function($scope,$rootScope, $upload, $stateParams, $https, $location, Global,Classes,Quizzes,Socket,WizardHandler) {
        $scope.global = Global;
        $scope.global.classActive = "active";
        $scope.type = "one";        

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

        $scope.validForm = function(step){
            
        }


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
                var quiz = new Quizzes({
                    ofClass : $stateParams.classId,
                    question : $scope.quizForm.question.$modelValue,
                    listAnswer : $scope.quizForm.answer.$modelValue.split(','),
                    rightAnswer : $scope.quizForm.rightanswer.$modelValue.split(','),
                    type : $scope.quizForm.type.$modelValue
                });

                quiz.$save(function(response) {
                    $location.path('classes/' + $stateParams.classId);
                });
                
            }
                
        }

}]);
