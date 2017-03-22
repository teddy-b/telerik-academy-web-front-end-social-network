"use strict";

/* globals requester */

/* eslint-disable no-unused-vars */
var templates = {
  get: function get(name) {
    var url = "/client/templates/" + name + ".html";
    return requester.get(url);
  }
};