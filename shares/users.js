'use strict';

var data = module.exports = {};

var usersCollection = {};

data.users = {
    claim: function (name) {
        return !(!name || usersCollection[name]);
    },
    get: function () {
        return usersCollection;
    },
    addUser: function (user) {
        usersCollection[user.username] = user;
    },
    removeUser: function (username) {
        delete usersCollection[username];
    }
};