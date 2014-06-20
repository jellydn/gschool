'use strict';

module.exports = function (socket, users) {
    var userName = null;
     
    socket.on('createMessage', function(data) {
        socket.broadcast.emit('onMessageCreated', data);
        socket.broadcast.emit('onNotifyCreated', {action : 'compose', object : 'message'});
    });

    socket.on('createQuiz', function(quiz) {
        socket.broadcast.emit('onQuizCreated', quiz);
        socket.broadcast.emit('onNotifyCreated', {action : 'create', object : 'quiz'});
    });

    socket.on('createComment', function(comment) {
        socket.broadcast.emit('onCommentCreated', comment);
        socket.broadcast.emit('onNotifyCreated', {action : 'comment', object : 'note'});
    });

    // send for current online for new user
    socket.emit('listOnlineUser', users.get() );

    // check get online
    socket.on('whoonline',function(){
        // check list for all ( me and other users)
        socket.emit("listOnlineUser", users.get());
        socket.broadcast.emit("listOnlineUser", users.get());
    })

    // get online list
    socket.on('online',function(user){
        if (users.claim(user.username)) {
            users.addUser(user);
            userName = user.username;

            socket.broadcast.emit("onUserJoin", user);
        }
        else {
            console.log("User already exists");
        }

    });
    // User login
    socket.on('login',function(user){
        if (users.claim(user.username)) {
            users.addUser(user);
            userName = user.username;

            socket.broadcast.emit("onUserJoin", user);
        }
        else {
            console.log("User already exists");
        }

    });
    // Chat 1 -1 message

    socket.on('sendChat',function(msg){
         socket.broadcast.emit("onChatCreated", msg);
         socket.broadcast.emit('onNotifyCreated', {action : 'send', object : 'chat'});
    });

    // user logout or disconnect

    socket.on('disconnect',function(){
        users.removeUser(userName);
        socket.broadcast.emit("listOnlineUser", users.get());
    });
};