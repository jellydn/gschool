'use strict';

angular.module('mean').controller('DirectoryController', ['$scope','$rootScope','$upload', '$stateParams','$timeout','$http','$location', 'Global','dialogs','toaster','Users','Socket',
    function($scope,$rootScope, $upload, $stateParams,$timeout, $https, $location, Global,dialogs,toaster,Users,Socket) {
        $scope.global = Global;
        $scope.directory = {
            name: 'directory'
        };

        $scope.find = function() {
            Users.query(function(users) {
                $scope.users = users;
            });
        };

        $scope.addAdmin = function(user){
            $https.post('/rights',{username : user.username, admin : 1})
                 .success(function(resp){

                    for (var i = 0; i < $scope.users.length; i++) {
                        if($scope.users[i].username == resp.username)
                        {
                            $scope.users[i] = resp;
                            break;
                        }
                    };

                 });
        }

        $scope.removeAdmin = function(user){
            var ok = confirm('Are you want to remove this admin ?');
            if (ok) {
                $https.post('/rights',{username : user.username, admin : 0})
                 .success(function(resp){
                    for (var i = 0; i < $scope.users.length; i++) {
                        if($scope.users[i].username == resp.username)
                        {
                            $scope.users[i] = resp;
                            break;
                        }
                    };
                 });
            };
        }
    }
]);
