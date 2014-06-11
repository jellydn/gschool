'use strict';

angular.module('mean').factory('Notifications', ['$resource', function($resource) {
    return $resource('Notifications/:notificationId', {
        notificationId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);