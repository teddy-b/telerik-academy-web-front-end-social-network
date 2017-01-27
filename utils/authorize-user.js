/* globals module */
"use strict";

module.exports = function (app, db) {
  app.use("/api", function (req, res, next) {
    let authKey = req.headers["x-auth-key"];
    req.user = db("users").find({
      authKey
    });
    next();
  });
};
