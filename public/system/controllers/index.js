'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', '$rootScope', 'Global', function ($scope,$rootScope, Global) {
    $scope.global = Global;
    $scope.userinfo = $rootScope.user;
}]);