/* globals $ document Navigo Controllers DataService Templates */

let router = new Navigo(null, true);

let controllersInstance = Controllers.get(DataService, Templates);

router
  .on("login", controllersInstance.login)
  .on("register", controllersInstance.register)
  .on("home", controllersInstance.home)
  .on("my-profile", controllersInstance.myProfile)
  .on("my-pictures", controllersInstance.myPictures)
  .on("messages", controllersInstance.messages)
  .on(() => DataService.isLoggedIn()
  .then(isLoggedIn => isLoggedIn ? router.navigate("/home") : router.navigate("/login")))
  .resolve();

DataService.isLoggedIn()
  .then(isLoggedIn => isLoggedIn && $(document.body).addClass("logged-in"));

$(".btn-nav-logout").on("click", () => {
  DataService.logout()
    .then(() => {
      $(document.body).removeClass("logged-in");
      router.navigate("/login");
    });
});

$(".button-collapse").sideNav({
  // closeOnClick: true,
  draggable: true
});

$(".dropdown-button").dropdown({ hover: false });

$(".side-nav.fixed").on("click", "li", (ev) => {
  $(".side-nav.fixed .active").removeClass("active");
  $(ev.currentTarget).addClass("active");
});

$(document).ready(() => {
  let username = localStorage.getItem("username");
  if (username) {
    DataService.user(username)
    .then(userResponse => {
      let loggedUser = userResponse.result;
      $(".profile-picture")[0].src = loggedUser.picture;
      $(".username")[0].innerHTML = loggedUser.username;
    });
  }
});
