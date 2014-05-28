'use strict';

module.exports = function (socket, users) {
    var userName = null;
     
    socket.on('createMessage', function(data) {
        socket.broadcast.emit('onMessageCreated', data);
    });

    socket.on('createComment', function(comment) {
        socket.broadcast.emit('onCommentCreated', comment);
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

    });

    // user logout or disconnect

    socket.on('disconnect',function(){
        console.log('user logout or disconnect');
        users.removeUser(userName);
        socket.broadcast.emit("onUserJoin", users.get());
    });
};