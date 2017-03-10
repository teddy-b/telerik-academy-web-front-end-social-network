/* globals dataService templates $ Handlebars console */

let controllers = {
  get(dataService, templates) {
    return {
      home() {
        let data = {};

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

            $("#imgInput").change(input => {
              let files = input.target.files;

              if (files && files[0]) {
                let reader = new FileReader();

                reader.onload = (ev) => {
                  $('#imgPreview').attr('src', ev.target.result)
                    .removeClass('hide');

                  post.img = event.target.result;
                };

                reader.readAsDataURL(files[0]);
              }
            });

            $("#btn-post").on("click", () => {
              post.text = $("#input-post").val();

              dataService.addPost(post)
              .then(() => {
                document.location = "#/";
              }).catch(err => {
                Materialize.toast(err.statusText, 3000, 'grey darken-1');
              });
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
      },
      myProfile() {
        console.log("My Profile");
      },
      myPictures() {
        console.log("My Pictures");
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
                    })
                    .then(() => dataService.users())
                    .then(usersResponse => {
                      let loggedUser = usersResponse.result.filter(u => u.username === user.username)[0];
                      $('.profile-picture')[0].src = './assets/images/' + loggedUser.picture;
                      $('.username')[0].innerHTML = loggedUser.username;

                      return templates.get("home");
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
                  Materialize.toast('You are already logged in!', 3000, 'grey darken-1');
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
                picture: 'default.jpg'
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
        });
      },
      messages() {
        let data = {};

        dataService.users()
        .then(usersResponse => {
          data = usersResponse;

          return templates.get("messages");
        })
        .then(templateHtml => {
          let templateFunc = Handlebars.compile(templateHtml);
          let html = templateFunc(data);
          $("#container").html(html);
        });
      },
    };
  }
};
