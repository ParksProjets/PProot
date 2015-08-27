/*

Fonctions utiles

*/


String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
};



// Retourne la position du curseur
function getCaretPosIn(elem) {

	var range = window.getSelection().getRangeAt(0),
		preCaretRange = range.cloneRange();

	preCaretRange.selectNodeContents(elem);
	preCaretRange.setEnd(range.endContainer, range.endOffset);

	return preCaretRange.toString().length;
}



// Définit la position du curseur
function setCaretPosIn(elem, pos) {
	setSelectionRange(elem, pos, pos);
}



// Obtient les Text Node d'un élément
function getTextNodesIn(node) {
	
	if (node.nodeType == 3)
		return [ node ];


	var children = node.childNodes,
		textNodes = [];

	for (var i = 0, len = children.length; i < len; ++i)
		textNodes.push.apply(textNodes, getTextNodesIn(children[i]));

	return textNodes;
}



// Définit la sélection
function setSelectionRange(el, start, end) {
	
	var range = document.createRange();
	range.selectNodeContents(el);
	var textNodes = getTextNodesIn(el);
	var foundStart = false;
	var charCount = 0, endCharCount;

	for (var i = 0, textNode; textNode = textNodes[i++]; ) {
		endCharCount = charCount + textNode.length;
		if (!foundStart && start >= charCount && start <= endCharCount) {
			range.setStart(textNode, start - charCount);
			foundStart = true;
		}
		if (foundStart && end <= endCharCount) {
			range.setEnd(textNode, end - charCount);
			break;
		}
		charCount = endCharCount;
	}

	var sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
}