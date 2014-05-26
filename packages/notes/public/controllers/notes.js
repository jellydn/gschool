'use strict';

angular.module('mean').controller('NotesController', ['$scope', '$stateParams','$http', '$location', 'Global', 'Notes', 'Comments','Socket',
    function($scope, $stateParams, $http, $location, Global, Notes, Comments,Socket) {
        $scope.global = Global;
        $scope.isEditModel = false;
        // Incoming
        Socket.on('onCommentCreated', function(data) {
            if (data.onNote  == $stateParams.noteId ) {
                $scope.findComment();
            };
        });

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
           
            this.content = $('.wysihtml5').val();
            this.tags = $('.tags').val();
            var note = new Notes({
                title : this.title,
                content : this.content,
                tags : this.tags,
                classes : this.classes,
                quickComment : this.quickComment
            });

            note.$save(function(response) {
                $location.path('notes/' + response._id);
            });
            this.title = '';
            $('#tags_1').importTags('');
            this.content = '';
            this.quickComment = '';
            
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

            note.$update(function() {
                $location.path('notes/' + note._id);
            });
        };
    }
]);
