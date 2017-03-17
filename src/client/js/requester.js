/* globals $ */

/* eslint-disable no-unused-vars */
let requester = {
  get(url) {
    return $.ajax({
      url,
      method: "GET"
    });
  },
  putJSON(url, body, options = {}) {
    let headers = options.headers || {};
    return $.ajax({
      url,
      headers,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify(body)
    });
  },
  postJSON(url, body, options = {}) {
    let headers = options.headers || {};
    return $.ajax({
      url,
      headers,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(body)
    });
  },
  getJSON(url) {
    return $.ajax({
      url,
      method: "GET",
      contentType: "application/json"
    });
  }
};
