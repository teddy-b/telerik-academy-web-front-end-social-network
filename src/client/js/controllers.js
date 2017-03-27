/* globals $ router Handlebars Materialize */

/* eslint-disable no-unused-vars */
class Controllers {
  static get(dataService, templates) {
    return {
      home() {
        let data = {};

        dataService.isLoggedIn()
          .then(isLoggedIn => {
            if (!isLoggedIn) {
              router.navigate("/login");
            } else {
              dataService.posts()
              .then(postsResponse => {
                data.result = postsResponse.result.sort((a, b) => {
                  return (new Date(b.postDate) - new Date(a.postDate));
                });

                return templates.get("home");
              })
              .then(templateHtml => {
                let templateFunc = Handlebars.compile(templateHtml);
                let html = templateFunc(data);
                let post = {
                  text: "",
                  img: ""
                };

                $("#container").html(html);

                $("#input-post").on("click", () => {
                  $("#btn-preview").removeClass("hide");
                  $("#btn-post").removeClass("hide");
                });

                $("#img-input").change(input => {
                  let files = input.target.files;

                  if (files && files[0]) {
                    let reader = new FileReader();

                    reader.onload = (ev) => {
                      $("#img-preview").attr("src", ev.target.result)
                        .removeClass("hide");

                      post.img = event.target.result;
                    };

                    reader.readAsDataURL(files[0]);
                  }
                });

                $("#btn-post").on("click", () => {
                  post.text = $("#input-post").val();

                  if (post.text || post.img) {
                    dataService.addPost(post)
                    .then(() => {
                      document.location = "#/";
                    }).catch(err => {
                      Materialize.toast(err.statusText, 4000, "grey darken-1");
                    });
                  } else {
                    Materialize.toast("Nothing to post. Write something or attach picture!", 4000, "grey darken-1");
                  }
                });

                $(".btn-like").on("click", function() {
                  let type = "like";
                  let postId = $(this).parents("li").attr("data-id");

                  dataService.like(postId, type)
                  .then(() => {
                    let count = $(this).siblings("span")[0];
                    count.innerHTML = +count.innerHTML + 1;
                  });
                  return false;
                });
              });
            }
          });
      },
      myProfile() {
        let data = {};
        let username = localStorage.getItem("username");

        if (username) {
          dataService.user(username)
          .then(userResponse => {
            data.user = userResponse.result;

            return templates.get("my-profile");
          })
          .then(templateHtml => {
            let templateFunc = Handlebars.compile(templateHtml);
            let html = templateFunc(data.user);
            let profilePic = "";

            $("#container").html(html);

            $("#profile-pic-input").change(input => {
              let files = input.target.files;

              if (files && files[0]) {
                let reader = new FileReader();

                reader.onload = (ev) => {
                  $("#profile-pic").attr("src", ev.target.result);

                  profilePic = ev.target.result;
                  data.user.picture = ev.target.result;
                };

                reader.readAsDataURL(files[0]);

                $("#btn-save-pic").removeClass("hide");
              }
            });

            $("#btn-save-pic").on("click", () => {
              if (profilePic) {
                dataService.editUser(data.user)
                .then(() => {
                  Materialize.toast("Your profile picture has been changed!", 4000, "grey darken-1");
                }).catch(err => {
                  Materialize.toast(err.statusText, 4000, "grey darken-1");
                })
                .then(() => {
                  document.location = "#/";
                });
              } else {
                Materialize.toast("Please upload picture!", 4000, "grey darken-1");
              }
            });
          });
        }
      },
      myPictures() {
      },
      login() {
        dataService.isLoggedIn()
          .then(isLoggedIn => {
            if (isLoggedIn) {
              window.location = "#/home";
              return;
            }

            templates.get("login")
              .then(templateHtml => {
                let templateFunc = Handlebars.compile(templateHtml);
                let html = templateFunc();

                $("#container").html(html);

                $("#btn-login").on("click", ev => {
                  let user = {
                    username: $("#tb-username").val(),
                    passHash: $("#tb-password").val()
                  };

                  dataService.login(user)
                    .then(() => {
                      dataService.user(user.username)
                      .then(userResponse => {
                        let loggedUser = userResponse.result;
                        $(".profile-picture")[0].src = loggedUser.picture;
                        $(".username")[0].innerHTML = loggedUser.username;
                      })
                      .then(() => {
                        $(document.body).addClass("logged-in");
                        document.location = "#/home";
                        Materialize.toast("Successfully logged in!", 4000, "grey darken-1");
                      });
                    });

                  ev.preventDefault();
                  return false;
                });
              });
          });
      },
      register() {
        dataService.isLoggedIn()
            .then(isLoggedIn => {
                if (isLoggedIn) {
                  Materialize.toast("You are already logged in!", 4000, "grey darken-1");
                    window.location = "#/home";
                    return;
                }

        templates.get("register")
          .then(templateHtml => {
            let templateFunc = Handlebars.compile(templateHtml);
            let html = templateFunc();
            $("#container").html(html);

            $("#btn-register").on("click", ev => {
              let user = {
                username: $("#register-username").val(),
                passHash: $("#register-password").val(),
                picture: "default.jpg"
              };

              dataService.register(user)
                .then(() => {
                  Materialize.toast("Successfully registered! Please log in!", 4000, "grey darken-1");
                })
                .then(() => {
                  document.location = "#/login";
                });

              ev.preventDefault();
              return false;
            });
          });
        });
      },
      messages() {
        let data = {};

        dataService.users()
        .then(usersResponse => {
          data.users = usersResponse;

          return templates.get("messages");
        })
        .then(templateHtml => {
          let templateFunc = Handlebars.compile(templateHtml);
          let html = templateFunc(data.users);
          $("#container").html(html);
        });
      }
    };
  }
}
