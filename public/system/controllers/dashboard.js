'use strict';

angular.module('mean.system').controller('DashboardController', ['$scope', '$rootScope', '$http', '$location','Global','Socket', function ($scope,$rootScope, $http, $location, Global, Socket) {
    $scope.global = Global;
    // check useronline

      // new user has been login
	  Socket.on('listOnlineUser', function (users) {
	  	var onlinesArr = [];
	  	
	  	for(var username in users){
	  		console.log(username);
	  		if (username != $scope.global.user.username) {
	  			onlinesArr.push(users[username]);
	  		};
	  	}
	  	$scope.onlines = onlinesArr;
	    
	  });

	  // another user login
	  Socket.on('onUserJoin',function(user){
	  		console.log(user);
	  		$scope.onlines.push(user);
	  });

    $scope.userOnline = function(){
    	// process online
    	Socket.emit('whoonline');
    }

}]);