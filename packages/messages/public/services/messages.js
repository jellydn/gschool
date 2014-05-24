'use strict';

angular.module('mean').factory('Messages', ['$resource', function($resource) {
    return $resource('messages/:messageId', {
        messageId: '@_id'
    }, {
        update: {
            method: 'PUT'
        },
        clean: {
        	method: 'DELETE'
        }
        // ,
        // delete: {
        // 	method : 'DELETE'
        // }
    });
}]);