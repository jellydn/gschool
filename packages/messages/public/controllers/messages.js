'use strict';

angular.module('mean').controller('MessageController', ['$scope','$rootScope','$timeout','$upload', '$stateParams','$http', '$location', 'Global','dialogs', 'Messages', 'Socket',
    function($scope,$rootScope,$timeout,$upload, $stateParams, $http, $location, Global, dialogs, Messages, Socket) {
        $scope.global = Global;
        $scope.limit = 10;
        $scope.fromOffset = 0;
        $scope.toOffset = 0;
        $scope.pageNumber = 1;
        $scope.totals = 0;
        $scope.toalsPage = 0;
        $scope.messages = [];
        $scope.showLoading = false;
        $scope.isInbox = 1;
        $scope.isTrash = 0;
        $scope.isSchedule = 0;
        $scope.heading = "Inbox";
        $scope.inboxActive = "active";
        $scope.fileName = "";
        $scope.repeatTime = "";
        $scope.uploadProgress = 0;
        $scope.currentMesssage = null;
        // Incoming
        Socket.on('onMessageCreated', function(data) {
            // check if current user in array recipients
            var msg = data.message;
            if (msg.to.indexOf($scope.global.user.username) !== -1) {
                $scope.find();
            };
        });

        // private function

        $scope.getMessages = function(page){

            $http.get('/api/unread').success(function(response){
                $scope.global.unreadInbox = response.totals;
            }); 

            Messages.query({limit : $scope.limit , page : $scope.pageNumber , inbox : $scope.isInbox, trash : $scope.isTrash , schedule : $scope.isSchedule },function(messages) {
                $scope.fromOffset = ( $scope.pageNumber - 1 ) * $scope.limit + 1;
                $scope.toOffset = $scope.pageNumber * $scope.limit;
                $scope.totals = messages[messages.length - 1].totals;

                if ($scope.totals == 0) {
                    $scope.fromOffset = 0;
                };

                $scope.totalsPage = messages[messages.length - 1].pages;
                if($scope.toOffset > $scope.totals)
                    $scope.toOffset = $scope.totals;

                var finalResult = [];
                for (var i = messages.length - 2; i >= 0; i--) {
                    var tmp = messages[i];

                    if (tmp.file != "") {
                        tmp.hasAttachment = true;
                        tmp.attachment = '/public/upload/' + tmp.file;
                    }
                    else 
                    {
                       tmp.hasAttachment = false;    
                    }
                    
                    if ($scope.isSchedule) {
                        // switch to receiver
                        tmp.fromName = tmp.to.join(',');
                    };

                    if ($scope.isInbox) {
                        if( tmp.isRead.indexOf($scope.global.user.username) !== -1 )
                            tmp.status = 'read';
                        else
                            tmp.status = 'unread';
                    }
                    else
                    {
                        tmp.status = 'read';
                    }

                    

                    finalResult.push(tmp);
                };

                $scope.messages = finalResult;
                $scope.showLoading = false;
            });
        }

        // find all

        $scope.find = function() {
            $scope.showLoading = true;
            $scope.getMessages($scope.pageNumber);
        };

        // sent email
        $scope.sent = function() {
            $scope.showLoading = true;
            $scope.pageNumber = 1;
            $scope.heading = "Sent email";
            $scope.isInbox = 0;
            $scope.isTrash = 0;
            $scope.isSchedule = 0;
            $scope.getMessages($scope.pageNumber);
        };      

        // inbox
        $scope.inbox = function() {
            $scope.showLoading = true;
            $scope.pageNumber = 1;
            $scope.isInbox = 1;
            $scope.isTrash = 0;
            $scope.isSchedule = 0;
            $scope.heading = "Inbox";
            $scope.inboxActive = "active";
            $scope.trashActive = "";
            $scope.scheduleActive = "";
            $scope.getMessages($scope.pageNumber);
        };   

        // trash
        $scope.trash = function(){
            $scope.showLoading = true;
            $scope.pageNumber = 1;
            $scope.isInbox = 0;
            $scope.isTrash = 1;
            $scope.isSchedule = 0;
            $scope.heading = "Trash";
            $scope.inboxActive = "";
            $scope.trashActive = "active";
            $scope.scheduleActive = "";
            $scope.getMessages($scope.pageNumber);
        }

        // trash
        $scope.schedule = function(){
            $scope.showLoading = true;
            $scope.pageNumber = 1;
            $scope.isInbox = 0;
            $scope.isTrash = 0;
            $scope.isSchedule = 1;
            $scope.heading = "Schedule";
            $scope.inboxActive = "";
            $scope.trashActive = "";
            $scope.scheduleActive = "active";
            $scope.getMessages($scope.pageNumber);
        }

        // Show modal
        $scope.showModal = function (message) {
            $scope.currentMesssage = message;
            $('#myModalDetail h4').html('<p>From ' + message.fromName + ' - <span data-livestamp="'+ message.dateSent +'"></span></p>');

            $('#myModalDetail .modal-body').html(message.message);

            if ( (typeof message.file != 'undefined') &&  message.file != "") {
                $('#myModalDetail .modal-body').prepend('<div id="attachment"> Your attachment: <a href="/public/uploads/' + message.file + '">' + message.file + '</a></div></br>');
            }

            $('input[rel=' + message._id + ']').parent().parent().removeClass('unread').addClass('read');
            $('#myModalDetail').modal('show');

            
            // mark as read right now
            if ($scope.isInbox) {
                message.$update(function() {
                   $http.get('/api/unread').success(function(response){
                        $scope.global.unreadInbox = response.totals;
                    }); 
                });
            };
            
        };


        // Check all msg
        $scope.checkAll = function () {
            if($('#checkAll').is(':checked')){
                $('input.mail-checkbox').each(function(){
                    $(this).prop('checked',true);
                });
            }
            else
            {
                $('input.mail-checkbox').each(function(){
                    $(this).prop('checked',false);
                });
            }
        };

        $scope.showPicker = function(){

            $('#ontime').datetimepicker({
                  datepicker:false,
                  format:'H:i',
                   mask:true,
                  onChangeDateTime:function(dp,$input){
                    $scope.repeatTime = $input.val();
                  } 
              });
             $('#ontime').datetimepicker('show'); 
             $('#ondatetime').datetimepicker({
                       mask:true,
                      onChangeDateTime:function(dp,$input){
                        $scope.repeatTime = $input.val();
                      } 
                  });
             $('#ondatetime').datetimepicker('show'); 
        };

        // utility function
        $scope.$on('LoadTimePicker', function() {
            
            $('#ontime').datetimepicker({
                  datepicker:false,
                  format:'H:i',
                   mask:true,
                  onChangeDateTime:function(dp,$input){
                    $scope.repeatTime = $input.val();
                  } 
              });
                        
           
            
        });

        $scope.$on('LoadDateTimePicker', function() {

            $('#ondatetime').datetimepicker({
                       mask:true,
                      onChangeDateTime:function(dp,$input){
                        $scope.repeatTime = $input.val();
                      } 
                  });
            
            
        });

        $scope.$on('LoadJs', function() {
                var ajaxUrl = '';
                if ($stateParams.classId != undefined) {
                    ajaxUrl = "/api/members/" + $stateParams.classId + '/';
                }
                else
                {
                    ajaxUrl = "/api/users";
                }    

                $("#selectRecipient").select2({
                    placeholder: "Search a recipient",
                    multiple: true,
                    ajax: { 
                        url: ajaxUrl,
                        dataType: 'jsonp',
                        data: function (term, page) {
                            return {
                                q: term, // search term
                                page_limit: 10,
                            };
                        },
                        results: function (data, page) {
                            var classData = [];
                            for (var i = 0; i < data.length; i++) {
                                classData[i] = { id : data[i].username , text : data[i].name , owner : data[i]._id, file : data[i].avatar };
                            };
                            return {results: classData};
                        }
                    },
                    initSelection: function(element, callback) {
                        var id=$(element).val();
                    },
                    formatResult: userFormatResult, 
                    formatSelection: userFormatSelection,  
                    escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
                });
        });

        $scope.selectRead = function () {
            $('input.mail-checkbox').each(function(){
                    
                    if ($(this).parent().parent().hasClass('read')) {
                        $(this).prop('checked',true);
                    }
                    else
                        $(this).prop('checked',false);
            });
        };

         $scope.selectUnread = function () {
            $('input.mail-checkbox').each(function(){
                    
                    if ($(this).parent().parent().hasClass('unread')) {
                        $(this).prop('checked',true);
                    }
                    else
                        $(this).prop('checked',false);
            });
        };

        $scope.selectNone = function () {
            $('input.mail-checkbox').each(function(){
                   $(this).prop('checked',false);
                        
            });
            $('#checkAll').prop('checked',false);
        };

        // mark all as read
        $scope.massRead = function () {
            var idArr = [];
            $('input.mail-checkbox').each(function(){
                    if ($(this).is(':checked')) {
                        idArr.push($(this).attr('rel'));
                    };
            });
            for (var i = 0; i < $scope.messages.length; i++) {
                if( $scope.messages[i].status == 'unread' && idArr.indexOf($scope.messages[i]._id) !== -1)
                    $scope.messages[i].$update(); 
            };
        };

        $scope.massUnread = function () {
            // body...
        };


        $scope.deleteMessage = function () {

            $scope.showLoading = true;
            Messages.clean({ids : [$scope.currentMesssage._id] , inbox : $scope.isInbox, trash : $scope.isTrash , schedule : $scope.isSchedule},function(resp){
                // reset pagination
                $scope.totals -= 1;

                $scope.totalsPage = Math.ceil($scope.totals / $scope.limit);

                if($scope.totalsPage < 1)
                    $scope.totalsPage = 1;

                if ($scope.pageNumber > $scope.totalsPage) {
                    $scope.pageNumber = $scope.totalsPage;
                };
                if ($scope.isSchedule) {
                        $scope.schedule();
                }
                else
                {
                    $scope.find(); 
                }
            
                 
                $('#checkAll').prop('checked',false);
            });
        };

        // remove msg
        $scope.massDelete = function () {
            $scope.showLoading = true;
            var idArr = [];
            $('input.mail-checkbox').each(function(){
                    if ($(this).is(':checked')) {
                        idArr.push($(this).attr('rel'));
                    };
            });
            Messages.clean({ids : idArr.join(',') , inbox : $scope.isInbox, trash : $scope.isTrash , schedule : $scope.isSchedule},function(resp){
                // reset pagination
                $scope.totals -= idArr.length;

                $scope.totalsPage = Math.ceil($scope.totals / $scope.limit);

                if($scope.totalsPage < 1)
                    $scope.totalsPage = 1;

                if ($scope.pageNumber > $scope.totalsPage) {
                    $scope.pageNumber = $scope.totalsPage;
                };
                if ($scope.isSchedule) {
                        $scope.schedule();
                }
                else
                {
                    $scope.find(); 
                }
            
                 
                $('#checkAll').prop('checked',false);
            });
            
        };

        // pagination

        $scope.nextPage = function(){
            if($scope.pageNumber < $scope.totalsPage)
            {
                $('#checkAll').prop('checked',false);
                $scope.showLoading = true;
                $scope.pageNumber += 1;
                $scope.getMessages($scope.pageNumber);
            }
        };


        $scope.previousPage = function(){
            if($scope.pageNumber > 1 )
            {
                $('#checkAll').prop('checked',false);
                $scope.showLoading = true;
                $scope.pageNumber -= 1;
                $scope.getMessages($scope.pageNumber);
            }
        }


        // send msg

        $scope.quickReply = function(){
            var tmpData = { 'id' : $scope.currentMesssage.from.username , 'text' : $scope.currentMesssage.from.name };
            $("#selectRecipient").select2('data', tmpData);
            $("#selectRecipient").select2('readonly', true);
            $('#myModal').modal();
        }

         $scope.send = function() {
            this.recipient = $('#selectRecipient').select2('val');
            if (!this.recipient.length) {
                    alert('Please select at least on recipient!');
                    return;
            } 

            if ($scope.repeatChecked) {
               // find the select weekly
               var selectWeeklyArr = [];
               $('#selectWeekly').find('input').each(function(){
                    if ($(this).is(':checked')) {
                        selectWeeklyArr.push($(this).attr('name'));
                    };
               });
               if (!selectWeeklyArr.length) {
                    alert('Please select at least on day!');
                    return;
               } else {
                    selectWeeklyArr.push($scope.repeatTime);
                    $scope.repeatTime = selectWeeklyArr.join(',');
               }
            }

            var message = new Messages({
                receiver : this.recipient,
                message: this.message,
                file : $scope.fileName,
                repeatChecked : $scope.repeatChecked,
                occurChecked : $scope.occurChecked,
                repeat : $scope.repeatTime
            });


            message.$save(function(response) {
                $scope.find();
                Socket.emit('createMessage', {message : message , user : $scope.global.user});
                $('#uploadfile').val('');
                $('#exampleInputEmail3').tokenfield('createToken', '');
                $("#selectRecipient").select2('data', []);
                $("#selectRecipient").select2('readonly', false);
            });
            $('#myModal').modal('hide');
            $('#myModalMessage').modal('hide');
            this.recipient = '';
            this.message = '';
            // reset upload file
            $scope.fileName = "";
            $scope.repeatChecked = false;
            $scope.occurChecked = false;
        };

    
        $scope.onFileSelect = function($files) {

        for (var i = 0; i < $files.length; i++) {
          var file = $files[i];
          $scope.upload = $upload.upload({
            url: '/upload', 
            method: 'POST',
            withCredentials: true,
            file: file
          }).progress(function(evt) {
             $scope.uploadProgress = parseInt(100.0 * evt.loaded / evt.total);
          })
          .success(function(data, status, headers, config) {
            // file is uploaded successfully
            $scope.fileName = data.files.file.name;
          });
        }
        
      };
    }
]);
