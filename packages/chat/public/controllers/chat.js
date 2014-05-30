'use strict';

angular.module('mean').controller('ChatController',['$scope','$rootScope','$upload', '$stateParams','$http', '$location', 'Global', 'Chats', 'Users','Socket',
    function($scope,$rootScope, $upload, $stateParams, $http, $location, Global, Chats, Users,Socket) {
        $scope.global = Global;
        $scope.fileName = "";                
        Socket.on('onChatCreated', function(data) {
            if (data.to  == $stateParams.userId || data.createBy == $stateParams.userId) {
                $scope.find();
            };
        });

        // upload photo 
        $scope.onPhotoSelect = function($files) {
            for (var i = 0; i < $files.length; i++) {
              var file = $files[i];
              $scope.upload = $upload.upload({
                url: '/upload/files', 
                method: 'POST',
                withCredentials: true,
                file: file
              }).success(function(data, status, headers, config) {
                // file is uploaded successfully
                $scope.fileName = data.files.file.name;
              })
              .progress(function(evt) {
                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
              });
            }
        
      };

        $scope.find = function(){
            // fix max height
            // embed nicesroll
            $('ul.conversation-list').height(390);
            $('ul.conversation-list').niceScroll({styler:"fb",cursorcolor:"#1FB5AD", cursorwidth: '3', cursorborderradius: '10px', background: '#fff', spacebarenabled:false, cursorborder: ''});
        	 Chats.query({ to : $stateParams.userId },function(chats) {
                for (var i = 0; i < chats.length; i++) {
                    if(chats[i].createBy._id != $stateParams.userId) {
                        chats[i].class = 'clearfix';
                    }
                    else
                        chats[i].class = 'clearfix odd';
                };
                $scope.chats = chats;
            });


        }

        $scope.create = function() {
            var chat = new Chats({
                from: $scope.global.user._id,
                to : $stateParams.userId,
                message: this.message,
                file : $scope.fileName
            });
            chat.$save(function(msg) {
                $("ul.conversation-list").animate({ scrollTop: $('ul.conversation-list')[0].scrollHeight }, "slow");

                Socket.emit('sendChat',msg);
                $scope.find();
            });

            this.message = '';
        };

    }
]);
