'use strict';

angular.module('mean').factory('Grades', ['$resource', function($resource) {
    return $resource('Grades/:gradeId', {
        gradeId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);