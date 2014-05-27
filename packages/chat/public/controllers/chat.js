'use strict';

angular.module('mean').controller('ChatController', ['$scope', 'Global',
    function($scope, Global, Chat) {
        $scope.global = Global;
        $scope.chat = {
            name: 'chat'
        };
    }
]);
