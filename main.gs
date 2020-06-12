/**
 * Runs when the add-on is installed.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE.)
 */
function onInstall(e) {
  onOpen(e);
}


/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
function onOpen(e) {
  DocumentApp.getUi()
    .createAddonMenu()
    .addItem('Auto-number headings', 'updateHeadings')
    .addSeparator()
    .addItem('Update references', 'updateReference')
    .addItem('Remove references', 'removeReference')
    .addSeparator()
    .addItem('Help', 'getHelp')
    .addToUi();
}


/**
 * update all reference and auto number automatically
 * reference include: heading, figure, and table
 *
 * @param
 * .
 * @returns
 */
function updateReference() {
  // get all link objs
  var links = getAllBookmarkLinks(DocumentApp.getActiveDocument().getBody(), 1);
  // get bookmark objs
  var bookmarkObjs = getBookmarkObjs(links);
  Logger.log(bookmarkObjs);

  // check error
  if (bookmarkObjs === 'error') {
    return 'error';
  }

  // get paragraph map
  var paragraphMap = getParagraphMap(links);
  // get bookmark map
  var bookmarkMap = getBookmarkMap(bookmarkObjs);

  // remove all bookmark - this has to be done on ALL bookmarks; otherwise odd errors would occur
  for (var i = 0; i < bookmarkObjs.length; i++) {
    bookmarkObjs[i].bookmark.remove();
  }

  // prepare for auto number
  var figureNumber = 0;
  var tableNumber = 0;


  for (var i = 0; i < bookmarkObjs.length; i++) {
    var bookmarkObj = bookmarkObjs[i];

    if (bookmarkObj.type == 'heading') {
      updateHeadingReference(bookmarkObj, bookmarkObjs, paragraphMap, bookmarkMap);
    } else if (bookmarkObj.type == 'figure') {
      figureNumber++;
      updateFigureReference(bookmarkObj, figureNumber, bookmarkObjs, paragraphMap, bookmarkMap);
    } else if (bookmarkObj.type == 'table') {
      tableNumber++;
      updateTableReference(bookmarkObj, tableNumber, bookmarkObjs, paragraphMap, bookmarkMap);
    } else {
      updateOtherReference(bookmarkObj, bookmarkObjs, paragraphMap, bookmarkMap);
    }
  }
}


/**
 * remove all references.
 * reference include: heading, figure, and table
 *
 * @param
 * .
 * @returns
 */
function removeReference() {
  // get all link objs
  var links = getAllBookmarkLinks(DocumentApp.getActiveDocument().getBody(), 1);
  // get bookmark objs
  var bookmarkObjs = getBookmarkObjs(links);

  // check error
  if (bookmarkObjs === 'error') {
    return 'error';
  }

  for (var i = 0; i < bookmarkObjs.length; i++) {
    var bookmarkObj = bookmarkObjs[i];

    if (bookmarkObj.type == 'heading' || bookmarkObj.type == 'figure'  || bookmarkObj.type == 'table') {
      // remove the bookmark
      bookmarkObj.bookmark.remove();

      // remove references to the bookmark
      for (var [parKey, linkObj] of bookmarkObj.linkMap.entries()) {
        linkObj.paraTextObj.setLinkUrl(linkObj.start, linkObj.end, '');
      }
    }
  }
}


/**
 * auto-number heading bookmarks.
 * dealing with the scenario when section titles have been referenced using bookmarks before auto-numbering
 *
 * @param
 * .
 * @returns
 */
function updateHeadings() {

  // get all link objs
  var links = getAllBookmarkLinks(DocumentApp.getActiveDocument().getBody(), 1);
  // get bookmark objs
  var bookmarkObjs = getBookmarkObjs(links);

  // check error
  if (bookmarkObjs === 'error') {
    return 'error';
  }

  // get paragraph map
  var paragraphMap = getParagraphMap(links);
  // get bookmark map
  var bookmarkMap = getBookmarkMap(bookmarkObjs);

  // filter to just heading bookmarks
  var headingObjs = bookmarkObjs.filter(function getOther(bookmarkOjb) {
    if (bookmarkOjb.type === 'heading') { return true; }
    else { return false; }
  });

  // remove heading bookmarks
  for (var i = 0; i < headingObjs.length; i++) {
    headingObjs[i].bookmark.remove();
  }

  // auto-number headings
  numberHeadings();

  // update heading bookmarks
  for (var i = 0; i < headingObjs.length; i++) {
    updateHeadingReference(headingObjs[i], bookmarkObjs, paragraphMap, bookmarkMap);
  }
}
