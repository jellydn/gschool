'use strict';

angular.module('mean').controller('NotificationController', ['$scope', '$rootScope', '$http', '$location','$timeout','Global','Classes','Notes','Quizzes','Statistics','Notifications','Socket', function ($scope,$rootScope, $http, $location,$timeout, Global,Classes,Notes,Quizzes,Statistics,Notifications, Socket) {
        $scope.global = Global;
        $scope.busy = false;
        $scope.pageNumber = 1;
        $scope.isFinish = false;
	      $scope.getClassType = function (type){
	          if (type == 'mail' || type =='chat' || type =='comment') {
	            return 'red';
	          }
	          else
	            if (type == 'create') {
	              return 'green';
	            }
	            else
	              return 'purple';
	      };

	      $scope.getClassIcon = function (type){
	          if (type == 'mail') {
	            return 'fa-envelope';
	          }
	          else
	      	  	if (type == 'chat') {
	      	  	return 'fa-comment-o';
	      	  	}
	          	else
	           	 	if (type == 'create') {
	             	 return 'fa-group';
	            	}
	            	else
	            		if (type == 'activity') {
	            			return 'fa-list-ul';
	            		}
	            		else
	            				return 'fa-circle-o';
	      };
        $scope.findNextPage = function(){
      		if ($scope.busy) return;
    		$scope.busy = true;
    		var limit = $scope.pageNumber*5;
        	Notifications.query({ type : ['mail','quiz','create','coins','chat','comment','activity'] 
        		, limit: limit
        	 },function(activities){
	            var tmpActArr = [];
               	for (var i = 0; i < activities.length; i++) {
                  var tmp = activities[i];
                  tmp.content = tmp.content.replace('{subject}',tmp.from.name);
                  tmpActArr.push(tmp);
               	};

                $scope.activities = tmpActArr;
	            $scope.pageNumber++;
	            if ( limit > activities.length) {
	            	$scope.isFinish = true;
	            	$scope.busy = true;
	            	$('#loadingdata').remove();
	            }
	            else 
	            	$scope.busy = false;

	            for (var i = 0; i < activities.length; i++) {
	            	activities[i].status = 'read';
	            	activities[i].$update();
	            };

	            $timeout(function(){
	            	$http.get('/api/notifications/unread?type=mail,quiz,create,coins,chat,comment,activity').success(function(response){
                      $scope.global.unreadNotify = response.totals;
                    });
	            },1500);
	         });
        }
    }
]);
