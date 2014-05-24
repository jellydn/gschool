'use strict';

angular.module('mean').factory('Notes', ['$resource', function($resource) {
    return $resource('Notes/:noteId', {
        noteId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);