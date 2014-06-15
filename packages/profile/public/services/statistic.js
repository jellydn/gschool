'use strict';

angular.module('mean').factory('Statistics', ['$resource', function($resource) {
    return $resource('Statistics/:statisticId', {
        statisticId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);