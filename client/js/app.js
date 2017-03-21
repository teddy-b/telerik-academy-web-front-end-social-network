"use strict";

/* globals $ document Navigo controllers dataService templates */

var router = new Navigo(null, true);

var controllersInstance = controllers.get(dataService, templates);

router.on("login", controllersInstance.login).on("register", controllersInstance.register).on("home", controllersInstance.home).on("my-profile", controllersInstance.myProfile).on("my-pictures", controllersInstance.myPictures).on("messages", controllersInstance.messages).on(function () {
  return dataService.isLoggedIn().then(function (isLoggedIn) {
    return isLoggedIn ? router.navigate("/home") : router.navigate("/login");
  });
}).resolve();

dataService.isLoggedIn().then(function (isLoggedIn) {
  return isLoggedIn && $(document.body).addClass("logged-in");
});

$(".btn-nav-logout").on("click", function () {
  dataService.logout().then(function () {
    $(document.body).removeClass("logged-in");
    router.navigate("/login");
  });
});

$(".button-collapse").sideNav({
  // closeOnClick: true,
  draggable: true
});

$(".dropdown-button").dropdown({ hover: false });

$(".side-nav.fixed").on("click", "li", function (ev) {
  $(".side-nav.fixed .active").removeClass("active");
  $(ev.currentTarget).addClass("active");
});

$(document).ready(function () {
  var username = localStorage.getItem("username");
  if (username) {
    dataService.user(username).then(function (userResponse) {
      var loggedUser = userResponse.result;
      $(".profile-picture")[0].src = "./assets/images/" + loggedUser.picture;
      $(".username")[0].innerHTML = loggedUser.username;
    });
  }
});