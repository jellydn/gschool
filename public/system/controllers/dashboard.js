'use strict';

angular.module('mean.system').controller('DashboardController', ['$scope', '$rootScope', 'Global', function ($scope,$rootScope, Global) {
    $scope.global = Global;
}]);