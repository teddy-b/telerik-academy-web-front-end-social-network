"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* globals requester localStorage */

var HTTP_HEADER_KEY = "x-auth-key",
    KEY_STORAGE_USERNAME = "username",
    KEY_STORAGE_AUTH_KEY = "authKey";

/* eslint-disable no-unused-vars */
var dataService = {
  posts: function posts() {
    return requester.getJSON("/api/posts");
  },
  users: function users() {
    return requester.getJSON("/api/users");
  },
  user: function user(username) {
    return requester.getJSON("/api/users/" + username);
  },
  addPost: function addPost(post) {
    var options = {
      headers: _defineProperty({}, HTTP_HEADER_KEY, localStorage.getItem(KEY_STORAGE_AUTH_KEY))
    };

    return requester.postJSON("/api/posts", post, options);
  },
  like: function like(postId, type) {
    var options = {
      headers: _defineProperty({}, HTTP_HEADER_KEY, localStorage.getItem(KEY_STORAGE_AUTH_KEY))
    };

    return requester.putJSON("/api/posts/" + postId, { type: type }, options);
  },
  login: function login(user) {
    return requester.putJSON("/api/auth", user).then(function (respUser) {
      localStorage.setItem(KEY_STORAGE_USERNAME, respUser.result.username);
      localStorage.setItem(KEY_STORAGE_AUTH_KEY, respUser.result.authKey);
    });
  },
  register: function register(user) {
    return requester.postJSON("/api/users", user);
  },
  logout: function logout() {
    return Promise.resolve().then(function () {
      localStorage.removeItem(KEY_STORAGE_USERNAME);
      localStorage.removeItem(KEY_STORAGE_AUTH_KEY);
    });
  },
  isLoggedIn: function isLoggedIn() {
    return Promise.resolve().then(function () {
      return !!localStorage.getItem(KEY_STORAGE_USERNAME);
    });
  }
};