'use strict';

angular.module('mean').factory('Quizzes', ['$resource', function($resource) {
    return $resource('Quizzes/:quizId', {
        quizId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);