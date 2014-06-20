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

        $stateProvider.state('profile', {
            url: '/profile',
            templateUrl: 'profile/views/profile.html',
            resolve: {
                loggedin: checkLoggedin
            }
        })
        .state('profile setting', {
            url: '/profile/setting',
            templateUrl: 'profile/views/setting.html',
            resolve: {
                loggedin: checkLoggedin
            }
        })
        .state('profile by uesrname', {
            url: '/profile/:usernameId',
            templateUrl: 'profile/views/view.html',
            resolve: {
                loggedin: checkLoggedin
            }
        });
    }
]);
