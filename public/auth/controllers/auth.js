'use strict';

angular.module('mean.controllers.login', [])
    .controller('LoginCtrl', ['$scope', '$rootScope', '$http', '$location','Socket',
        function($scope, $rootScope, $http, $location,Socket) {
            // This object will be filled by the form
            $scope.user = {};

            // Register the login() function
            $scope.login = function() {
                $http.post('/login', {
                    username: $scope.user.username,
                    password: $scope.user.password
                })
                    .success(function(response) {
                        // authentication OK
                        $scope.loginError = 0;
                        $rootScope.user = response.user;
                        $rootScope.$emit('loggedin');
                        Socket.emit('login', response.user);
                        if (response.redirect) {
                            if (window.location.href === response.redirect) {
                                //This is so an admin user will get full admin page
                                window.location.reload();
                            } else {
                                window.location = response.redirect;
                            }
                        } else {
                            $location.url('/');
                        }
                    })
                    .error(function() {
                        $scope.loginerror = 'Authentication failed.';
                    });
            };
        }
    ])
    .controller('RegisterCtrl', ['$scope', '$rootScope', '$http', '$location',
        function($scope, $rootScope, $http, $location) {
            $scope.user = { type : 'student' };

            $scope.register = function() {
                $scope.usernameError = null;
                $scope.registerError = null;
                $http.post('/register', {
                    email: $scope.user.email,
                    password: $scope.user.password,
                    confirmPassword: $scope.user.repassword,
                    username: $scope.user.username,
                    name: $scope.user.name,
                    address: $scope.user.address,
                    city: $scope.user.city,
                    gender: $scope.user.gender,
                    type : $scope.user.type
                })
                    .success(function() {
                        // authentication OK
                        $scope.registerError = 0;
                        $rootScope.user = $scope.user;
                        $rootScope.$emit('loggedin');
                        $location.url('/');
                    })
                    .error(function(error) {
                        // Error: authentication failed
                        if (error === 'Username already taken') {
                            $scope.usernameError = error;
                        } else {
                            $scope.registerError = error;
                        }
                    });
            };
        }
    ]).controller('ForgotPasswordCtrl', ['$scope', '$rootScope', '$http', '$location',
        function($scope, $rootScope, $http, $location) {
            $scope.user = {};
            $scope.forgotpassword = function() {
                $http.post('/forgot-password', {
                    text: $scope.text
                })
                .success(function(response) {
                    $scope.response = response;
                    $scope.text = '';
                })
                .error(function(error) {
                    $scope.response = error;
                });
            };
        }
    ])
    .controller('ResetPasswordCtrl', ['$scope', '$rootScope', '$http', '$location', '$stateParams',
        function($scope, $rootScope, $http, $location, $stateParams) {
            $scope.user = {};
            $scope.resetpassword = function() {
                $http.post('/reset/' + $stateParams.tokenId, {
                    password: $scope.user.password,
                    confirmPassword: $scope.user.confirmPassword
                })
                .success(function(response) {
                    $rootScope.user = response.user;
                    $rootScope.$emit('loggedin');
                    if (response.redirect) {
                        if (window.location.href === response.redirect) {
                            //This is so an admin user will get full admin page
                            window.location.reload();
                        } else {
                            window.location = response.redirect;
                        }
                    } else {
                        $location.url('/');
                    }
                })
                .error(function(error) {
                    if (error.msg === 'Token invalid or expired')
                        $scope.resetpassworderror = 'Could not update password as token is invalid or may have expired';
                    else
                        $scope.validationError = error;
                });
            };
        }
    ]);