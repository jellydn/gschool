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

        $stateProvider.state('notes', {
            url: '/notes',
            templateUrl: 'notes/views/notes.html',
            resolve: {
                loggedin: checkLoggedin
            }
        }).state('create note', {
                url: '/notes/create',
                templateUrl: 'notes/views/create.html',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('share note', {
                url: '/notes/shared',
                templateUrl: 'notes/views/share.html',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('note by id', {
                url: '/notes/:noteId',
                templateUrl: 'notes/views/view.html',
                resolve: {
                    loggedin: checkLoggedin
                }
            });
    }
]);
