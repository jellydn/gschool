'use strict';

angular.module('mean.system').controller('DashboardController', ['$scope', '$rootScope', '$http', '$location','Global','Socket', function ($scope,$rootScope, $http, $location, Global, Socket) {
    $scope.global = Global;
      // check useronline

      // new user has been login
	  Socket.on('listOnlineUser', function (users) {
	  	var onlinesArr = [];	
	  	console.log(users);  	
	  	for(var username in users){
	  		if (username != $rootScope.user.username) {
	  			onlinesArr.push(users[username]);
	  		};
	  	}
	  	$scope.onlines = onlinesArr;
	    
	  });

	  // another user login
	  Socket.on('onUserJoin',function(user){
	  		$scope.onlines.push(user);
	  });

    $scope.userOnline = function(){
    	// process online
    	Socket.emit('whoonline');
    }

}]);