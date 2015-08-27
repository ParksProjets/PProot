/*

Fichier de gestion du panel en haut

*/



// Variables jQuery

var $inputUnlock = $("#input-userUnlokck"),
	$inputSpe = $("#input-userSpe"),
	$btnReloadTime = $("#input-reloadTime");



// Input edit
$(".p-edit").pedit({});




// Reaload time

$btnReloadTime.change(function() {
	
	if (!$(this).val())
		return;

	App.stopTimer();
	App.interval = parseInt($(this).val()) * 1000;
	App.startTimer();
});





// Utilisateurs débloquéées

$inputUnlock.change(function(e) {
	App.cmd("setUnlockedUsers", { users: e.elements.join(",") });
});


App.addEventListener("set-unlockedUsers", function(e) {

	if (!$inputUnlock.is(":focus"))
		$inputUnlock.pedit(e.message.value.join(" "));
});
