"use strict";

var STORE_FORMAT_VERSION = chrome.runtime.getManifest().version;

function store(selection, container, url, domain, color, callback) {
  const data = {
    version: STORE_FORMAT_VERSION,
    url: url,
    domain: domain,
    string: selection.toString(),
    container: getQuery(container),
    anchorNode: getQuery(selection.anchorNode),
    anchorOffset: selection.anchorOffset,
    focusNode: getQuery(selection.focusNode),
    focusOffset: selection.focusOffset,
    color: color,
  };
  chrome.runtime.sendMessage({ action: "addHighlight", payload: data });
  if (callback) callback(0);
}

function loadAll(webpage) {
  chrome.runtime.sendMessage(
    { action: "getHighlights", payload: webpage },
    (result) => {
      let selections = result.selections;
      for (let i = 0; selections && i < selections.length; i++) {
        load(JSON.parse(selections[i]), i);
      }
    }
  );
}

function load(highlightVal, highlightIndex, noErrorTracking) {
  // noErrorTracking is optional
  const selection = {
    anchorNode: elementFromQuery(highlightVal.anchorNode),
    anchorOffset: highlightVal.anchorOffset,
    focusNode: elementFromQuery(highlightVal.focusNode),
    focusOffset: highlightVal.focusOffset,
  };

  const selectionString = highlightVal.string;
  const container = elementFromQuery(highlightVal.container);
  const color = highlightVal.color;

  if (!selection.anchorNode || !selection.focusNode || !container) {
    if (!noErrorTracking) {
      addHighlightError(highlightVal, highlightIndex);
    }
    return false;
  } else {
    const success = highlight(
      selectionString,
      container,
      selection,
      "yellow",
      highlightIndex
    );
    if (!noErrorTracking && !success) {
      addHighlightError(highlightVal, highlightIndex);
    }
    return success;
  }
}

function clearPage(url) {
  chrome.storage.local.get({ highlights: {} }, (result) => {
    const highlights = result.highlights;
    delete highlights[url];
    chrome.storage.local.set({ highlights });
  });
}

function elementFromQuery(storedQuery) {
  const re = />textNode:nth-of-type\(([0-9]+)\)$/i;
  const result = re.exec(storedQuery);

  if (result) {
    // For text nodes, nth-of-type needs to be handled differently (not a valid CSS selector)
    const textNodeIndex = parseInt(result[1]);
    storedQuery = storedQuery.replace(re, "");
    const parent = $(storedQuery)[0];
    if (!parent) return undefined;
    return parent.childNodes[textNodeIndex];
  } else {
    return $(storedQuery)[0];
  }
}

// From an DOM element, get a query to that DOM element
function getQuery(element) {
  if (element.id) return "#" + escapeCSSString(element.id);
  if (element.localName === "html") return "html";

  const parent = element.parentNode;

  let index;
  const parentSelector = getQuery(parent);
  // The element is a text node
  if (!element.localName) {
    // Find the index of the text node:
    index = Array.prototype.indexOf.call(parent.childNodes, element);

    return parentSelector + ">textNode:nth-of-type(" + index + ")";
  } else {
    const jEl = $(element);
    index = jEl.index(parentSelector + ">" + element.localName) + 1;
    return (
      parentSelector + ">" + element.localName + ":nth-of-type(" + index + ")"
    );
  }
}

// Colons and spaces are accepted in IDs in HTML but not in CSS syntax
// Similar (but much more simplified) to the CSS.escape() working draft
function escapeCSSString(cssString) {
  return cssString.replace(/(:)/g, "\\$1");
}
