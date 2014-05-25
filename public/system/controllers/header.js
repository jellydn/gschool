'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', '$rootScope', '$http', '$location','Global', 'Menus', 'Messages',
    function($scope, $rootScope, $http, $location, Global, Menus,Messages) {
        $scope.global = Global;

        $scope.isCollapsed = false;

        $scope.userinfo = $rootScope.user;
        $scope.unreadInbox = 0;

        $scope.init = function(){
        	$http.get('/api/unread').success(function(response){
        		$scope.global.unreadInbox = response.totals;
        	});

          $http.get('/users/me').success(function(user){
              $scope.global.user = user;
              $scope.userinfo = user;
          });

          // Load js scripts and dashboard
          // scripts.js
          // dashboard.js
          // load menu
        }

        $scope.init();

        $scope.$on('LoadScriptsJs', function() {

        });
    }
])
.directive('myLeftMenu', function() {
    return {
      restrict: 'E',
      scope : {
        'global' :'='
      },
      templateUrl: 'public/system/views/leftmenu.html',
    };
})
.directive('myLogo', function() {
    return {
      restrict: 'E',
      replace : true,
      templateUrl: 'public/system/views/logo.html',
    };
})
.directive('myMenu', function() {
    return {
      restrict: 'E',
      scope: {
        global: '='      },
      templateUrl: 'public/system/views/topmenu.html',
    };
})
.directive('myUserMenu', function() {
    return {
      restrict: 'E',
      scope: {
        userinfo: '='
      },
      templateUrl: 'public/system/views/user.html',
    };
});
