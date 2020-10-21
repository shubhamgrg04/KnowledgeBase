"use strict";

firebase.initializeApp({
  apiKey: config.FIREBASE_API_KEY,
  projectId: config.FIREBASE_PROJECT_ID,
});
var db = firebase.firestore();
db.settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
});
db.enablePersistence();

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    title: "Highlight This",
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

// function removeHighlights() {
//   chrome.tabs.executeScript({ file: "contentScripts/removeHighlights.js" });
// }

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
      db.collection("highlights")
        .doc(payload.url.replaceAll("/", "|"))
        .update({
          selections: firebase.firestore.FieldValue.arrayUnion(
            JSON.stringify({
              anchorNode: payload.anchorNode,
              anchorOffset: payload.anchorOffset,
              container: payload.container,
              focusNode: payload.focusNode,
              focusOffset: payload.focusOffset,
              string: payload.string,
              tags: ["lite", "dark"],
            })
          ),
        })
        .then(function () {
          console.log("Document successfully written!");
        })
        .catch(function (error) {
          console.error("Error writing document: ", error);
        });
      console.log(payload);
      return true;
    case "getHighlights":
      const url = request.payload;
      console.log(url.replaceAll("/", "|"));
      var docRef = db.collection("highlights").doc(url.replaceAll("/", "|"));
      docRef
        .get()
        .then(function (doc) {
          if (doc.exists) {
            console.log("Document data:", doc.data());
            sendResponse(doc.data());
          } else {
            // doc.data() will be undefined in this case
            sendResponse(doc.data());
            console.log("No such document!");
          }
        })
        .catch(function (error) {
          console.log("Error getting document:", error);
        });
      return true;
    // db.collection("highlights")
    //   .get()
    //   .then(function (querySnapshot) {
    //     querySnapshot.forEach(function (doc) {
    //       // doc.data() is never undefined for query doc snapshots
    //       console.log(doc.id, " => ", doc.data());
    //     });
    //   });
  }
  return;
});
