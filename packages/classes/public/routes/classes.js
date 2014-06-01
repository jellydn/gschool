'use strict';

angular.module('mean').config(['$stateProvider',
    function($stateProvider) {
        // Check if the user is connected
        var checkLoggedin = function($q, $timeout, $http, $location) {
            // Initialize a new promise
            var deferred = $q.defer();

            // Make an AJAX call to check if the user is logged in
            $http.get('/loggedin').success(function(user) {
                // Authenticated
                if (user !== '0') $timeout(deferred.resolve);

                // Not Authenticated
                else {
                    $timeout(deferred.reject);
                    $location.url('/login');
                }
            });

            return deferred.promise;
        };

        $stateProvider.state('classes', {
            url: '/classes',
            templateUrl: 'classes/views/classes.html',
            resolve: {
                loggedin: checkLoggedin
            }
        }).state('create class', {
                url: '/classes/create',
                templateUrl: 'classes/views/create.html',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('edit class', {
                url: '/classes/:classId/edit',
                templateUrl: 'classes/views/edit.html',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('classes by id', {
                url: '/classes/:classId',
                templateUrl: 'classes/views/view.html',
                resolve: {
                    loggedin: checkLoggedin
                }
            });
    }
]);
