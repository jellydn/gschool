'use strict';

angular.module('mean.system').controller('DashboardController', ['$scope', '$rootScope', '$http', '$location','Global','Classes','Notes','Quizzes','Statistics','Notifications','Socket', function ($scope,$rootScope, $http, $location, Global,Classes,Notes,Quizzes,Statistics,Notifications, Socket) {
    $scope.global = Global;
      // get dashboard information

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


      $scope.dashboard = function(){
      	Classes.query(function(classes) {
            $scope.classes = classes;
       	});

         Notes.query(function(notes) {
              $scope.notes = notes;
         });

         Quizzes.query(function(quizzes) {
              $scope.quizzes = quizzes;
         });

         Statistics.get({ statisticId : $scope.global.user._id },function(statistic) {
              $scope.statistic = statistic;
         });

         Notifications.query({ type : ['mail','quiz','create','coins'] , today : 1 },function(activities){
            console.log(activities);
            $scope.activities = activities;
         });
      } 
      

      // new user has been login
	  Socket.on('listOnlineUser', function (users) {
	  	var onlinesArr = [];	
	  	for(var username in users){
	  		if (username != $scope.global.user.username) {
	  			onlinesArr.push(users[username]);
	  		};
	  	}
	  	$scope.onlines = onlinesArr;
	    
	  });

	  // another user login
	  Socket.on('onUserJoin',function(user){
	  		$scope.onlines.push(user);
	  });

	  $scope.hasAuthorization = function(classModel) {
            if (!classModel || !classModel.createBy) return false;
        		return $scope.global.isAdmin || classModel.createBy._id === $scope.global.user._id;
    };


    $scope.hasNoteAuthorization = function(note) {
        if (!note || !note.createBy) return false;
        	return $scope.global.isAdmin || note.createBy._id === $scope.global.user._id;
    };

    $scope.userOnline = function(){
    	// process online
    	Socket.emit('whoonline');
    }

}]);