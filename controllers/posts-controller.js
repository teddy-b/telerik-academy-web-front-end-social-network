/* globals require module */
"use strict";

const _ = require("lodash");

const DEFAULT_COOKIE_IMAGE = "https://dayinthelifeofapurpleminion.files.wordpress.com/2014/12/batman-exam.jpg";

module.exports = db => {
  const get = (req, res) => {
    let posts = _.chain(db("posts"))
      .sortBy(post => -post.likes || (post.postDate - 0));

    console.log(posts);

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
    post.dislikes = 0;
    post.img = post.img || DEFAULT_COOKIE_IMAGE;
    post.shareDate = new Date();

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
    } else {
      post.dislikes += 1;
    }

    db.save();

    return res.send({
      result: post
    });
  };

  return { get, post, put };
};
