"use strict";

/* globals module */

module.exports = function (db) {
  var AUTH_KEY_LENGTH = 60,
      AUTH_KEY_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  function generateAuthKey(uniquePart) {
    var authKey = uniquePart,
        index = void 0;

    while (authKey.length < AUTH_KEY_LENGTH) {
      index = Math.floor(Math.random() * AUTH_KEY_CHARS.length);
      authKey += AUTH_KEY_CHARS[index];
    }

    return authKey;
  }

  function get(req, res) {
    // let user = req.user;
    // if (!user) {
    //   return res.status(401)
    //     .send("Unauthorized user!");
    // }

    if (req.params.username) {
      var username = req.params.username;

      var user = db("users").find({
        username: username
      });

      return res.send({
        result: user
      });
    }

    var users = db("users").map(function (u) {
      return {
        username: u.username,
        id: u.id,
        picture: u.picture
      };
    });

    return res.send({
      result: users
    });
  }

  function post(req, res) {
    var user = req.body;
    if (!user || typeof user.username !== "string" || typeof user.passHash !== "string") {
      return res.status(400).send("Invalid user");
    }

    var dbUser = db("users").find({
      usernameToLower: user.username.toLowerCase()
    });

    if (dbUser) {
      return res.status(400).send("Duplicated user");
    }
    user.usernameToLower = user.username.toLowerCase();
    db("users").insert(user);

    return res.status(201).send({
      result: {
        username: user.username
      }
    });
  }

  function put(req, res) {
    var reqUser = req.body;
    var user = db("users").find({
      usernameToLower: reqUser.username.toLowerCase()
    });
    if (!user || user.passHash !== reqUser.passHash) {
      return res.status(404).send("Invalid username or password");
    }

    if (!user.authKey) {
      user.authKey = generateAuthKey(user.id);
      db.save();
    }

    return res.send({
      result: {
        username: user.username,
        authKey: user.authKey
      }
    });
  }

  return { get: get, post: post, put: put };
};