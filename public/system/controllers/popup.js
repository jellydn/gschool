'use strict';

angular.module('mean.system').controller('MessagePopupController',function($scope,$modalInstance,data,Messages,$location,$timeout,$interval,cfpLoadingBar){

    $scope.data = data;
    var stop;

    $scope.quickReply = function(){
          if ($location.path() == '/messages') {
            var tmpData = [];
            
            tmpData.push({ 'id' : $scope.data.from._id , 'text' : $scope.data.from.name });
            
            for (var i = 0; i < $scope.data.to.length; i++) {
                    tmpData.push({ 'id' : $scope.data.to[i]._id , 'text' : $scope.data.to[i].name }) ;
            };
            CKEDITOR.instances.message.setData('<br/><blockquote>' + $scope.data.message + '</blockquote>');
            $("#selectRecipient").select2('data', tmpData);
            $modalInstance.close();
            $('#myModal').modal();
             
            if (angular.isDefined(stop)) {
              $interval.cancel(stop);
              stop = undefined;
            }
          }
          else
          {
            $location.path('/messages');
            stop = $interval(function(){
                 console.log(cfpLoadingBar.status() );
                 if (cfpLoadingBar.status() == 1) {
                    $scope.quickReply();
                 }
             }, 100);
          }
  
         
      };

    $scope.deleteMessage = function () {

          $scope.showLoading = true;
          Messages.clean({ids : [$scope.data._id] , inbox : 1, trash : 0 , schedule : 0},function(resp){
              // reset pagination
              $modalInstance.close();
              $location.path('/messages');
          });
      };
    
})
.run(['$templateCache',function($templateCache){
  $templateCache.put('/dialogs/message.html','<div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">From {{data.fromName}} - <span data-livestamp="{{data.dateSent}}"></span></h4></div><div class="modal-body" ng-bind-html="data.message"></div><div class="modal-footer"><button type="button" ng-click="quickReply()" class="btn btn-info" data-dismiss="modal">Reply</button><button type="button" ng-click="deleteMessage()" class="btn btn-danger" data-dismiss="modal">Delete</button></div></div></div>');

   $templateCache.put('/dialogs/chat.html','<div class="modal-header"><h3 class="modal-title">Chat</h3></div><div class="modal-body"><div class="chat-conversation"><ul class="conversation-list" div-directive><li class="{{chat.class}}" my-repeat-directive data-ng-repeat="chat in chats" scroll-to-me><div style="width:50px;" class="chat-avatar"><my-avatar userid="{{chat.createBy._id}}" type="small" file="{{chat.createBy.avatar}}"></my-avatar><i style="float:left;"><span data-livestamp="{{chat.dateCreate}}">{{chat.dateCreate | date: "hh:mm"}}</span></i></div><div class="conversation-text"><div class="ctext-wrap"><i>{{chat.createBy.name}}</i><p>{{chat.message}}</p><p data-ng-show="chat.file.length"><a href="/public/uploads/chats/{{chat.createBy._id}}/{{chat.file}}">Attached file{{chat.file}}</a><br/><img class="attach-image" data-ng-show="chat.isImageFile" src="/public/uploads/chats/{{chat.createBy._id}}/medium_{{chat.file}}"></p></div></div></li></ul><form data-ng-submit="create()"><div class="row"><div class="col-xs-9"><input type="text" required ng-model="message" class="form-control chat-input" placeholder="Enter your text"></div><div class="col-xs-3 chat-send"><button type="submit" class="btn btn-default">Send</button></div></div><div class="row"><div class="col-xs-12"><a href="#" ng-click="schedule()"><i class="fa fa-upload"></i> Upload file</a> &nbsp;<input type="file" id="uploadfile" ng-file-select="onPhotoSelect($files)"></div></div></form></div></div>');
}]);
