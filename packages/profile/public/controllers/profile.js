'use strict';

angular.module('mean').controller('ProfileController', ['$scope','$rootScope','$upload', '$stateParams','$http', '$location', 'Global','Users',
    function($scope,$rootScope, $upload, $stateParams, $http, $location, Global, Users) {
        $scope.global = Global;
        $scope.fileName = "";
        $scope.me = function(){
            $scope.saveBasic = true;
            $scope.saveEmail = true;
            $scope.uploadPhoto = true;
        	Users.get({
                userId: $scope.global.user._id
            }, function(user) {
                $scope.profile = user;
            });
        }

        $scope.update = function(actionType){
            $scope.saveBasic = true;

            var userinfo = $scope.profile;
                if (!userinfo.updated) {
                    userinfo.updated = [];
                }
            userinfo.updated.push(new Date().getTime());
            //todo: if update name, please update all name from message

            userinfo.$update(function(resp) {
                if (actionType == 'basic') {
                    $scope.saveBasic = false;
                }
                else
                    $scope.saveEmail = false;
                
            });

        };

        $scope.uploadAvatar = function(){
            $scope.uploadPhoto = true;
            // check file is upload and update db
            if($scope.fileName != "") {
                 $scope.classUpload = 'alert-success';
                 var userinfo = $scope.profile;
                    if (!userinfo.updated) {
                        userinfo.updated = [];
                    }
                 userinfo.updated.push(new Date().getTime());
                 userinfo.avatar  = $scope.fileName;
                 $scope.fileName = "";

                 userinfo.$update( { avatar : userinfo.avatar } , function(resp) {
                    $('#uploadfile').val('');
                    $scope.messageUpload = 'Your avatar has been uploaded.';
                    $scope.uploadPhoto = false;
                 });
            }
            else {
                $scope.classUpload = 'alert-warning';
                $scope.uploadPhoto = false;
                $scope.messageUpload = 'Please select a photo to upload!';
            }
            
        }

        $scope.onPhotoSelect = function($files) {

            for (var i = 0; i < $files.length; i++) {
              var file = $files[i];
              $scope.upload = $upload.upload({
                url: '/upload/avatar', 
                method: 'POST',
                withCredentials: true,
                file: file
              }).success(function(data, status, headers, config) {
                // file is uploaded successfully
                $scope.fileName = data.files.file.name;
                $scope.uploadPhoto = true;
              });
            }
        
      };
    }
]);
