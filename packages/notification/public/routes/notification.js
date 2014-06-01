'use strict';

angular.module('mean').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('notification example page', {
            url: '/notification/example',
            templateUrl: 'notification/views/index.html'
        });
    }
]);
