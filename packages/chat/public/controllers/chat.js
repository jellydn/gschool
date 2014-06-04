'use strict';

angular.module('mean').controller('ChatController',['$scope','$interval','$rootScope','$upload', '$stateParams','$http', '$location', 'Global', 'Chats', 'Users','Socket',
    function($scope, $interval, $rootScope, $upload, $stateParams, $http, $location, Global, Chats, Users,Socket) {
        $scope.global = Global;
        $scope.fileName = "";        
        Socket.on('onChatCreated', function(data) {
            if (data.createBy._id == $stateParams.userId) {

                if(data.createBy._id != $stateParams.userId) {
                    data.class = 'clearfix';
                    $scope.toUser = data.to._id;
                }
                else {
                    data.class = 'clearfix odd';
                }

                data.isImageFile = false;
                $scope.chats.push(data);
                $interval(function(){
                    $('.conversation-list').scrollTo('max', 'max', {
                        easing: 'swing'
                    })
                },600,1);
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

       $scope.moveToBottom = function(){
              $interval(function(){
                    $('.conversation-list').scrollTo('max', 'max', {
                        easing: 'swing'
                    })
                },600,1);

              $('.conversation-list').slimscroll({
                    height: '390px',
                    wheelStep: 35,
                    start : 'bottom'
                });
       }

        $scope.find = function(){
            Chats.query({ to : $stateParams.userId },function(chats) {
                for (var i = 0; i < chats.length; i++) {
                    if(chats[i].createBy._id != $stateParams.userId) {
                        chats[i].class = 'clearfix';
                        $scope.toUser = chats[i].to._id;
                    }
                    else {
                        chats[i].class = 'clearfix odd';
                    }
                    // chats[i].dateCreate = moment(chats[i].dateCreate).fromNow(); 
                    if (!chats[i].file.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
                        chats[i].isImageFile = false;
                    }
                    else
                    {
                        chats[i].isImageFile = true;
                    };
                    
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
                // select file again
                $('#uploadfile').val('');
                $scope.fileName = '';
                Socket.emit('sendChat',msg);
                msg.class = "clearfix";
                $scope.chats.push(msg);
                $interval(function(){
                    $('.conversation-list').scrollTo('max', 'max', {
                        easing: 'swing'
                    })
                },600,1);
            });

            this.message = '';
        };

    }
]);
