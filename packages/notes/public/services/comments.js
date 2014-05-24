'use strict';

angular.module('mean').factory('Comments', ['$resource', function($resource) {
    return $resource('Comments/:commentId', {
        commentId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);