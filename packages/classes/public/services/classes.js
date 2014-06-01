'use strict';

angular.module('mean').factory('Classes', ['$resource', function($resource) {
    return $resource('Classes/:classId', {
        classId: '@_id'
    }, {
        update: {
            method: 'PUT'
        },
        invite: {
            method: 'PUT'
        },
        join: {
            method: 'POST'
        }
    });
}]);