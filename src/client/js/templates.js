/* globals Requester */

/* eslint-disable no-unused-vars */
class Templates {
  static get(name) {
    let url = `client/templates/${name}.html`;
    return Requester.get(url);
  }
}
