/*

Page de config

© Guillaume Gonnet

*/



// Mot de passe

var password = '';

$('#password').change(function() {

	password = $(this).val();
});






// Changement d'un switch

function changeSwitch(d) {

	if (!d.name || d.val === undefined)
		return;

	$button = $('button[data-name="' + d.name + '"]');

	if ($button.attr("data-type") != "switch")
		return;

	$span = $button.parent().find('span');
	$span.attr('class', '');


	if (d.val)
		$span.attr('class', 'on').text('Oui');
	else
		$span.attr('class', 'off').text('Non');

}






// Quand on appuye sur un bouton

$("button").each(function() {

	var type = $(this).attr("data-type");


	if (type == "switch") {

		var $parent = $(this).parent(),
			name = $(this).attr("data-name");

		$(this).click(function() {
			
			if ($parent.find(".on").length)
				sendCmd("changeConfig", { name: name, type: 'bool', value: false }, changeSwitch);
			else
				sendCmd("changeConfig", { name: name, type: 'bool', value: true }, changeSwitch);
		});

	}


});






// Envoye une commande au serveur

function sendCmd(cmd, params, success, error) {

	var data = "pwd=" + password;
	params.cmd = cmd;

	for (var i in params)
		data += "&" + i + "=" + params[i];


	function callError(msg) {

		error && error(msg);
	}


	$.ajax({
		url: "cmd",
		method: "post",
		data: data,

		success: function(d) {

			if (d.error)
				return callError(d.error);

			if (success)
				success(d);
		},

		error: function(d) {
			callError("connect");
		}
	});

}