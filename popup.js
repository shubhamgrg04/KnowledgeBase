"use strict";

// var backgroundPage = chrome.extension.getBackgroundPage();

// var highlightsListEl = document.getElementById("highlights-list");
// (function getHighlights() {
//   chrome.tabs.executeScript({ file: "scripts/getHighlights.js" }, (results) => {
//     if (!results || !Array.isArray(results) || results.length == 0) return;
//     if (results[0].length == 0) {
//       return;
//     }

//     var highlights = results[0];

//     // Clear previous list elements, but only if there is at least one otherwise leave the "empty" message
//     highlightsListEl.innerHTML = "";

//     // Populate with new elements
//     for (var i = 0; i < highlights.length; i += 2) {
//       var newEl = document.createElement("li");
//       newEl.innerText = highlights[i + 1];
//       let highlightId = highlights[i];
//       newEl.addEventListener("click", (e) => {
//         backgroundPage.showHighlight(highlightId);
//       });
//       highlightsListEl.appendChild(newEl);
//     }
//   });
// })();
