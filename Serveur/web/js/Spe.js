/*

Spe

*/


// jQuery
var $speContainer = $("#spe"),
	$cacheSpe = $("#cacheSpe"),

	$speAddPanel = $("#speAddPanel"),

	$spePanel = $("#spePanel"),
	$spePanelH3 = $spePanel.find("h3 span"),
	$spePanelUsers = $spePanel.find(".p-edit"),
	$spePanelSelect = $spePanel.find("select");


var specialites = {};



// Update
App.addEventListener("set-Spe", function(e) {
	var obj = e.message.value;

	var $exist = $speContainer.children(),
		exists = {};

	$exist.each(function(index, element) {
		var el = $(element);

		if (el.attr("data-name"))
			exists[el.attr("data-name")] = el;
	});


	for (var i = 0; i < obj.length; i++) {

		var spe = obj[i];

		if (!specialites[spe.name])
			specialites[spe.name] = { name: spe.name, active: false, users: [], seq: null };


		specialites[spe.name].active = spe.active;
		specialites[spe.name].users = spe.users;
		specialites[spe.name].seq = spe.sequence;


		if (exists[spe.name]) {
			
			if (spe.active)
				exists[spe.name].addClass('active');
			else
				exists[spe.name].removeClass('active');

			delete exists[spe.name];
			continue;
		}


		var $btn = $('<i class="edit">&#xe600;</i>'),
			$p = $ ('<p>' + spe.name + '</p>'),
			$div = $('<div data-name="' + spe.name + '"></div>');

		$btn.click(onSpeClick);
		$div.click(switchSpe);

		$speContainer.prepend($div.append([ $btn, $p ]));
	}


	for (var i in exists) {
		exists[i].remove();
		delete specialites[i];
	}

});





// Hide

var currentSpe = null;

function speFadeOut() {
	
	$cacheSpe.fadeOut();
	$speAddPanel.fadeOut();
	$spePanel.fadeOut();

	if (currentSpe)
		App.cmd("setSpeOpt", {
			name: currentSpe,
			users: $spePanelUsers.pedit(),
			seq: $spePanelSelect.val()
		});


	currentSpe = null;
}


$cacheSpe.click(speFadeOut);






// Bouton d'ajout

$("#addSpeBtn").click(function() {
	$cacheSpe.fadeIn();
	$speAddPanel.fadeIn();
});


$speAddPanel.find("button").click(function() {
	App.cmd("addSpe", { name: $speAddPanel.find("input").val() });
	speFadeOut();
});





// Bouton suppression

$spePanel.find(".delete").click(function() {
	App.cmd("deleteSpe", { name: currentSpe });
	currentSpe = null;
	speFadeOut();
});





// Affichage d'une spécialité

function onSpeClick(e) {

	e.stopPropagation();

	var name = currentSpe = $(this).parent().attr("data-name");
	$spePanelH3.text(name);

	$spePanelUsers.pedit(specialites[name].users.join(" "));
	$spePanelSelect.val(specialites[name].seq || 'empty');

	$cacheSpe.fadeIn();
	$spePanel.fadeIn();
}





// Activation d'sactivation

function switchSpe(e) {

	App.cmd("activeSpe", {
		name: $(this).attr("data-name"),
		value: !$(this).hasClass('active')
	});
}

