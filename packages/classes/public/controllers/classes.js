'use strict';

angular.module('mean').controller('ClassesController', ['$scope','$rootScope','$upload', '$stateParams','$http','$location', 'Global','Classes','Socket',
    function($scope,$rootScope, $upload, $stateParams, $https, $location, Global,Classes,Socket) {
        $scope.global = Global;
        $scope.global.classActive = "active";
        $scope.fileName = "";        

        // utility function
        $scope.$on('LoadJs', function() {
                var engine = new Bloodhound({
                  name: 'recipient',
                  remote: '/api/users?q=%QUERY',
                  datumTokenizer: function(d) {
                    return Bloodhound.tokenizers.whitespace(d.val);
                  },
                  queryTokenizer: Bloodhound.tokenizers.whitespace
                });

                engine.initialize();

                $('#exampleInputEmail3').tokenfield({
                    minLength : 3 ,
                  typeahead: [null, { source: engine.ttAdapter() }]
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

        // invite students

        $scope.invite = function(){
            var recipients = $('#exampleInputEmail3').tokenfield('getTokensList',',');
            $('#myModal').modal('hide');
            this.recipient = '';
            $('#exampleInputEmail3').tokenfield('setTokens', { value: '' });
            var classModel = $scope.class;

            classModel.$invite({ recipients : recipients },function(response){
                console.log(response);
            });

        }

        // join class

        $scope.join = function(){
            var classModel = $scope.class;
            classModel.$join({ join : $scope.global.user.username },function(response){
                console.log(response);
            });
        }

        $scope.writeNote = function(){
            
        }

        $scope.sendMessage = function(){
            
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
                $('#progress').html('<div class="progress"><div class="progress-bar" role="progressbar" aria-valuenow="'+percent+'" aria-valuemin="0" aria-valuemax="100" style="width: '+percent+'%;">'+percent+'%</div></div>');
                if (percent == 100) {
                    $('#progress').html('');
                };
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
