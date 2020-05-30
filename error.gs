/**
 * error handling
 *
 * @param
 * .
 * @returns
 */
function handleErr(err, paragraphTextObj, start, end) {
    if (err === 'bookmark-orphan') {
      DocumentApp.getUi().alert( 'One of your bookmark on figure/table/section titles is not referenced anywhere.' +
        '\nThis may cause errors in auto-numbering.' +
        '\nThis figure/table/section title has been highlighed in red.'
      );
    } else if (err === 'link-short') {
      DocumentApp.getUi().alert( 'One of your bookmark reference is too short.' +
        '\nA reference to a bookmark needs to contain at least 3 characters.' +
        '\nThis reference has been highlighed in red.'
      );
    } else if (err === 'link-orphan') {
      DocumentApp.getUi().alert( 'One of your bookmark reference points to a non-existing bookmark.' +
        '\nThis may cause errors in auto-numbering.' +
        '\nThis reference has been highlighed in red.'
      );
    }

    addFlag(paragraphTextObj, start, end);
}

/**
 * highlight error text
 *
 * @param
 * .
 * @returns
 */
function addFlag(textObj, start, end) {
  var doc = DocumentApp.getActiveDocument();
  var position = doc.newPosition(textObj, start);

  if (end == null) {
    textObj.setForegroundColor(start, start+1, '#FF0000');
  } else if (start == 0 && end == 0) {
    textObj.setForegroundColor('#FF0000');
  } else {
    textObj.setForegroundColor(start, end, '#FF0000');
  }
  doc.setCursor(position);
}
