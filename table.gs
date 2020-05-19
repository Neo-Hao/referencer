/**
 * update one table reference: (1) auto number the bookmark, (2) update the text/url of ALL reference to the bookmark
 *
 * @param: bookmarkObj - bookmarkObj
 *         tableNumber - number
 *         bookmarkObjs - an array of bookmarkObj
 *         paragraphMap - Map
 *         bookmarkMap - Map
 * .
 * @returns
 */
function updateTableReference(bookmarkObj, tableNumber, bookmarkObjs, paragraphMap, bookmarkMap) {
  // update text of bookmark
  updateTableBookmarkText(bookmarkObj.paragraph.editAsText(), tableNumber);

  // add new bookmark and get its new url
  bookmarkObj.bookmark = setBookmark(bookmarkObj.paragraph);
  var url = '#bookmark=' + bookmarkObj.bookmark.getId();

  // update bookmark link (both text and link)
  var adjustment = 0;
  for (var [parKey, linkObj] of bookmarkObj.linkMap.entries()) {
    adjustment = updateLinkText(linkObj.paraTextObj, 'Table ' + tableNumber, linkObj.start, linkObj.end, url);

    // update positions of sequential reference links in the same paragraph
    adjustPositions(bookmarkObjs, paragraphMap, bookmarkMap, parKey, bookmarkObj.bookmarkId, adjustment);
  }
}


/**
 * auto number the table title
 *
 * @param: textOjb - this should be the paragraph that contains the Bookmark
 *                   Note: A paragraph as such should be table titles.
 *         num - the number of the table title
 * .
 * @returns
 */
function updateTableBookmarkText(textOjb, num) {
  var start, end;
  var flag = true;
  var text = textOjb.getText();

  Logger.log(text);

  // if starting with table xxx
  start = text.search(/[tT]able\s*[0-9]+\./);
  if (start != -1) {
//    Logger.log('Case 1: ' + text);
    end = text.split('.')[0].length;
    updateText(textOjb, 'Table ' + num + '.', start, end);
    flag = false;
    return;
  }

  // if starting with table xxx (no period)
  start = text.search(/[tT]able\s+[0-9]+\s+/);
  if (start != -1) {
//    Logger.log('Case 2: ' + text);
    textArr = text.split(' ');
    end = textArr[0].length + textArr[1].length;
    updateText(textOjb, 'Table ' + num + '.', start, end);
    flag = false;
    return;
  }

  // if starting with tablexxx (no period)
  start = text.search(/[tT]able[0-9]+\s+/);
  if (start != -1) {
//    Logger.log('Case 3: ' + text);
    textArr = text.split(' ');
    end = textArr[0].length;
    updateText(textOjb, 'Table ' + num + '. ', start, end);
    flag = false;
    return;
  }

  // if not any of the above case  - insertion
  if (flag) {
//    Logger.log('Case 4: ' + text);
    start = 0;
    textOjb.insertText(start, 'Table ' + num + '. ');
    return;
  }
}
