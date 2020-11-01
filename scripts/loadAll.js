"use strict";

$(document).ready(function () {
  loadAll({
    hostName: window.location.hostname,
    pathName: window.location.pathname,
    href: window.location.href,
    title: document.title,
  });
});
