/**
 * update one reference that doesn't belong to any special types
 * the update only involves creating and linking to a new Bookmark
 *
 * @param: bookmarkObj - bookmarkObj
 *         bookmarkObjs - an array of bookmarkObj
 *         paragraphMap - Map
 *         bookmarkMap - Map
 * .
 * @returns
 */
function updateOtherReference(bookmarkObj, bookmarkObjs, paragraphMap, bookmarkMap) {
  if (bookmarkObj.paragraph != null) {
    // add new bookmark and get its new url
    bookmarkObj.bookmark = setBookmark(bookmarkObj.paragraph);
    var url = '#bookmark=' + bookmarkObj.bookmark.getId();

    // update bookmark link (both text and link)
    for (var [parKey, linkObj] of bookmarkObj.linkMap.entries()) {
      linkObj.paraTextObj.setLinkUrl(linkObj.start, linkObj.end, url);
    }
  }
}
