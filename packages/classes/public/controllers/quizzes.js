'use strict';

angular.module('mean').controller('QuizzesController', ['$scope','$rootScope','$upload', '$stateParams','$http','$location', 'Global','Classes','Quizzes','Socket','WizardHandler',
    function($scope,$rootScope, $upload, $stateParams, $https, $location, Global,Classes,Quizzes,Socket,WizardHandler) {
        $scope.global = Global;
        $scope.global.classActive = "active";
        $scope.expireTime = "";
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

        // create quiz
        $scope.create = function() {
            var questionsSelection = $('#selectQuestion').select2('data');
            var quiz = new Quizzes({
                name : $scope.name,
                ofClass : $stateParams.classId,
                expired : $scope.expireTime,
                questions : questionsSelection
            });

            quiz.$save(function(msg) {
                // select file again
                $location.path('classes/' + $stateParams.classId + '#quizzes')
            });

            this.name = '';
        };

}]);
