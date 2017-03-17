/* globals requester localStorage */

const HTTP_HEADER_KEY = "x-auth-key",
  KEY_STORAGE_USERNAME = "username",
  KEY_STORAGE_AUTH_KEY = "authKey";

/* eslint-disable no-unused-vars */
let dataService = {
  posts() {
    return requester.getJSON("/api/posts");
  },
  users() {
    return requester.getJSON("/api/users");
  },
  user(user) {
    return requester.getJSON("/api/users", user);
  },
  addPost(post) {
    let options = {
      headers: {
        [HTTP_HEADER_KEY]: localStorage.getItem(KEY_STORAGE_AUTH_KEY)
      }
    };

    return requester.postJSON("/api/posts", post, options);
  },
  like(postId, type) {
    let options = {
      headers: {
        [HTTP_HEADER_KEY]: localStorage.getItem(KEY_STORAGE_AUTH_KEY)
      }
    };

    return requester.putJSON("/api/posts/" + postId, { type }, options);

  },
  login(user) {
    return requester.putJSON("/api/auth", user)
      .then(respUser => {
        localStorage.setItem(KEY_STORAGE_USERNAME, respUser.result.username);
        localStorage.setItem(KEY_STORAGE_AUTH_KEY, respUser.result.authKey);
      });
  },
  register(user) {
    return requester.postJSON("/api/users", user);
  },
  logout() {
    return Promise.resolve()
      .then(() => {
        localStorage.removeItem(KEY_STORAGE_USERNAME);
        localStorage.removeItem(KEY_STORAGE_AUTH_KEY);
      });
  },
  isLoggedIn() {
    return Promise.resolve()
      .then(() => {
        return !!localStorage.getItem(KEY_STORAGE_USERNAME);
      });
  }
};
