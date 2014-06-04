'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', '$rootScope', 'Global', function ($scope,$rootScope, Global) {
    $scope.global = Global;
    $scope.userinfo = $rootScope.user;
}]).directive('divDirective', function() {
    return {        
        controller: function($element) {
            this.scrollTo = function(n) {
                $element[0].scrollTop = n;
            };
        }
    };
}).directive('scrollToMe', function() {
    return {
        require: "^divDirective",
        link: function(scope, element, attrs, ctrl) {
            ctrl.scrollTo(element[0].offsetTop);
        }
    };
})
.directive('myRepeatDirective', function() {
  return function(scope, element, attrs) {
    if (scope.$last){
       scope.moveToBottom();
    }
  };
});