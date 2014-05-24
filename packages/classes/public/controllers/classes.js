'use strict';

angular.module('mean').controller('ClassesController', ['$scope', 'Global',
    function($scope, Global, Classes) {
        $scope.global = Global;
        $scope.global.classActive = "active";
        console.log($scope.global);
    }
]);
