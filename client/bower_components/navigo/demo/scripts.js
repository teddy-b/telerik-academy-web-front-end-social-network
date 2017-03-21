'use strict';

var router;
var el = function el(sel) {
  return document.querySelector(sel);
};
var setContent = function setContent(id, content) {
  el('.js-content').innerHTML = content || el('#content-' + id).innerHTML;
};
var routing = function routing(mode) {
  router = new Navigo(null, mode === 'hash');
  router.on({
    'usage': function usage() {
      setContent('usage');
    },
    'download': function download() {
      setContent('download');
    },
    'about': function about() {
      setContent('about');
    },
    'this/*/:language/:what': function thisLanguageWhat(params) {
      var id = 'parameterized';
      var content = el('#content-' + id).innerHTML;

      Object.keys(params).forEach(function (key) {
        content = content.replace(new RegExp('{{' + key + '}}', 'g'), params[key]);
      });
      setContent(id, content);
    }
  });
  router.on(function () {
    setContent('about');
  });
  router.resolve();
};

var switchModes = function switchModes() {
  var trigger = el('.js-mode-trigger');
  var mode = 'history-api';
  var isLocalStorageSupported = !!window.localStorage;
  var rerenderTrigger = function rerenderTrigger(mode) {
    trigger.querySelector('input').checked = mode === 'hash';
  };

  if (isLocalStorageSupported) {
    mode = localStorage.getItem('navigo') || mode;
  }
  rerenderTrigger(mode);

  trigger.addEventListener('click', function () {
    mode = mode === 'history-api' ? 'hash' : 'history-api';
    isLocalStorageSupported && localStorage.setItem('navigo', mode);
    window.location.href = (router.root || '').replace('#', '');
    setTimeout(function () {
      window.location.reload(true);
    }, 200);
  });

  return mode;
};

var init = function init() {
  routing(switchModes());

  document.querySelector('#toDownload').addEventListener('click', function (e) {
    e.preventDefault();
    router.navigate('/download');
  });
};

window.onload = init;