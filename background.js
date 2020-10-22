"use strict";

firebase.initializeApp({
  apiKey: config.FIREBASE_API_KEY,
  projectId: config.FIREBASE_PROJECT_ID,
});
var db = firebase.firestore();

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    title: "Highlight",
    onclick: highlightTextFromContext,
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    title: "Cite",
    onclick: citeTextFromContext,
    contexts: ["selection"],
  });
});

function highlightText() {
  chrome.tabs.executeScript({ file: "scripts/highlight.js" });
}

function citeText() {
  chrome.tabs.executeScript({ file: "scripts/cite.js" });
  var options = {
    type: "basic",
    iconUrl:
      "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png",
    title: "Primary Title",
    message: "Primary message to display",
  };
  chrome.notifications.create(options);
}

function removeHighlights() {
  chrome.tabs.executeScript({ file: "contentScripts/removeHighlights.js" });
}

function highlightTextFromContext() {
  highlightText();
}

function citeTextFromContext() {
  citeText();
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.action) {
    case "addHighlight":
      const payload = request.payload;
      if (!payload) return;
      addHighlight(payload);
      // return true to use sendResponse asynchronously
      return true;
    case "getHighlights":
      const url = request.payload;
      getHighlights(url, sendResponse);
      return true;
  }
  return;
});

async function addHighlight(payload) {
  const highlight = {
    anchorNode: payload.anchorNode,
    anchorOffset: payload.anchorOffset,
    container: payload.container,
    focusNode: payload.focusNode,
    focusOffset: payload.focusOffset,
    string: payload.string,
    tags: ["lite", "dark"],
  };
  var docRef = db
    .collection("highlights")
    .doc(payload.url.replaceAll("/", "|"));
  var doc = await docRef.get();

  // add highlight if url already
  // constains hightlights, else
  // create a new doc
  if (doc.exists) {
    await docRef.update({
      selections: firebase.firestore.FieldValue.arrayUnion(
        JSON.stringify(highlight)
      ),
    });
  } else {
    await docRef.set({
      selections: [JSON.stringify(highlight)],
    });
  }
}

async function getHighlights(url, sendResponse) {
  var docRef = db.collection("highlights").doc(url.replaceAll("/", "|"));
  console.log(url.replaceAll("/", "|"));
  var doc = await docRef.get();
  console.log(doc);
  if (doc.exists) {
    console.log(doc.data());
    sendResponse(doc.data());
  } else {
    sendResponse({ selections: [] });
  }
}
