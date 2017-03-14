/* globals require console */
"use strict";

const express = require("express"),
  bodyParser = require("body-parser"),
  lowdb = require("lowdb"),
  cors = require("cors");

let db = lowdb("./data/data.json");
db._.mixin(require("underscore-db"));

let app = express();
app.use(cors());
app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({limit: '1mb', extended: true}));

app.use(express.static("public"));

require("./utils/authorize-user")(app, db);

//User routes
let usersController = require("./controllers/users-controller")(db);
app.get("/api/users", usersController.get);
app.post("/api/users", usersController.post);
app.put("/api/auth", usersController.put);

// Posts routes
let postsController = require("./controllers/posts-controller")(db);
app.get("/api/posts", postsController.get);
app.post("/api/posts", postsController.post);
app.put("/api/posts/:id", postsController.put);

let port = 3000;
app.listen(port, () => console.log(`Server is running at http://localhost:${port}`));
