"use strict";

/* globals $ console Handlebars Materialize */

/* eslint-disable no-unused-vars */
var controllers = {
  get: function get(dataService, templates) {
    return {
      home: function home() {
        var data = {};

        dataService.posts().then(function (postsResponse) {
          data.result = postsResponse.result.sort(function (a, b) {
            return new Date(b.postDate) - new Date(a.postDate);
          });

          return templates.get("home");
        }).then(function (templateHtml) {
          var templateFunc = Handlebars.compile(templateHtml);
          var html = templateFunc(data);
          var post = {
            text: "",
            img: ""
          };

          $("#container").html(html);

          $("#input-post").on("click", function () {
            $("#btn-preview").removeClass("hide");
            $("#btn-post").removeClass("hide");
          });

          $("#img-input").change(function (input) {
            var files = input.target.files;

            if (files && files[0]) {
              var reader = new FileReader();

              reader.onload = function (ev) {
                $("#img-preview").attr("src", ev.target.result).removeClass("hide");

                post.img = event.target.result;
              };

              reader.readAsDataURL(files[0]);
            }
          });

          $("#btn-post").on("click", function () {
            post.text = $("#input-post").val();

            if (post.text || post.img) {
              dataService.addPost(post).then(function () {
                document.location = "#/";
              }).catch(function (err) {
                Materialize.toast(err.statusText, 3000, "grey darken-1");
              });
            } else {
              Materialize.toast("Nothing to post. Write something or attach picture!", 3000, "grey darken-1");
            }
          });

          $(".btn-like").on("click", function () {
            var _this = this;

            var type = "like";
            var postId = $(this).parents("li").attr("data-id");

            dataService.like(postId, type).then(function () {
              var count = $(_this).siblings("span")[0];
              count.innerHTML = +count.innerHTML + 1;
            });
            return false;
          });
        });
      },
      myProfile: function myProfile() {
        var data = {};
        var username = localStorage.getItem("username");

        if (username) {
          dataService.user(username).then(function (userResponse) {
            data = userResponse.result;
            console.log(data);

            return templates.get("my-profile");
          }).then(function (templateHtml) {
            var templateFunc = Handlebars.compile(templateHtml);
            var html = templateFunc(data);
            $("#container").html(html);
          });
        }
      },
      myPictures: function myPictures() {
        console.log("My Pictures");
      },
      login: function login() {
        dataService.isLoggedIn().then(function (isLoggedIn) {
          if (isLoggedIn) {
            window.location = "#/home";
            return;
          }

          templates.get("login").then(function (templateHtml) {
            var templateFunc = Handlebars.compile(templateHtml);
            var html = templateFunc();

            $("#container").html(html);

            $("#btn-login").on("click", function (ev) {
              var user = {
                username: $("#tb-username").val(),
                passHash: $("#tb-password").val()
              };

              dataService.login(user).then(function () {
                dataService.user(user.username).then(function (userResponse) {
                  var loggedUser = userResponse.result;
                  $(".profile-picture")[0].src = "./assets/images/" + loggedUser.picture;
                  $(".username")[0].innerHTML = loggedUser.username;
                }).then(function () {
                  $(document.body).addClass("logged-in");
                  document.location = "#/home";
                  Materialize.toast("Successfully logged in!", 3000, "grey darken-1");
                });
              });

              ev.preventDefault();
              return false;
            });
          });
        });
      },
      register: function register() {
        dataService.isLoggedIn().then(function (isLoggedIn) {
          if (isLoggedIn) {
            Materialize.toast("You are already logged in!", 3000, "grey darken-1");
            window.location = "#/home";
            return;
          }

          templates.get("register").then(function (templateHtml) {
            var templateFunc = Handlebars.compile(templateHtml);
            var html = templateFunc();
            $("#container").html(html);

            $("#btn-register").on("click", function (ev) {
              var user = {
                username: $("#register-username").val(),
                passHash: $("#register-password").val(),
                picture: "default.jpg"
              };

              dataService.register(user).then(function () {
                Materialize.toast("Successfully registered! Please log in!", 3000, "grey darken-1");
              }).then(function () {
                document.location = "#/login";
              });

              ev.preventDefault();
              return false;
            });
          });
        });
      },
      messages: function messages() {
        var data = {};

        dataService.users().then(function (usersResponse) {
          data = usersResponse;

          return templates.get("messages");
        }).then(function (templateHtml) {
          var templateFunc = Handlebars.compile(templateHtml);
          var html = templateFunc(data);
          $("#container").html(html);
        });
      }
    };
  }
};