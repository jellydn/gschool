'use strict';

angular.module('mean').controller('ClassesController', ['$scope', '$stateParams','$http', '$location', 'Global','Classes','Socket',
    function($scope, $stateParams, $http, $location, Global,Classes,Socket) {
        $scope.global = Global;
        $scope.global.classActive = "active";

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

        $scope.$on('LoadCreateClassJs', function() {
                $('#tags_1').tagsInput({width:'auto'});
                $('.wysihtml5').wysihtml5();
        });

        $scope.$on('LoadEditClassJs', function() {
                $scope.isEditModel = true;
        });

        $scope.hasAuthorization = function(classModel) {
            if (!classModel || !classModel.createBy) return false;
            return $scope.global.isAdmin || classModel.createBy._id === $scope.global.user._id;
        };

        // list all
        $scope.find = function() {
            Classes.query(function(classes) {
                $scope.classes = classes;
            });
        };

        // find by id

        $scope.findOne = function() {
            Classes.get({
                classId: $stateParams.classId
            }, function(classModel) {
                classModel.tags = classModel.tags.join(',');
                $scope.class = classModel;
                if ($scope.isEditModel) {
                    $('#tags_1').val(classModel.tags);
                    $('#tags_1').tagsInput({
                                                width:'auto',  
                                                'height':'30px',
                                                'interactive':true,
                                                'defaultText':'add a tag'
                                            }
                                            );
                    $('.wysihtml5').wysihtml5();
                    $scope.isEditModel = false;
                };
            });
        };

        // create note

         $scope.create = function() {
           
            this.description = $('.wysihtml5').val();
            this.tags = $('.tags').val();
            var classModel = new Classes({
                name : this.name,
                description : this.description,
                tags : this.tags
            });

            classModel.$save(function(response) {
                $location.path('classes/' + response._id);
            });
            this.name = '';
            $('#tags_1').importTags('');
            this.description = '';
            
        };

        $scope.remove = function(classModel) {
            if (classModel) {
                classModel.$remove();

                for (var i in $scope.classes) {
                    if ($scope.classes[i] === classModel) {
                        $scope.classes.splice(i, 1);
                    }
                }
            } else {
                $scope.class.$remove(function(response) {
                    $location.path('classes');
                });
            }
        };

        $scope.update = function() {
            var classModel = $scope.class;
            classModel.description = $('.wysihtml5').val();
            classModel.tags = $('.tags').val();
            if (!classModel.updated) {
                classModel.updated = [];
            }
            classModel.updated.push(new Date().getTime());

            classModel.$update(function() {
                $location.path('classes/' + classModel._id);
            });
        };
    }
]);
