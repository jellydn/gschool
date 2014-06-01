'use strict';

angular.module('mean').controller('NotificationController', ['$scope', 'Global',
    function($scope, Global, Notification) {
        $scope.global = Global;
        $scope.notification = {
            name: 'notification'
        };
    }
]);
