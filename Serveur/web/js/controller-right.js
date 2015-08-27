/*

Fichier de gestion du panel sur la droite

*/




/* Bouton activeAll */


var $btnAAOff = $("#btn-activeOnAll"),
	$btnAAOn = $("#btn-unactiveOnAll");


// Bouton "Activer sur tous"
$btnAAOff.click(function() {
	App.post("activePC", { ip: "all" });
	App.update();
});


// Bouton "Désactiver sur tous"
$btnAAOn.click(function() {
	App.post("unactivePC", { ip: "all" });
	App.update();
});


// Event: changer le boutton
App.addEventListener("set-activeAll", function(e) {

	$btnAAOff.hide();
	$btnAAOn.hide();

	if (e.message.value)
		$btnAAOn.css("display", "block");
	else
		$btnAAOff.css("display", "block");
});






/* Bouton sequences */

var $btnSeqOff = $("#btn-seqOff"),
	$btnSeqOn = $("#btn-seqOn"),
	$selectSeq = $("#select-seq");


// Bouton "Activer séquences"
$btnSeqOn.click(function() {

	App.cmd("seqOn", {
		value: true,
		seq: $selectSeq.val()
	});
});



// Bouton "Désactiver séqunces"
$btnSeqOff.click(function() {
	App.cmd("seqOn", { value: false });
});



// Event: changer le boutton
App.addEventListener("set-seqOn", function(e) {

	$btnSeqOn.hide();
	$btnSeqOff.hide();

	if (e.message.value)
		$btnSeqOff.css("display", "block");
	else
		$btnSeqOn.css("display", "block");
});
