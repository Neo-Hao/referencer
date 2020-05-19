/**
 * update one figure reference: (1) auto number the bookmark, (2) update the text/url of ALL reference to the bookmark
 *
 * @param: bookmarkObj - bookmarkObj
 *         figureNumber - number
 *         bookmarkObjs - an array of bookmarkObj
 *         paragraphMap - Map
 *         bookmarkMap - Map
 * .
 * @returns
 */
function updateFigureReference(bookmarkObj, figureNumber, bookmarkObjs, paragraphMap, bookmarkMap) {
  // update text of bookmark
  updateFigureBookmarkText(bookmarkObj.paragraph.editAsText(), figureNumber);

  // add new bookmark and get its new url
  bookmarkObj.bookmark = setBookmark(bookmarkObj.paragraph);
  var url = '#bookmark=' + bookmarkObj.bookmark.getId();

  // update bookmark link (both text and link)
  var adjustment = 0;
  for (var [parKey, linkObj] of bookmarkObj.linkMap.entries()) {
    adjustment = updateLinkText(linkObj.paraTextObj, 'Figure ' + figureNumber, linkObj.start, linkObj.end, url);

    // update positions of sequential reference links in the same paragraph
    adjustPositions(bookmarkObjs, paragraphMap, bookmarkMap, parKey, bookmarkObj.bookmarkId, adjustment);
  }
}


/**
 * auto number the figure title
 *
 * @param: textOjb - this should be the paragraph that contains the Bookmark
 *                   Note: A paragraph as such should be figure titles.
 *         num - the number of the figure title
 * .
 * @returns
 */
function updateFigureBookmarkText(textOjb, num) {
  var start, end;
  var flag = true;
  var text = textOjb.getText();

  // if starting with figure xxx
  start = text.search(/[fF]igure\s*[0-9]+\./);
  if (start != -1) {
    end = text.split('.')[0].length;
    updateText(textOjb, 'Figure ' + num + '.', start, end);
    flag = false;
    return;
  }

  // if starting with figure xxx (no period)
  start = text.search(/[fF]igure\s+[0-9]+\s+/);
  if (start != -1) {
    textArr = text.split(' ');
    end = textArr[0].length + textArr[1].length;
    updateText(textOjb, 'Figure ' + num + '.', start, end);
    flag = false;
    return;
  }

  // if starting with figurexxx (no period)
  start = text.search(/[fF]igure[0-9]+\s+/);
  if (start != -1) {
    textArr = text.split(' ');
    end = textArr[0].length;
    updateText(textOjb, 'Figure ' + num + '. ', start, end);
    flag = false;
    return;
  }

  // if not any of the above case  - insertion
  if (flag) {
    start = 0;
    textOjb.insertText(start, 'Figure ' + num + '. ');
    return;
  }
}
