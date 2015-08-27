/*

Séquences

*/


// jQuery
var $seqContainer = $("#sequences"),
	$seqAddPanel = $("#seqAddPanel"),
	$seqPanel = $("#seqPanel"),
	$seqPanelH3 = $seqPanel.find("h3 span"),
	$seqPanelText = $seqPanel.find("pre"),
	$cacheSeq = $("#cacheSeq");


var sequences = {};



// Update
App.addEventListener("set-Sequences", function(e) {
	
	var obj = e.message.value,
		seqOptions = [];

	var $exist = $seqContainer.children(),
		exists = {};

	$exist.each(function(index, element) {
		var el = $(element);

		if (el.attr("data-name"))
			exists[el.attr("data-name")] = el;
	});


	for (var i = 0; i < obj.length; i++) {

		var seq = obj[i];
		seqOptions.push('<option value="' + seq.name + '">' + seq.name + '</option>');

		if (!sequences[seq.name])
			sequences[seq.name] = { name: seq.name, cmds: [] };

		sequences[seq.name].cmds = seq.cmds;

		if (exists[seq.name]) {
			delete exists[seq.name];
			continue;
		}


		$div = $('<div data-name="' + seq.name + '">' + seq.name + '</div>');
		$div.click(onSeqClick);

		$seqContainer.prepend($div);
	}


	for (var i in exists) {
		exists[i].remove();
		delete sequences[i];
	}


	var $select = $('.selectSeq'),
		$options = $(seqOptions.join());

	$select.each(function() {
		var $this = $(this),
			select = $this.val();

		if (!$this.is(':focus')) {
			$this.empty().append($options.clone());

			if ($this.hasClass('firstEmpty'))
				$this.prepend('<option value="empty"></option>');

			if (select)
				$this.val(select);
		}
	});

});






// Hide

var currentSeq = null;


function seqFadeOut() {
	
	$cacheSeq.fadeOut();
	$seqAddPanel.fadeOut();
	$seqPanel.fadeOut();

	if (currentSeq)
		App.cmd("setSeqCmds", { name: currentSeq, cmds: $seqPanelText.text() });

	currentSeq = null;
}


$cacheSeq.click(seqFadeOut);






// Bouton d'ajout

$("#addSeqBtn").click(function() {

	$cacheSeq.fadeIn();
	$seqAddPanel.fadeIn();
});


$seqAddPanel.find("button").click(function() {
	App.cmd("addSequence", { name: $seqAddPanel.find("input").val() });
	seqFadeOut();
});





// Bouton suppression

$seqPanel.find(".delete").click(function() {
	App.cmd("deleteSequence", { name: currentSeq });
	currentSeq = null;
	seqFadeOut();
});






// Affichage d'une séquence

function onSeqClick() {

	var name = currentSeq = $(this).attr("data-name");
	$seqPanelH3.text(name);

	setSeqPanelTxt(sequences[name].cmds.join("\n"));


	$cacheSeq.fadeIn();
	$seqPanel.fadeIn();
}







// Coloration du texte

function setSeqPanelTxt(text) {


	text = text.replace(/"([^"\n]+)(["\n]?)/g, '<span style="color:#7977B0">"$1$2</span>');

	for (var i = 0; i < seqCmdWords.length; i++)
		text = text.replace(new RegExp('(\\b' + seqCmdWords[i] + '\\b)', 'g'), '<span style="color:#F06666">$1</span>');

	
	$seqPanelText.html(text);
}



$seqPanelText.bind("input", function(e) {

	var text = $(this).text();
	var caretPos = getCaretPosIn(this);

	setSeqPanelTxt(text);

	setCaretPosIn(this, caretPos);

}).keydown(function(e) {
	
	if (e.keyCode == 13) {
		var pos = getCaretPosIn(this);
		$seqPanelText.html($(this).text().splice(pos, 0, "\n"));
		setCaretPosIn(this, pos + 1);
	}

});