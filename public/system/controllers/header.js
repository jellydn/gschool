'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope','$modal', '$rootScope', '$http', '$location','dialogs','$translate','Global', 'Menus', 'Messages','Chats', 'Notifications', 'Socket','toaster',
    function($scope, $modal, $rootScope, $http, $location,dialogs, $translate, Global, Menus,Messages,Chats,Notifications,Socket,toaster) {
        $scope.global = Global;

        $scope.isCollapsed = false;
        $scope.global.previousChatId = false;
        $scope.userinfo = $rootScope.user;
        $scope.unreadInbox = 0;
        $scope.unreadQuiz = 0;
        $scope.unreadNotify = 0;
        Socket.on('onMessageCreated', function(data) {
            // check if current user in array recipients
            var msg = data.message;
            msg.from = data.user;
            if (msg.to.indexOf($scope.global.user._id) != -1) {
                $scope.global.messages.unshift(msg);
                $scope.global.unreadInbox++;
            };
        });

        Socket.on('onQuizCreated', function(data) {
            // check if current user in array recipients
            Notifications.query({limit : 5, page : 1 , type : ['quiz']},function(quizzes){
                $scope.global.quizzes = quizzes;
                $http.get('/api/notifications/unread?type=quiz').success(function(response){
                    $scope.global.unreadQuiz = response.totals;
                  });
             });
        });

        Socket.on('onNotifyCreated', function(data) {
            // check if current user in array recipients
            Notifications.query({limit : 10, page : 1 , type : ['mail','quiz','create','coins','chat','comment','activity'] },function(notifications){
                 var tmpActArr = [];
                   for (var i = 0; i < notifications.length; i++) {
                      var tmp = notifications[i];
                      tmp.content = tmp.content.replace('{subject}',tmp.from.name);
                      tmpActArr.push(tmp);
                };
                $scope.global.notifications = tmpActArr;
                
                $http.get('/api/notifications/unread?type=mail,quiz,create,coins,chat,comment,activity').success(function(response){
                    $scope.global.unreadNotify = response.totals;
                  });
             });
        });


        Socket.on('onChatCreated', function(data) {
            if(data.to._id == $scope.global.user._id && $scope.global.previousChatId != data._id) {
              var currentPath = $location.path();
              $scope.global.previousChatId = data._id;
              toaster.pop('info', data.createBy.name, data.message,7000,'',function(){
                 if(currentPath.indexOf('chats') == -1){

                  $scope.toUser = data.createBy._id;
                    Chats.query({ to : data.createBy._id },function(chats) {
                        for (var i = 0; i < chats.length; i++) {
                            if(chats[i].createBy._id != data.createBy._id) {
                                chats[i].class = 'clearfix';
                                $scope.toUser = chats[i].to._id;
                            }
                            else {
                                chats[i].class = 'clearfix odd';
                            }
                            // chats[i].dateCreate = moment(chats[i].dateCreate).fromNow(); 
                            if (!chats[i].file.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
                                chats[i].isImageFile = false;
                            }
                            else
                            {
                                chats[i].isImageFile = true;
                            };
                            
                        };
                        $scope.chats = chats;

                         var modalInstance = $modal.open({
                          templateUrl: '/dialogs/chat.html',
                          controller: ChatPopupController,
                          size: 'large',
                          resolve: {
                            chats: function () {
                              return $scope.chats;
                            },
                            toUser : function(){
                              return $scope.toUser;
                            }
                          }
                        });
                    });

              }
              });
                    
            }
        });

       var ChatPopupController = function ($scope, $modalInstance, chats , toUser ,$interval,$upload,Socket,Global) {
          $scope.chats = chats;
          $scope.global = Global;
          $scope.fileName = "";    
          $scope.create = function() {
              var chat = new Chats({
                  from: $scope.global.user._id,
                  to : toUser,
                  message: this.message,
                  file : $scope.fileName
              });
              chat.$save(function(msg) {
                  // select file again
                  $('#uploadfile').val('');
                  $scope.fileName = '';
                  Socket.emit('sendChat',msg);
                  msg.class = "clearfix";
                  $scope.chats.push(msg);
                  $interval(function(){
                      $('.conversation-list').scrollTo('max', 'max', {
                          easing: 'swing'
                      })
                  },600,1);
              });

              this.message = '';
          };

          $scope.moveToBottom = function(){
                  $interval(function(){
                        $('.conversation-list').scrollTo('max', 'max', {
                            easing: 'swing'
                        })
                    },600,1);

                  $('.conversation-list').slimscroll({
                        height: '390px',
                        wheelStep: 35,
                        start : 'bottom'
                    });
           }

            $scope.onPhotoSelect = function($files) {
              for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                $scope.upload = $upload.upload({
                  url: '/upload/files', 
                  method: 'POST',
                  withCredentials: true,
                  file: file
                }).success(function(data, status, headers, config) {
                  // file is uploaded successfully
                  $scope.fileName = data.files.file.name;
                })
                .progress(function(evt) {
                  console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                });
              }
          
        };


        };

        $scope.init = function(){

          $http.get('/api/unread').success(function(response){
            $scope.global.unreadInbox = response.totals;
          });

          $http.get('/api/notifications/unread?type=quiz').success(function(response){
            $scope.global.unreadQuiz = response.totals;
          });

          $http.get('/api/notifications/unread?type=mail,quiz,create,coins,chat,comment,activity').success(function(response){
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
        
          Messages.query({limit : 5 , page : 1 , inbox : 1, trash : 0 , schedule : 0 },function(messages) {
               messages.pop(); // remove last item
               $scope.global.messages = messages;
            });
           // list notification
           Notifications.query({limit : 5, page : 1 , type : ['quiz']},function(quizzes){
              $scope.global.quizzes = quizzes;
           });

            Notifications.query({limit : 5, page : 1 , type : ['mail','quiz','create','coins','chat','comment','activity']},function(notifications){
    
               var tmpActArr = [];
                 for (var i = 0; i < notifications.length; i++) {
                    var tmp = notifications[i];
                    tmp.content = tmp.content.replace('{subject}',tmp.from.name);
                    tmpActArr.push(tmp);
              };
              $scope.global.notifications = tmpActArr;

           });
            
        }

        $scope.init();

        $scope.$on('LoadScriptsJs', function() {
           
        });

        $scope.global.markRead = function(notify){
          var quizNotificationModel = new Notifications(notify);
              quizNotificationModel.status = 'read';
              quizNotificationModel.$update(function(resp) {
                   $http.get('/api/notifications/unread?type=mail,quiz,create,coins,chat,comment,activity').success(function(response){
                      $scope.global.unreadNotify = response.totals;
                    });
                   $http.get('/api/notifications/unread?type=quiz').success(function(response){
                    $scope.global.unreadQuiz = response.totals;
                  });
                });
        }

        $scope.global.showModal = function (message) {
            $scope.currentMesssage = message;
            var dlg = dialogs.create('/dialogs/message.html','MessagePopupController',message,'lg');

            dlg.result.then(function(name){
              $scope.name = name;
            },function(){
              if(angular.equals($scope.name,''))
                $scope.name = 'You did not enter in your name!';
            });

             var msgModel = new Messages(message);
              msgModel.$update(function() {
                   $http.get('/api/unread').success(function(response){
                        $scope.global.unreadInbox = response.totals;
                    }); 
                });
            
        };
    }
]);