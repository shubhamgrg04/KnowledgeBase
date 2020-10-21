"use strict";

(() => {
  const selectedText = getSelection().toString();
  const newUrl = new URL(location);
  newUrl.hash = `:~:text=${encodeURIComponent(selectedText)}`;
  window.open(newUrl);
})();
