/* globals require console */
"use strict";

var path = require("path");

var express = require("express"),
    bodyParser = require("body-parser"),
    lowdb = require("lowdb"),
    cors = require("cors");

var db = lowdb("./src/server/data/data.json");
db._.mixin(require("underscore-db"));

var app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ limit: "1mb", extended: true }));

app.use(express.static("./src"));
// app.use("/libs", express.static(path.join(__dirname, "./../node_modules")));

app.get("/", function (req, res) {
  return res.sendFile(path.join(__dirname, "./index.html"));
});

require("./server/utils/authorize-user")(app, db);

var base = "/telerik-academy-web-front-end-social-network";

var usersController = require("./server/controllers/users-controller")(db);
app.get(base + "/api/users", usersController.get);
app.get(base + "/api/users/:username", usersController.get);
app.post(base + "/api/users", usersController.post);
app.put(base + "/api/auth", usersController.put);

var postsController = require("./server/controllers/posts-controller")(db);
app.get(base + "/api/posts", postsController.get);
app.post(base + "/api/posts", postsController.post);
app.put(base + "/api/posts/:id", postsController.put);

var port = 3000;
app.listen(port, function () {
  return console.log("Server is running at http://localhost:" + port);
});