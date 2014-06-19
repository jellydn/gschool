'use strict';

angular.module('mean').controller('ClassesController', ['$scope','$rootScope','$upload', '$stateParams','$timeout','$http','$location', 'Global','dialogs','toaster','Classes','Notes','Quizzes','Socket',
    function($scope,$rootScope, $upload, $stateParams,$timeout, $https, $location, Global,dialogs,toaster,Classes,Notes,Quizzes,Socket) {
        $scope.global = Global;
        $scope.global.classActive = "active";
        $scope.fileName = "";        

        // utility function
        $scope.$on('LoadJs', function() {
                 $("#selectStudent").select2({
                    placeholder: "Search a recipient",
                    multiple: true,
                    ajax: { 
                        url: "/api/users",
                        dataType: 'jsonp',
                        data: function (term, page) {
                            return {
                                q: term,
                                page_limit: 10,
                            };
                        },
                        results: function (data, page) {
                            var classData = [];
                            for (var i = 0; i < data.length; i++) {
                                classData[i] = { id : data[i]._id , text : data[i].name , owner : data[i]._id, file : data[i].avatar };
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


        $scope.hasNoteAuthorization = function(note) {
            if (!note || !note.createBy) return false;
            return $scope.global.isAdmin || note.createBy._id === $scope.global.user._id;
        };

        $scope.hasQuizAuthorization = function(quiz) {
            if (!quiz || !quiz.createBy) return false;
            return $scope.global.isAdmin || quiz.createBy._id === $scope.global.user._id;
        };

        $scope.hasPlay = function(quiz,username){
            var hasPlayClass = "";
            _.findKey(quiz.playMembers, function(chr) {
                if (chr.username == username) {
                    hasPlayClass = "green";
                };
            });
            return hasPlayClass;
        }

        $scope.getPoint = function(quiz,username){
            var point = "N/A";
            _.findKey(quiz.playMembers, function(chr) {
                if (chr.username == username) {
                    point = chr.point;
                };
            });
            return point;
        }

        $scope.getGradeType = function(type,coins){
            if (type == 'coins') {
                return '+' + coins;
            }
            else
            {
                return '<i class="fa fa-list"></i>';
            }
        }

        $scope.getGradeColor = function(type){
            if (type == 'coins') {
                return 'purple';
            }
            else
            {
                return 'red';
            }
        }

        // invite students

        $scope.invite = function(){
            var recipients = $('#selectStudent').select2('val');
            $('#myModal').modal('hide');
            var classModel = $scope.class;

            classModel.$invite({ recipients : recipients },function(response){
                console.log(response);
            });

        }

        // join class

        $scope.join = function(){
            var classModel = $scope.class;
            classModel.$join({ userid : $scope.global.user._id , task : 'join' },function(response){
                $scope.class = response;
            });
        }


        $scope.leave = function(){
            var classModel = $scope.class;
            classModel.$join({ userid : $scope.global.user._id , task : 'leave' },function(response){
                $scope.class = response;
            });
        }

        $scope.broadcast = function(){
            var classModel = $scope.class;
            var tmpData = [];
             for (var i = 0; i < classModel.students.length; i++) {
                tmpData[i] = { 'id' : classModel.students[i]._id , 'text' : classModel.students[i].name } ;
            };
            $("#selectRecipient").select2('data', tmpData);
            $("#selectRecipient").select2('readonly', true);
            $('#myModalMessage').modal();
        }

         // upload photo 
        $scope.onFileSelect = function($files) {
            for (var i = 0; i < $files.length; i++) {
              var file = $files[i];
              $scope.upload = $upload.upload({
                url: '/upload/class', 
                method: 'POST',
                withCredentials: true,
                file: file
              }).success(function(data, status, headers, config) {
                // file is uploaded successfully
                $scope.fileName = data.files.file.name;
              })
              .progress(function(evt) {
                var percent =parseInt(100.0 * evt.loaded / evt.total);
                
              });
            }
        
      };

        // list all
        $scope.find = function() {
            Classes.query(function(classes) {
                $scope.classes = classes;
            });
        };

        // find by id

        $scope.findOne = function() {
            $('#myModalDetail').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            $('.dialogs-default button').trigger('click');
            Classes.get({
                classId: $stateParams.classId
            }, function(classModel) {
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
            },function(err){
                if (err.status == 500) {
                    toaster.pop("warning","Your request is not exist!");
                    $timeout(function(){ 
                     $location.path('classes');
                    },1500);
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
                tags : this.tags,
                file : $scope.fileName
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

        $scope.removeNote = function(note) {
            if (note) {
                Notes.get({ noteId : note._id},function(noteModel){
                    noteModel.$remove();
                    for (var i in $scope.class.notes) {
                        if ($scope.class.notes[i] === note) {
                            $scope.class.notes.splice(i, 1);
                        }
                    }
                });                
            }
        };

        $scope.removeQuiz = function(quiz) {
            if (quiz) {
                Quizzes.get({ quizId : quiz._id},function(quizModel){
                    quizModel.$remove();
                    for (var i in $scope.class.quizzes) {
                        if ($scope.class.quizzes[i] === quiz) {
                            $scope.class.quizzes.splice(i, 1);
                        }
                    }
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

            if ($scope.fileName != "") {
                classModel.file = $scope.fileName;
            };

            classModel.updated.push(new Date().getTime());

            classModel.$update(function() {
                $location.path('classes/' + classModel._id);
            });
        };
    }
]);
