'use strict';

angular.module('mean').controller('NotificationController', ['$scope', '$rootScope', '$http', '$location','$timeout','Global','Classes','Notes','Quizzes','Statistics','Notifications','Socket', function ($scope,$rootScope, $http, $location,$timeout, Global,Classes,Notes,Quizzes,Statistics,Notifications, Socket) {
        $scope.global = Global;
        $scope.busy = false;
        $scope.pageNumber = 1;
        $scope.isFinish = false;
	      $scope.getClassType = function (type){
	          if (type == 'mail' || type =='chat') {
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
	          if (type == 'mail' || type =='chat') {
	            return 'fa-envelope';
	          }
	          else
	            if (type == 'create') {
	              return 'fa-group';
	            }
	            else
	              return 'fa-circle-o';
	      };
        $scope.findNextPage = function(){
      		if ($scope.busy) return;
    		$scope.busy = true;
    		var limit = $scope.pageNumber*5;
        	Notifications.query({ type : ['mail','quiz','create','coins'] 
        		, limit: limit
        	 },function(activities){
	            $scope.activities = activities;
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
	            	$http.get('/api/notifications/unread?type=mail,quiz,create,coins').success(function(response){
                      $scope.global.unreadNotify = response.totals;
                    });
	            },1500);
	         });
        }
    }
]);
