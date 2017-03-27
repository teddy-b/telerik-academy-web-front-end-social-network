/* globals Requester localStorage */

const HTTP_HEADER_KEY = "x-auth-key",
  KEY_STORAGE_USERNAME = "username",
  KEY_STORAGE_AUTH_KEY = "authKey";

class DataService {
  static posts() {
    return Requester.getJSON("/api/posts");
  }

  static users() {
    return Requester.getJSON("/api/users");
  }

  static user(username) {
    return Requester.getJSON("/api/users/" + username);
  }

  static editUser(user) {
    return Requester.putJSON("/api/users/" + user.username + "/edit");
  }

  static addPost(post) {
    let options = {
      headers: {
        [HTTP_HEADER_KEY]: localStorage.getItem(KEY_STORAGE_AUTH_KEY)
      }
    };

    return Requester.postJSON("/api/posts", post, options);
  }

  static like(postId, type) {
    let options = {
      headers: {
        [HTTP_HEADER_KEY]: localStorage.getItem(KEY_STORAGE_AUTH_KEY)
      }
    };

    console.log(postId);

    return Requester.putJSON("/api/posts/" + postId, { type }, options);

  }

  static login(user) {
    return Requester.putJSON("/api/auth", user)
      .then(respUser => {
        localStorage.setItem(KEY_STORAGE_USERNAME, respUser.result.username);
        localStorage.setItem(KEY_STORAGE_AUTH_KEY, respUser.result.authKey);
      });
  }

  static register(user) {
    return Requester.postJSON("/api/users", user);
  }

  static logout() {
    return Promise.resolve()
      .then(() => {
        localStorage.removeItem(KEY_STORAGE_USERNAME);
        localStorage.removeItem(KEY_STORAGE_AUTH_KEY);
      });
  }

  static isLoggedIn() {
    return Promise.resolve()
      .then(() => {
        return !!localStorage.getItem(KEY_STORAGE_USERNAME);
      });
  }
}
