'use strict';

angular.module('mean').controller('ChatController',['$scope', '$stateParams','$http', '$location', 'Global', 'Chats', 'Users','Socket',
    function($scope, $stateParams, $http, $location, Global, Chats, Users,Socket) {
        $scope.global = Global;
            
         // Check number user online   
         Socket.on('init:online', function (data) {
            $scope.name = data.name;
            $scope.users = data.users;
          });


          // user has send chat msg   
          Socket.on('send:message', function (message) {
            $scope.chats.push(message);
          });

          // add a message to the conversation when a user disconnects or leaves the room
          Socket.on('user:left', function (data) {
            $scope.messages.push({
              user: 'chatroom',
              text: 'User ' + data.name + ' has left.'
            });
            var i, user;
            for (i = 0; i < $scope.users.length; i++) {
              user = $scope.users[i];
              if (user === data.name) {
                $scope.users.splice(i, 1);
                break;
              }
            }
          });
          
        Socket.on('onChatCreated', function(data) {
            if (data.to  == $stateParams.userId ) {
                $scope.find();
            };
        });

        $scope.find = function(){
        	 Chats.query({ from : $stateParams.userId },function(chats) {
                $scope.chats = chats;
            });
        }

    }
]);
