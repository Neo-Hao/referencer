/**
 * Get a map representing the linkage between a paragraph and linkObj inside it
 * The goal of this method is to facilitate searchng for the next linkObj in the same paragraph
 * @param {Element} an array of link obj.
 * .
 * @returns <key, val>         key: string - paragraph text
 *                             val: array - a list of bookmarkIDs
 */
function getParagraphMap(links) {
  links = links || getAllBookmarkLinks(DocumentApp.getActiveDocument().getBody(), 1);

  // prepare paragraphs
  var paragraphMap = new Map();
  for (var i = 0; i < links.length; i++) {
    var key = links[i].paraTextObj.getText();
    if (paragraphMap.has(key)) {
      paragraphMap.get(key).push(links[i].bookmarkId);
    } else {
      paragraphMap.set(key, [links[i].bookmarkId]);
    }
  }

  return paragraphMap;
}


/**
 * Get a map representing the linkage between a bookmarkId and its index in bookmarkObjs
 * The goal of this method is to facilitate accessing a bookmarkObj given a bookmarkId
 * @param {Element} element The document element to operate on.
 * .
 * @returns <key, val>         key: string - bookmarkId
 *                             val: number - index of the bookmarkObj that has bookmarkId
 */
function getBookmarkMap(bookmarkObjs) {
  // prepare bookmark maps
  var bookmarkMap = new Map();
  for (var i = 0; i < bookmarkObjs.length; i++) {
    bookmarkMap.set(bookmarkObjs[i].bookmarkId, i);
  }

  return bookmarkMap;
}



/**
 * Get an array of all bookmark Objs that are sorted by the appearance order of its first reference link.
 * The function is recursive, and if no element is provided, it will default to
 * the active document's Body element.
 *
 * @param {Array}           Array of link Objs
 * .
 * @returns {Array}         Array of objects, vis
 *                              {bookmark: Bookmark
 *                               bookmarkParagraph: Paragraph
 *                               bookmarkId: number
 *                               position: Position
 *                               type: string
 *                               linkMap: <key, val>
 *                                        key: string - paragraph text
 *                                        val: array - a list of linkObjs
 *                               }
 */
function getBookmarkObjs(links) {
  // prepare link objs
  links = links || getAllBookmarkLinks(DocumentApp.getActiveDocument().getBody(), 1);

  // prepare bookmark objs
  var bks = DocumentApp.getActiveDocument().getBookmarks();
  var bookmarkObjs = [];
  var n = bks.length;
  for (var i = 0; i < n; i++) {
    var bookmarkObj = {};
    bookmarkObj.bookmark = bks[i];
    bookmarkObj.position = bookmarkObj.bookmark.getPosition();
    bookmarkObj.bookmarkId = bookmarkObj.bookmark.getId();
    bookmarkObj.paragraph = getBookmarkParagraph(bookmarkObj.bookmark);
    bookmarkObj.type = getObjType(bookmarkObj.paragraph);
    bookmarkObj.linkMap = new Map();

    bookmarkObjs.push(bookmarkObj);
  }

  // link the two objs: bookmarkOjb and linkObjs
  for (var i = 0; i < links.length; i++) {
    link = links[i];
    for (var j = 0; j < bookmarkObjs.length; j++) {
      var bookmarkObj = bookmarkObjs[j];
      if (link.bookmarkId === bookmarkObj.bookmarkId) {
        // map
        var key = link.paraTextObj.getText();
        bookmarkObj.linkMap.set(key, link);

      }
    }
  }

  // filter out the bookmarks that have no referencing in the doc
  bookmarkObjs = bookmarkObjs.filter(function getNonEmpty(bookmarkOjb) {
    if (bookmarkOjb.linkMap.size > 0) { return true; }
    else { return false; }
  });


  // sort the obj to return
  bookmarkObjs.sort(function(a, b) {
    return getBookmarkLinkNum(a) - getBookmarkLinkNum(b);
  });

  return bookmarkObjs;
}


/**
 * Get an array of all link Objs that are naturally sorted by the appearance order of its first reference link.
 * The function is recursive, and if no element is provided, it will default to
 * the active document's Body element.
 *
 * @param {element, num} element - The document element to operate on.
 *                       num - number
 * .
 * @returns {Array}         Array of objects, vis
 *                              {paraTextObj: Text
 *                               url: string
 *                               start: number,
 *                               end: number,
 *                               bookmarkId: string
 *                               number: number
 *                               }
 */
function getAllBookmarkLinks(element, num) {
  var links = [];
  element = element || DocumentApp.getActiveDocument().getBody();

  if (element.getType() === DocumentApp.ElementType.TEXT) {
    var textObj = element.editAsText();
    var text = element.getText();
    var inUrl = false;
    for (var ch=0; ch < text.length; ch++) {
      var url = textObj.getLinkUrl(ch);
      if (url != null && ch != text.length-1) {
        if (!inUrl) {
          // We are now!
          inUrl = true;
          var curUrl = {};
          curUrl.paraTextObj = element;
          curUrl.url = String( url ); // grab a copy
          curUrl.start = ch;
          if (curUrl.url.includes('#bookmark')) {
            curUrl.bookmarkId = curUrl['url'].split('=')[1];
            curUrl.number = num;
          }
        }
        else {
          curUrl.end = ch;
        }
      }
      else {
        if (inUrl) {
          // Not any more, we're not.
          inUrl = false;
          // add only bookmarks
          if (curUrl.hasOwnProperty('bookmarkId')) {
            links.push(curUrl);
            num++;
          }
          curUrl = {};
        }
      }
    }
  }
  else {
    // Get number of child elements, for elements that can have child elements.
    try {
      var numChildren = element.getNumChildren();
    }
    catch (e) {
      numChildren = 0;
    }

    // recursion
    for (var i=0; i<numChildren; i++) {
      links = links.concat(getAllBookmarkLinks(element.getChild(i), num+1));
      num++;
    }
  }

  return links;
}


/**
 * Get the number for a bookmark from its associated link(s).
 *
 * @param {bookmarkObj}
 * .
 * @returns number - number
 *
 */
function getBookmarkLinkNum(bookmarkObj) {
  var num = Number.MAX_SAFE_INTEGER;
  for (var [parKey, link] of bookmarkObj.linkMap.entries()) {
    if (link.number < num) {
      num = link.number;
    }
  }
  return num;
}

/**
 * get the type of a given text object (table, figure, heading, or other)
 *     Supportive function of getBookmarkObjs
 *
 * @param: paragraphOjb - Text
 * @returns: type - string
 */
function getObjType(paragraphOjb) {
  var prevObj = paragraphOjb.getNextSibling();
  var nextObj = paragraphOjb.getPreviousSibling();

  if (headingTypes.has(paragraphOjb.getHeading()) && paragraphOjb.getNumChildren() > 0) {
    return 'heading';
  } else if ((prevObj && prevObj.getType() == DocumentApp.ElementType.TABLE) || (nextObj && nextObj.getType() == DocumentApp.ElementType.TABLE)) {
    return 'table';
  } else if ((prevObj && prevObj.getNumChildren() > 0 && prevObj.getChild(0).getType() == DocumentApp.ElementType.INLINE_IMAGE) ||
             (nextObj && nextObj.getNumChildren() > 0 && nextObj.getChild(0).getType() == DocumentApp.ElementType.INLINE_IMAGE)) {
    return 'figure';
  } else if ((prevObj && prevObj.getNumChildren() > 0 && prevObj.getChild(0).getType() == DocumentApp.ElementType.INLINE_DRAWING) ||
             (nextObj && nextObj.getNumChildren() > 0 && nextObj.getChild(0).getType() == DocumentApp.ElementType.INLINE_DRAWING)) {
    return 'figure';
  } else {
    return 'other';
  }
}


/**
 * get the Paragraph Objs that contain bookmarks
 *     Supportive function of getBookmarkObjs
 *
 * @param: bookmark - Bookmark
 * .
 * @returns: par - Paragraph
 */
function getBookmarkParagraph(bookmark) {
  var par = bookmark.getPosition().getElement().asParagraph();

  return par;
}


/**
 * add new bookmark to a Text at the given position
 *
 * @param: textObj - Text
 *         position - Position
 * .
 * @returns: Bookmark
 */
function setBookmark(textOjb, position) {
  var position = position || DocumentApp.getActiveDocument().newPosition(textOjb, 0);
  bookmark = position.insertBookmark();
  return bookmark;
}


/**
 * given a link identified by bookmarkId, update all sequential link Obj's start/end by adjustment
 *
 * @param: bookmarkObjs - array of bookmarkObj
 *         paragraphMap - Map
 *         bookmarkMap - Map
 *         parKey - string, a key of paragraphMap
 *         bookmarkId - string, the bookmarkId of the current link Obj
 *         adjustment - number, position adjustment
 * .
 * @returns:
 */
function adjustPositions(bookmarkObjs, paragraphMap, bookmarkMap, parKey, bookmarkId, adjustment){
  var bookmarkIdsSameParagraph = paragraphMap.get(parKey);
  var nextLinkIndex = bookmarkIdsSameParagraph.indexOf(bookmarkId) + 1;
  var linksLength = bookmarkIdsSameParagraph.length;

  if (adjustment === 0 || nextLinkIndex >= linksLength) {return;}

  while (nextLinkIndex < linksLength) {
    // get next bookmarkId
    var nextId = bookmarkIdsSameParagraph[nextLinkIndex];
    // get next linkObj
    var nextLinkObj = bookmarkObjs[bookmarkMap.get(nextId)].linkMap.get(parKey);
    // make adjustment
    nextLinkObj.start += adjustment;
    nextLinkObj.end += adjustment;
    // increment
    nextLinkIndex++;
  }
}
