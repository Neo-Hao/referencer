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
  textObj.deleteText(start, end)
  textObj.insertText(start, newText);
  textObj.setLinkUrl(start, start + newText.length - 1, url);
}
