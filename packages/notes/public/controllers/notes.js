'use strict';

angular.module('mean').controller('NotesController', ['$scope', '$stateParams','$http', '$location', 'Global', 'Notes', 'Comments','Socket',
    function($scope, $stateParams, $http, $location, Global, Notes, Comments,Socket) {
        $scope.global = Global;
        
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

        		//tag input
        		$('#tags_1').tagsInput({width:'auto'});
        		$('#tags_2').tagsInput({width:'auto'});
                // editor
                //wysihtml5 start

				$('.wysihtml5').wysihtml5();

				//wysihtml5 end

        });

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
                $scope.note = note;
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
            this.tags = $('#tags_1').val();
            this.classes = $('#tags_2').val();
            var note = new Notes({
                title : this.title,
                content : this.content,
                tags : this.tags,
                classes : this.classes
            });


            note.$save(function(response) {
                $location.path('notes/' + response._id);
            });
            this.title = '';
            this.content = '';
            
        };
    }
]);
