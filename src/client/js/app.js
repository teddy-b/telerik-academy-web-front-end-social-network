/* globals $ document Navigo controllers dataService templates */

let router = new Navigo(null, true);

let controllersInstance = controllers.get(dataService, templates);

router
  .on("login", controllersInstance.login)
  .on("register", controllersInstance.register)
  .on("home", controllersInstance.home)
  .on("my-profile", controllersInstance.myProfile)
  .on("my-pictures", controllersInstance.myPictures)
  .on("messages", controllersInstance.messages)
  .on(() => dataService.isLoggedIn()
  .then(isLoggedIn => isLoggedIn ? router.navigate("/home") : router.navigate("/login")))
  .resolve();

dataService.isLoggedIn()
  .then(isLoggedIn => isLoggedIn && $(document.body).addClass("logged-in"));

$(".btn-nav-logout").on("click", () => {
  dataService.logout()
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
    dataService.user(username)
    .then(userResponse => {
      let loggedUser = userResponse.result;
      $(".profile-picture")[0].src = loggedUser.picture;
      $(".username")[0].innerHTML = loggedUser.username;
    });
  }
});
