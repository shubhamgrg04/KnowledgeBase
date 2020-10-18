"use strict";

chrome.contextMenus.create({
  title: "Highlight This",
  onclick: highlightTextFromContext,
  contexts: ["selection"],
});

function highlightText() {
  chrome.tabs.executeScript({ file: "scripts/highlight.js" });
}

// function removeHighlights() {
//   chrome.tabs.executeScript({ file: "contentScripts/removeHighlights.js" });
// }

function highlightTextFromContext() {
  highlightText();
}
