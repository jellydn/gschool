'use strict';

angular.module('mean').controller('ChatController',['$scope', '$stateParams','$http', '$location', 'Global', 'Chats', 'Users','Socket',
    function($scope, $stateParams, $http, $location, Global, Chats, Users,Socket) {
        $scope.global = Global;
                      
        Socket.on('onChatCreated', function(data) {
            if (data.to  == $stateParams.userId || data.createBy == $stateParams.userId) {
                $scope.find();
            };
        });

        $scope.find = function(){
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
                message: this.message
            });
            chat.$save(function(msg) {
                $scope.find();
            });

            this.message = '';
        };

    }
]);
