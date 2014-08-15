'use strict';

angular.module('mean.system')
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
.directive('recentActivity', function() {
    return {
      restrict: 'E',
      scope: {
        global: '=',
        activities: '='
      },
      templateUrl: 'public/system/views/recentactivity.html',
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
                  element.find('img').attr('src', '/public/uploads/classes/' + value + '/medium_' + $scope.file);
            })
        }
    }
}).directive('ellipsis', ['$timeout',function ($timeout) {
    return {
        required: 'ngBindHtml',
        restrict: 'A',
        link: function ($scope, element, attrs) {
            $scope.hasEllipsis = false;

            $timeout(function(){
               if (!$scope.hasEllipsis) {
                   // apply ellipsis only one
                   $scope.hasEllipsis = true;
                   element = $(element[0]);
                   element.ellipsis();
               }
           }, 20);

        }
    };
}])
.directive('resize', function ($window) {
    return function (scope, element) {
      scope.getWinHeight = function() {
        return $window.innerHeight;
      }

      var setNavHeight = function(newHeight) {
        element.css('height', newHeight + 'px');
      }

      // Set on load
      scope.$watch(scope.getWinHeight, function (newValue, oldValue) {
        setNavHeight(scope.getWinHeight());
      }, true);

      // Set on resize
      angular.element($window).bind('resize', function () {
        scope.$apply();
      });
  };
});
