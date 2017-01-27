/* globals dataService templates $ Handlebars console */

let controllers = {
  get(dataService, templates) {
    return {
      home() {
        let posts;
        dataService.posts()
          .then(postsResponse => {
            posts = postsResponse;
            console.log(posts);

            return templates.get("home");
          })
          .then(templateHtml => {
            let templateFunc = Handlebars.compile(templateHtml);
            let html = templateFunc(posts);
            $("#container").html(html);

            $(".btn-like-dislike").on("click", () => {
              let type = $(this).attr("data-type");
              let postId = $(this).parents("li").attr("data-id");
              dataService.like(postId, type)
                .then();
            });
          });
      },
      myProfile() {
        console.log("My Profile");
      },
      myPictures() {
        console.log("My Pictures");
      },
      addPost() {
        templates.get("post-add")
          .then(templateHtml => {
            let templateFunc = Handlebars.compile(templateHtml);
            let html = templateFunc();

            $("#container").html(html);

            $("#btn-add").on("click", () => {
              let post = {
                text: $("#tb-text").val(),
                img: $("#tb-img-url").val()
              };

              dataService.addPost(post)
                .then(() => {
                  window.location = "#/home";
                });
            });
          });
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
                      Materialize.toast('Successfully logged in!', 3000, 'grey darken-1');
                    })
                    .then(() => {
                      $(document.body).addClass("logged-in");
                      document.location = "#/home";
                    });

                  ev.preventDefault();
                  return false;
                });
              });
          });
      },
      register() {
        // dataService.isLoggedIn()
        //     .then(isLoggedIn => {
        //         if (isLoggedIn) {
        //             window.location = "#/home";
        //             return;
        //         }

        templates.get("register")
          .then(templateHtml => {
            let templateFunc = Handlebars.compile(templateHtml);
            let html = templateFunc();
            $("#container").html(html);

            $("#btn-register").on("click", ev => {
              let user = {
                username: $("#register-username").val(),
                passHash: $("#register-password").val()
              };

              dataService.register(user)
                .then(() => {
                  Materialize.toast('Successfully registered! Please log in!', 3000, 'grey darken-1')
                })
                .then(() => document.location = "#/login");

              ev.preventDefault();
              return false;
            });
          });
        // });
      }
    };
  }
};
