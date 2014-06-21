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
                  return 'fa-circle-o';
        };

      $scope.recentActivity = function(){
            Notifications.query({ type : ['mail','quiz','create','coins','chat'] , today : 1,all:1,limit:5 },function(activities){

               var tmpActArr = [];
               for (var i = 0; i < activities.length; i++) {
                  var tmp = activities[i];
                  tmp.content = tmp.content.replace('you',tmp.to.name);
                  tmp.content = tmp.content.replace('{subject}',tmp.from.name);
                  tmpActArr.push(tmp);
               };

                $scope.activities = tmpActArr;
             });

            Socket.on('onNotifyCreated', function(data) {
              // check if current user in array recipients
              Notifications.query({ type : ['mail','quiz','create','coins','chat'] , today : 1,all:1,limit:5 },function(activities){
                   var tmpActArr = [];
                   for (var i = 0; i < activities.length; i++) {
                      var tmp = activities[i];
                      tmp.content = tmp.content.replace('you',tmp.to.name);
                      tmp.content = tmp.content.replace('{subject}',tmp.from.name);
                      tmpActArr.push(tmp);
                   };

                    $scope.activities = tmpActArr;
                   });

          });
      }

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

         Notifications.query({ type : ['mail','quiz','create','coins','chat'] , today : 1 },function(activities){
            var tmpActArr = [];
               for (var i = 0; i < activities.length; i++) {
                  var tmp = activities[i];
                  tmp.content = tmp.content.replace('{subject}',tmp.from.name);
                  tmpActArr.push(tmp);
            };
            $scope.todayActivities = tmpActArr;
         });

         Socket.on('onNotifyCreated', function(data) {
              // check if current user in array recipients
              Notifications.query({ type : ['mail','quiz','create','coins','chat'] , today : 1 },function(activities){
                var tmpActArr = [];
                for (var i = 0; i < activities.length; i++) {
                      var tmp = activities[i];
                      tmp.content = tmp.content.replace('{subject}',tmp.from.name);
                      tmpActArr.push(tmp);
                };
                $scope.todayActivities = tmpActArr; 
             });
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