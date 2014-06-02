'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', '$rootScope', '$http', '$location','Global', 'Menus', 'Messages','Socket',
    function($scope, $rootScope, $http, $location, Global, Menus,Messages,Socket) {
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
              Socket.emit('online', user);
          });

          // custom scroll bar
          $("#sidebar").niceScroll({styler:"fb",cursorcolor:"#1FB5AD", cursorwidth: '3', cursorborderradius: '10px', background: '#404040', spacebarenabled:false, cursorborder: ''});
          $(".right-sidebar").niceScroll({styler:"fb",cursorcolor:"#1FB5AD", cursorwidth: '3', cursorborderradius: '10px', background: '#404040', spacebarenabled:false, cursorborder: ''});
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
})
.directive('myOnlineList', function() {
    return {
      restrict: 'E',
      scope: {
        global: '=',
        onlines: '='
      },
      templateUrl: 'public/system/views/onlinelist.html',
    };
})
.directive('myAvatar', function() {
    return {
        // required to make it work as an element
        restrict: 'E',
        template: '<img/>',
        scope: {
          userid: '@',
          file: '@',
          type: '@'
        },
        // replace: true,
        // observe and manipulate the DOM
        link: function($scope, element, attrs) {

            // attribute names change to camel case
            attrs.$observe('file', function(value) {
         
                if(!value.length || !$scope.userid.length)
                {
                  if ($scope.type =='small') 
                    element.find('img').attr('src', '/public/lib/images/no_avatar_30x30.gif');
                  else
                    element.find('img').attr('src', '/public/lib/images/no_avatar.gif');
                }
                else
                  element.find('img').attr('src', '/public/uploads/users/' + $scope.userid + '/'+ $scope.type +'_' + value);
            })

            attrs.$observe('userid', function(value) {
         
                if(!value.length || !$scope.file.length)
                {
                  if ($scope.type =='small') 
                    element.find('img').attr('src', '/public/lib/images/no_avatar_30x30.gif');
                  else
                    element.find('img').attr('src', '/public/lib/images/no_avatar.gif');
                }
                else
                  element.find('img').attr('src', '/public/uploads/users/' + value + '/'+ $scope.type +'_' + $scope.file);
            })
        }
    }
}).directive('myClassAvatar', function() {
    return {
        // required to make it work as an element
        restrict: 'E',
        template: '<img/>',
        scope: {
          userid: '@',
          file: '@'
        },
        // replace: true,
        // observe and manipulate the DOM
        link: function($scope, element, attrs) {

            // attribute names change to camel case
            attrs.$observe('file', function(value) {
         
                if(!value.length || !$scope.userid.length)
                {
                    element.find('img').attr('src', '/public/lib/images/no_image_class.png');
                }
                else
                  element.find('img').attr('src', '/public/uploads/classes/' + $scope.userid + '/medium_' + value);
            })

            attrs.$observe('userid', function(value) {
         
                if(!value.length || !$scope.file.length)
                {
                  element.find('img').attr('src', '/public/lib/images/no_image_class.png');
                }
                else
                  element.find('img').attr('src', '/public/uploads/users/' + value + '/'+ $scope.type +'_' + $scope.file);
            })
        }
    }
});
