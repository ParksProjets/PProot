/*

Affichages

*/


var $views = $(".views"),
	$cachePanel = $("#cachePanel");


var Affichages = {};

Affichages.current = "none";


Affichages.set = function(name, send) {

	$views.filter('[data-name="' + Affichages.current + '"]').removeClass('active');

	if (!name || name == "none") {
		Affichages.current = null;
		return;
	}
	
	$views.filter('[data-name="' + name + '"]').addClass('active');
	Affichages.current = name;
}



$views.click(function() {

	var name = $(this).attr("data-name");
	
	if (name == Affichages.current)
		name = "none";

	Affichages.set(name);
	App.post("setAffichage", { aff: name });

});


App.addEventListener("set-affichage", function(d) {
	Affichages.set(d.message.value);
});






// Panels

$views.find(".edit").click(function(e) {

	e.stopPropagation();

	var name = $(this).parent().attr("data-name"),
		$panel = $('.panel[data-name="' + name + '"]');


	$cachePanel.fadeIn();
	$panel.fadeIn();

});



$cachePanel.click(function() {

	var $panels = $('.panel:visible');

	$panels.fadeOut();
	$cachePanel.fadeOut();

});