'use strict';

angular.module('mean').controller('DirectoryController', ['$scope', 'Global','Users',
    function($scope, Global,Users) {
        $scope.global = Global;
        $scope.directory = {
            name: 'directory'
        };

        $scope.find = function() {
            Users.query(function(users) {
                $scope.users = users;
            });
        };
    }
]);
