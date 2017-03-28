/* globals $ router Handlebars Materialize */

/* eslint-disable no-unused-vars */
class HomeController {
  static get(dataService, templates) {
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
      }
}
