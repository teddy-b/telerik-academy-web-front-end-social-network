/* globals requester localStorage */

const HTTP_HEADER_KEY = "x-auth-key",
  KEY_STORAGE_USERNAME = "username",
  KEY_STORAGE_AUTH_KEY = "authKey";

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
        localStorage.setItem("username", respUser.result.username);
        localStorage.setItem("authKey", respUser.result.authKey);
      });
  },
  register(user) {
    return requester.postJSON("/api/users", user);
  },
  logout() {
    return Promise.resolve()
      .then(() => {
        localStorage.removeItem("username");
        localStorage.removeItem("authKey");
      });
  },
  isLoggedIn() {
    return Promise.resolve()
      .then(() => {
        return !!localStorage.getItem("username");
      });
  }
};
