/* globals require module */
"use strict";

module.exports = function (db) {
  var get = function get(req, res) {
    var users = db("users").map(function (u) {
      return {
        username: u.username,
        id: u.id,
        picture: u.picture
      };
    });

    var postings = db("posts").forEach(function (p) {
      var user = users.filter(function (u) {
        return u.id === p.userId;
      })[0];
      p.picture = user.picture;
      p.username = user.username;
      p.time = new Date(p.postDate).toLocaleString();
    });

    res.send({
      result: postings
    });
  };

  var post = function post(req, res) {
    var user = req.user;

    if (!user) {
      return res.status(401).send("User not authorized");
    }

    var posting = req.body;

    posting.userId = user.id;
    posting.likes = 0;
    posting.img = posting.img || "";
    posting.postDate = new Date();

    db("posts").insert(posting);

    return res.status(201).send({
      result: posting
    });
  };

  var put = function put(req, res) {
    var user = req.user;

    if (!user) {
      return res.status(401).send("User not authorized");
    }

    var postId = req.params.id;
    var posting = db("posts").find({
      id: postId
    });

    if (!posting) {
      return res.status(404).send("Invalid post ID");
    }

    posting.likes += 1;

    db.save();

    return res.send({
      result: posting
    });
  };

  return { get: get, post: post, put: put };
};