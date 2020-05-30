/**
 * update the text of textOjb to newText
 *
 * @param: textOjb - a text object
 *         newText - string
 *         start - int, where the old text starts
 *         end - int, where the old text ends
 * .
 * @returns
 */
function updateText(textObj, newText, start, end) {
  textObj.deleteText(start, end)
  textObj.insertText(start, newText);
}

function updateText2(textObj, newText) {
  textObj.setText(newText);
}


/**
 * update the text of textOjb to newText, and add url to the newText
 *
 * @param: textOjb - a text object
 *         newText - string
 *         start - int, where the old text starts
 *         end - int, where the old text ends
 *         url - str, link
 * .
 * @returns
 */
function updateLinkText(textObj, newText, start, end, url) {
//  Logger.log('start: ' + start);
//  Logger.log('end: ' + end);

  textObj.deleteText(start, end)
  textObj.insertText(start, newText);
  textObj.setLinkUrl(start, start + newText.length - 1, url);

  return start + newText.length - 1 - end;
}
