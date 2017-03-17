/* globals requester */

/* eslint-disable no-unused-vars */
let templates = {
  get: name => {
    let url = `/templates/${name}.html`;
    return requester.get(url);
  }
};
