/* globals Navigo controllers $ dataService document */

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
    .then(() => $(document.body).removeClass("logged-in"));
});

$(".button-collapse").sideNav({ draggable: true });

$(".dropdown-button").dropdown({ hover: false });

$(".side-nav.fixed").on("click", "li", () => {
  $(".side-nav.fixed .active").removeClass("active");
  $(this).addClass("active");
});

$(document).ready(() => {
  let username = localStorage.getItem('username');
  username && dataService.users()
  .then(usersResponse => {
    let loggedUser = usersResponse.result.filter(u => u.username === username)[0];
    $('.profile-picture')[0].src = './assets/images/' + loggedUser.picture;
    $('.username')[0].innerHTML = loggedUser.username;
  });
});
