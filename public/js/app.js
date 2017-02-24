/* globals Navigo controllers $ dataService document */

let router = new Navigo(null, true);

let controllersInstance = controllers.get(dataService, templates);

router
  .on("login", controllersInstance.login)
  .on("register", controllersInstance.register)
  .on("home", controllersInstance.home)
  .on("my-profile", controllersInstance.myProfile)
  .on("my-pictures", controllersInstance.myPictures)
  .on(() => {
    $("#main-nav .home a").addClass("active");
    router.navigate("/home");
  })
  .resolve();

dataService.isLoggedIn()
  .then(isLoggedIn => {
    if (isLoggedIn) {
      $(document.body).addClass("logged-in");
    }
  });

$(".btn-nav-logout").on("click", () => {
  dataService.logout()
    .then(() => {
      $(document.body).removeClass("logged-in");
    });
});

$("#main-nav").on("click", "li", function (ev) {
  $("#main-nav .active").removeClass("active");
  $(this).addClass("active");
});

$(function () {
  $("#main-nav .active").removeClass("active");
  let $currentPageNavButton = $(`#main-nav a[href="${window.location.hash}"]`).parents("li");
  $currentPageNavButton.addClass("active");
});

$(".button-collapse").sideNav({
  draggable: true
});

$(".dropdown-button").dropdown({ hover: false });

$(".side-nav.fixed").on("click", "li", function (ev) {
  $(".side-nav.fixed .active").removeClass("active");
  $(this).addClass("active");
});
