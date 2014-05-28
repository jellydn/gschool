'use strict';

angular.module('mean').factory('Chats', ['$resource', function($resource) {
    return $resource('Chats/:userId', {
        userId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);