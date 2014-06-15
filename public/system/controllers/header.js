'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', '$rootScope', '$http', '$location','dialogs','Global', 'Menus', 'Messages', 'Notifications', 'Socket',
    function($scope, $rootScope, $http, $location,dialogs, Global, Menus,Messages,Notifications,Socket) {
        $scope.global = Global;

        $scope.isCollapsed = false;

        $scope.userinfo = $rootScope.user;
        $scope.unreadInbox = 0;
        $scope.unreadQuiz = 0;
        $scope.unreadNotify = 0;
        Socket.on('onMessageCreated', function(data) {
            // check if current user in array recipients
            var msg = data.message;
            msg.from = data.user;
            if (msg.to.indexOf($scope.global.user.username) !== -1) {
                $scope.global.messages.pop();
                $scope.global.messages.unshift(msg);
                $scope.global.unreadInbox++;
            };
        });

        Socket.on('onQuizCreated', function(data) {
            // check if current user in array recipients
            Notifications.query({limit : 5, page : 1 , type : 'quiz'},function(quizzes){
                $scope.global.quizzes = quizzes;
                $http.get('/api/notifications/unread?type=quiz').success(function(response){
                    $scope.global.unreadQuiz = response.totals;
                  });
             });
        });

        Socket.on('onNotifyCreated', function(data) {
            // check if current user in array recipients
            Notifications.query({limit : 10, page : 1 , type : 'activity'},function(notifications){
                $scope.global.notifications = notifications;
                $http.get('/api/notifications/unread?type=activity').success(function(response){
                    $scope.global.unreadNotify = response.totals;
                  });
             });
        });

        $scope.init = function(){
        	$http.get('/api/unread').success(function(response){
            $scope.global.unreadInbox = response.totals;
          });

          $http.get('/api/notifications/unread?type=quiz').success(function(response){
        		$scope.global.unreadQuiz = response.totals;
        	});

          $http.get('/api/notifications/unread?type=activity').success(function(response){
            $scope.global.unreadNotify = response.totals;
          });

          $http.get('/users/me').success(function(user){
              $scope.global.user = user;
              $scope.userinfo = user;
              Socket.emit('online', user);
          });
          $('.popovers').popover();

          // custom scroll bar
          $("#sidebar").niceScroll({styler:"fb",cursorcolor:"#1FB5AD", cursorwidth: '3', cursorborderradius: '10px', background: '#404040', spacebarenabled:false, cursorborder: ''});
          $(".right-sidebar").niceScroll({styler:"fb",cursorcolor:"#1FB5AD", cursorwidth: '3', cursorborderradius: '10px', background: '#404040', spacebarenabled:false, cursorborder: ''});
        }

        $scope.init();

        $scope.$on('LoadScriptsJs', function() {
           Messages.query({limit : 5 , page : 1 , inbox : 1, trash : 0 , schedule : 0 },function(messages) {
               messages.pop(); // remove last item
               $scope.global.messages = messages;
            });
           // list notification
           Notifications.query({limit : 5, page : 1 , type : 'quiz'},function(quizzes){
              $scope.global.quizzes = quizzes;
           });

            Notifications.query({limit : 5, page : 1 , type : 'activity'},function(notifications){
              $scope.global.notifications = notifications;
           });
        });

        $scope.global.markRead = function(notify){
          var quizNotificationModel = new Notifications(notify);
              quizNotificationModel.status = 'read';
              quizNotificationModel.$update(function(resp) {
                   $http.get('/api/notifications/unread?type=activity').success(function(response){
                      $scope.global.unreadNotify = response.totals;
                    });
                   $http.get('/api/notifications/unread?type=quiz').success(function(response){
                    $scope.global.unreadQuiz = response.totals;
                  });
                });
        }

        $scope.global.showModal = function (message) {
            $('#myModalDetailHeader h4').text('From ' + message.fromName);
            var htmlMessage = message.message;
            
            if ( (typeof message.file != 'undefined') &&  message.file != "") {
                htmlMessage +='<div id="attachment"> Your attachment: <a href="/public/uploads/' + message.file + '">' + message.file + '</a></div></br>';
            }
            
            var dlg = dialogs.notify('From ' + message.from.name,htmlMessage);

            $('#myModalDetailHeader').modal('show');

             var msgModel = new Messages(message);
              msgModel.$update(function() {
                   $http.get('/api/unread').success(function(response){
                        $scope.global.unreadInbox = response.totals;
                    }); 
                });
            
        };
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
                  element.find('img').attr('src', '/public/uploads/classes/' + value + '/medium_' + $scope.file);
            })
        }
    }
});
