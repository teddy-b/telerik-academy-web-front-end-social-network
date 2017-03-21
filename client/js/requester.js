"use strict";

/* globals $ */

/* eslint-disable no-unused-vars */
var requester = {
  get: function get(url) {
    return $.ajax({
      url: url,
      method: "GET"
    });
  },
  putJSON: function putJSON(url, body) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var headers = options.headers || {};
    return $.ajax({
      url: url,
      headers: headers,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify(body)
    });
  },
  postJSON: function postJSON(url, body) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var headers = options.headers || {};
    return $.ajax({
      url: url,
      headers: headers,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(body)
    });
  },
  getJSON: function getJSON(url) {
    return $.ajax({
      url: url,
      method: "GET",
      contentType: "application/json"
    });
  }
};