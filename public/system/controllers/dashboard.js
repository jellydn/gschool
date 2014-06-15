'use strict';

angular.module('mean.system').controller('DashboardController', ['$scope', '$rootScope', '$http', '$location','Global','Classes','Notes','Quizzes','Statistics','Socket', function ($scope,$rootScope, $http, $location, Global,Classes,Notes,Quizzes,Statistics, Socket) {
    $scope.global = Global;
      // get dashboard information

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