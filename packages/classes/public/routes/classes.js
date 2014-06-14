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
            }).state('create quiz', {
                url: '/classes/:classId/quiz',
                templateUrl: 'classes/views/quiz.html',
                resolve: {
                    loggedin: checkLoggedin
                }
            }).state('view quiz', {
                url: '/quizzes/:quizId',
                templateUrl: 'classes/views/viewquiz.html',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('view grade quiz', {
                url: '/quizzes/:quizId/grade',
                templateUrl: 'classes/views/viewgrade.html',
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
