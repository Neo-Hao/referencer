/**
 * auto-number headings
 *
 * @param: textOjb - a text object
 *         newText - string
 *         start - int, where the old text starts
 *         end - int, where the old text ends
 * .
 * @returns
 */
const heading1 = DocumentApp.ParagraphHeading.HEADING1;
const heading2 = DocumentApp.ParagraphHeading.HEADING2;
const heading3 = DocumentApp.ParagraphHeading.HEADING3;
const heading4 = DocumentApp.ParagraphHeading.HEADING4;
const heading5 = DocumentApp.ParagraphHeading.HEADING5;
const heading6 = DocumentApp.ParagraphHeading.HEADING6;
const headingTypes = new Set([heading1, heading2, heading3, heading4, heading5, heading6]);


/**
 * update one heading reference: (1) auto number the bookmark, (2) update the text/url of ALL reference to the bookmark
 *
 * @param: bookmarkObj - bookmarkObj
 *         bookmarkObjs - an array of bookmarkObj
 *         paragraphMap - Map
 *         bookmarkMap - Map
 * .
 * @returns
 */
function updateHeadingReference(bookmarkObj, bookmarkObjs, paragraphMap, bookmarkMap) {
  // add new bookmark and get its new url
  bookmarkObj.bookmark = setBookmark(bookmarkObj.paragraph);
  var url = '#bookmark=' + bookmarkObj.bookmark.getId();

  // update bookmark link (both text and link)
  var adjustment = 0;
  for (var [parKey, linkObj] of bookmarkObj.linkMap.entries()) {
    adjustment = updateHeadingTextLink(linkObj.paraTextObj, bookmarkObj, linkObj.start, linkObj.end, url);

    // update positions of sequential reference links in the same paragraph
    adjustPositions(bookmarkObjs, paragraphMap, bookmarkMap, parKey, bookmarkObj.bookmarkId, adjustment);
  }
}


/**
 * update the text/url of a heading
 * depending on whether it is auto-numbered, updates are different
 *
 * @param: textObj - Text
 *         bookmarkObj - bookmarkObj
 *         start - number
 *         end - number
 *         url - string
 * .
 * @returns
 */
function updateHeadingTextLink(textObj, bookmarkObj, start, end, url) {
  var adjustment = 0;

  if (needNumbered(bookmarkObj.paragraph) == 0) {
    adjustment = updateLinkText(textObj, 'Section titled ' + bookmarkObj.paragraph.getText(), start, end, url);
  } else {
    adjustment = updateLinkText(textObj, 'Section ' + bookmarkObj.paragraph.getText().split(' ')[0], start, end, url);
  }

  return adjustment;
}


/**
 * return the number string for a heading paragraph object
 *
 * @param {Element} a heading paragraph object
 * .
 * @returns a string with number and dots - e.g., 1.1.1
 *
 */
function numberHeadings() {
  var headingPars = getHeadings();

  for (var i = 0; i < headingPars.length; i++) {
    var parObj = headingPars[i];
    var numberStr = getNumberStr(parObj);

    var start = 0;
    var end = needNumbered(parObj.paragraph);

    if (end == 0) {
      parObj.paragraph.insertText(0, numberStr);
    } else {
      updateText(parObj.paragraph.editAsText(), numberStr, start, end);
    }
  }

}

/**
 * return an array of heading paragraph objects
 *
 * @param:
 * .
 * @returns {Array}         Array of objects, vis
 *                              {paragraphObj,
 *                               heading,
 *                               numHeading1,
 *                               numHeading2,
 *                               numHeading3,
 *                               numHeading4,
 *                               numHeading5,
 *                               numHeading6
 *                               }
 */
function getHeadings() {
  var ps = DocumentApp.getActiveDocument().getBody();
  var searchType = DocumentApp.ElementType.PARAGRAPH;
  var searchResult = null;
  var results = [];

  var numHeading1 = 0;
  var numHeading2 = 0;
  var numHeading3 = 0;
  var numHeading4 = 0;
  var numHeading5 = 0;
  var numHeading6 = 0;

  while (searchResult = ps.findElement(searchType, searchResult)) {
    var par = searchResult.getElement().asParagraph();
    var h = par.getHeading()
    if (headingTypes.has(h) && par.getNumChildren() > 0) {
      parObj = {};
      parObj.paragraph = par;
      parObj.heading = h;

      if (h === heading1) {
        numHeading1++;
        numHeading2 = 0;
        numHeading3 = 0;
        numHeading4 = 0;
        numHeading5 = 0;
        numHeading6 = 0;
      }

      if (h == heading2) {
        numHeading2++;
        numHeading3 = 0;
        numHeading4 = 0;
        numHeading5 = 0;
        numHeading6 = 0;
      }

      if (h == heading3) {
        numHeading3++;
        numHeading4 = 0;
        numHeading5 = 0;
        numHeading6 = 0;
      }

      if (h == heading4) {
        numHeading4++;
        numHeading5 = 0;
        numHeading6 = 0;
      }

      if (h == heading5) {
        numHeading5++;
        numHeading6 = 0;
      }

      if (h == heading6) {
        numHeading6++;
      }

      parObj.heading1 = numHeading1;
      parObj.heading2 = numHeading2;
      parObj.heading3 = numHeading3;
      parObj.heading4 = numHeading4;
      parObj.heading5 = numHeading5;
      parObj.heading6 = numHeading6;

      results.push(parObj);
    }
  }

  return results;
}


/**
 * return the number string for a heading paragraph object
 *
 * @param {Element} a heading paragraph object
 * .
 * @returns a string with number and dots - e.g., 1.1.1
 *
 */
function getNumberStr(parObj) {
  var result = '' + parObj.heading1;

  if (parObj.heading2 != 0) {
    result += '.' + parObj.heading2;
  }

  if (parObj.heading3 != 0) {
    result += '.' + parObj.heading3;
  }

  if (parObj.heading4 != 0) {
    result += '.' + parObj.heading4;
  }

  if (parObj.heading5 != 0) {
    result += '.' + parObj.heading5;
  }

  if (parObj.heading6 != 0) {
    result += '.' + parObj.heading6;
  }  

  return result + ' ';
}


/**
 * return the number string for a heading paragraph object
 *
 * @param {Element} a heading paragraph object
 * .
 * @returns a boolean - whether the number string has already been added
 *
 */
function needNumbered(paraObj) {
  var text = paraObj.getText().split(' ')[0];
  start = text.search(/[0-9]+[.]{0,1}[0-9]*/);
  if (start != -1) return text.length;
  return 0;
}


/**
 * return the number string for a heading paragraph object
 *
 * @param {Element} a url string of heading
 * .
 * @returns a string - heading ID
 *
 */
function getSectionNumber(url) {
  var headingId = url.split('#')[1].split('=')[1];
  return headingId;
}
