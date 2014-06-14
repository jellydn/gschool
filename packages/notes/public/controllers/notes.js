'use strict';

angular.module('mean').controller('NotesController', ['$scope','$rootScope','$upload', '$stateParams','$http', '$location', 'Global', 'Notes', 'Comments', 'Classes','Socket',
    function($scope,$rootScope, $upload, $stateParams, $http, $location, Global, Notes, Comments,Classes,Socket) {
        $scope.global = Global;
        $scope.isEditModel = false;
        $scope.fileNames = [];
        // Incoming
        Socket.on('onCommentCreated', function(data) {
            if (data.onNote  == $stateParams.noteId ) {
                $scope.findComment();
            };
        });

        $scope.onFileSelect = function($files) {
            $scope.fileNames = [];
            for (var i = 0; i < $files.length; i++) {
              var file = $files[i];
              $scope.upload = $upload.upload({
                url: '/upload/note', 
                method: 'POST',
                withCredentials: true,
                file: file
              }).success(function(data, status, headers, config) {
                // file is uploaded successfully
                $scope.fileNames.push(data.files.file.name);
              })
              .progress(function(evt) {
                var percent =parseInt(100.0 * evt.loaded / evt.total);
                console.log(percent);
              });
            }
        
      };

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


               $("#selectClasses").select2({
                    placeholder: "Select a class",
                    multiple: true,
                    ajax: { 
                        url: "/classes/suggest",
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
                                classData[i] = { id : data[i]._id , text : data[i].name , members : data[i].members , owner : data[i].createBy._id, file : data[i].file };
                            };
                            return {results: classData};
                        }
                    },
                    initSelection: function(element, callback) {
                        var id=$(element).val();
                    },
                    formatResult: classFormatResult, 
                    formatSelection: classFormatSelection,  
                    escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
                });

        });

        $scope.$on('LoadCreateNoteJs', function() {
                $('#tags_1').tagsInput({width:'auto'});
                $('.wysihtml5').wysihtml5();
        });

        $scope.$on('LoadEditNoteJs', function() {
                $scope.isEditModel = true;                
        });

        $scope.hasAuthorization = function(note) {
            if (!note || !note.createBy) return false;
            return $scope.global.isAdmin || note.createBy._id === $scope.global.user._id;
        };

        // list all
        $scope.find = function() {
            Notes.query({share : 0},function(notes) {
                $scope.notes = notes;
            });
        };

        $scope.findComment = function() {

            Comments.query({ noteId : $stateParams.noteId },function(comments) {
                $scope.comments = comments;
            });
        };

        $scope.share = function() {
            Notes.query({share : 1},function(notes) {
                $scope.notes = notes;
            });
        };

        // find by id

        $scope.findOne = function() {
            $('#myModalDetail').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            Notes.get({
                noteId: $stateParams.noteId
            }, function(note) {
                note.tags = note.tags.join(',');
                note.classes = note.sendToClass.join(',');
                $scope.note = note;
                if ($scope.isEditModel) {
                    $('#tags_1').val(note.tags);
                    $('#tags_1').tagsInput({
                                                width:'auto',  
                                                'height':'30px',
                                                'interactive':true,
                                                'defaultText':'add a tag'
                                            }
                                            );
                    $('.wysihtml5').wysihtml5();
                    var tmpData = [];
                    for (var i = 0; i < note.sendToClass.length; i++) {
                        tmpData[i] = { 'id' : note.sendToClassIds[i] , 'text' : note.sendToClass[i] } ;
                    };
                    $("#selectClasses").select2('data', tmpData);
                    $scope.isEditModel = false;
                };
            });
        };

        // send comment

        $scope.comment = function(){
            var comment = new Comments({
                content : this.content,
                onNote : $stateParams.noteId
            });


            comment.$save(function(response) {
                // reload comment
                $scope.findComment();
                Socket.emit('createComment', comment);
            });
            this.content = '';
        }

        // create note

         $scope.create = function() {
            var classArr = [];
            var classIdArr = [];
            var membersArr = [];
            var classSelection = $('#selectClasses').select2('data');
            for (var i = 0; i < classSelection.length; i++) {
                // insert class
                classArr.push(classSelection[i].text.trim());
                classIdArr.push(classSelection[i].id.trim());

                // push member
                for (var j = 0; j < classSelection[i].members.length; j++) {
                    if (membersArr.indexOf(classSelection[i].members[j]) === -1) {
                        membersArr.push(classSelection[i].members[j]);
                    };
                };
            };
            this.content = $('.wysihtml5').val();
            this.tags = $('.tags').val();
            var note = new Notes({
                title : this.title,
                content : this.content,
                tags : this.tags,
                classes : classArr,
                classesIds : classIdArr,
                members : membersArr,
                quickComment : this.quickComment,
                fileNames : $scope.fileNames
            });

            note.$save(function(response) {
                $location.path('notes/' + response._id);
            });
            this.title = '';
            $('#tags_1').importTags('');
            this.content = '';
            this.quickComment = '';

            $('#myModalDetail').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            
        };

        $scope.remove = function(note) {
            if (note) {
                note.$remove();

                for (var i in $scope.notes) {
                    if ($scope.notes[i] === note) {
                        $scope.notes.splice(i, 1);
                    }
                }
            } else {
                $scope.note.$remove(function(response) {
                    $location.path('notes');
                });
            }
        };

        $scope.update = function() {
            var note = $scope.note;
            note.content = $('.wysihtml5').val();
            note.tags = $('.tags').val();
            if (!note.updated) {
                note.updated = [];
            }
            note.updated.push(new Date().getTime());

            var classArr = [];
            var classIdArr = [];
            var membersArr = [];
            var classSelection = $('#selectClasses').select2('data');
            for (var i = 0; i < classSelection.length; i++) {
                // insert class
                classArr.push(classSelection[i].text.trim());
                classIdArr.push(classSelection[i].id.trim());
                // todo : process member or not
                // push member later
            };

            note.sendToClass = classArr;
            note.sendToClassIds = classIdArr;

            note.$update(function() {
                $location.path('notes/' + note._id);
            });
        };
    }
]);
