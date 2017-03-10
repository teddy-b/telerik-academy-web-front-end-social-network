/* globals require module */
"use strict";

const users = require("./users-controller");

module.exports = db => {
  const get = (req, res) => {
    let users = db("users")
    .map(u => ({
      username: u.username,
      id: u.id,
      picture: u.picture
    }));

    let posts = db("posts")
      .forEach(p => {
        let user = users.filter(u => u.id === p.userId)[0];
        p.picture = user.picture;
        p.username = user.username;
        p.time = new Date(p.postDate).toLocaleString();
      });

    res.send({
      result: posts
    });
  };

  const post = (req, res) => {
    let user = req.user;

    if (!user) {
      return res.status(401)
        .send("User not authorized");
    }

    let post = req.body;

    post.userId = user.id;
    post.likes = 0;
    post.img = post.img || '';
    post.postDate = new Date();

    db("posts").insert(post);

    return res.status(201)
      .send({
        result: post
      });
  };

  const put = (req, res) => {
    let user = req.user;

    if (!user) {
      return res.status(401)
        .send("User not authorized");
    }

    let postId = req.params.id;
    let post = db("posts").find({
      id: postId
    });

    if (!post) {
      return res.status(404)
        .send("Invalid post ID");
    }

    let type = req.body.type;
    if (["like", "dislike"].indexOf(type) < 0) {
      return res.status(400)
        .send("Request type must be either like or dislike");
    }

    if (req.body.type === "like") {
      post.likes += 1;
    }

    db.save();

    return res.send({
      result: post
    });
  };

  return { get, post, put };
};
