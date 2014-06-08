'use strict';

angular.module('mean').factory('Questions', ['$resource', function($resource) {
    return $resource('Questions/:questionId', {
        questionId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);