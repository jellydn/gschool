'use strict';

angular.module('mean').controller('ProfileController', ['$scope','$rootScope','$upload', '$stateParams','$http', '$location', 'Global','Users','toaster',
    function($scope,$rootScope, $upload, $stateParams, $http, $location, Global, Users,toaster) {
        $scope.global = Global;
        $scope.fileName = "";
        $scope.chatSwitch = false;
        $scope.messageSwitch = false;

        $scope.getClassType = function (type){
          if (type == 'mail' || type =='chat' || type =='comment') {
            return 'red';
          }
          else
            if (type == 'create') {
              return 'green';
            }
            else
              return 'purple';
      };

      $scope.getClassIcon = function (type){
            if (type == 'mail') {
              return 'fa-envelope';
            }
            else
              if (type == 'chat' || type =='comment') {
              return 'fa-comment-o';
              }
              else
                if (type == 'create') {
                 return 'fa-group';
                }
                else
                  return 'fa-circle-o';
        };
        $scope.detail = function(){
            // get user information
            $http.get('/api/profile?username=' + $stateParams.usernameId)
                 .success(function(user){
                    $scope.user = user.profile;
                    $scope.notes = user.notes;
                    $scope.classes = user.classes;
                    $scope.activities = user.activities;
                 })
                 .error(function(err){
                    // to homepage
                    $location.path('/');
                 });
        }

        $scope.me = function(){
            $scope.saveBasic = true;
            $scope.saveEmail = true;
            $scope.uploadPhoto = false;
            $scope.isSelectFile = false;
        	Users.get({
                userId: $scope.global.user._id
            }, function(user) {
                $scope.profile = user;
            });
        }

        $scope.setting = function(){

            $http.get('/settings').success(function(resp){
                $scope.chatSwitch = resp.chat;
                $scope.messageSwitch = resp.message;
                $('#chatSwitch').bootstrapSwitch('setState', $scope.chatSwitch);
                $('#messageSwitch').bootstrapSwitch('setState', $scope.messageSwitch);
            });

            $('input[type="checkbox"],[type="radio"]').not('#create-switch').bootstrapSwitch();
        }

        $scope.change = function(){
            $http.post('/settings',{chat : $('#chatSwitch').bootstrapSwitch('state'),message: $('#messageSwitch').bootstrapSwitch('state')})
                 .success(function(resp){
                    toaster.pop("success","Saving!","Your setting have been updated.");
                 });
        }

        $scope.changeLogo = function(){
            console.log($scope.fileName);
            if ($scope.fileName == '') {
                toaster.pop("info","Missing photo!","Please upload your logo image.");
                return;
            };

            $http.post('/settings/logo',{logo : $scope.fileName})
                 .success(function(resp){
                    toaster.pop("success","Saving!",'Your logo have been changed!');
                 })
                 .error(function(resp){
                    toaster.pop("error","Error",resp);
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
                $scope.isSelectFile = false;
                $scope.messageUpload = 'Please select a photo to upload!';
            }
            
        }

        $scope.onPhotoSelect = function($files) {
            $scope.isSelectFile = true;
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
                $scope.isSelectFile = false;
              })
              .progress(function(evt) {
                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
              });
            }
        
      };
    }
]);
