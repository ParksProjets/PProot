/*

Page mobile

© Guillaume Gonnet

*/


var mainSeq = "Main";


// Mot de passe

var password = '';

$('#password input').change(function() {

	password = $(this).val();

	$('#password').hide();
	$('#list').show();

});




// Sélection d'une spe

var current = null;


$("#list > div:not(.main)").click(function() {

	$("#list").hide();
	current = $(this).find("h2").text();

	sendCmd("getSpe", {}, function(d) {

		updateValue(d);
		$("#button").show();

	});

});



// Activation/Désactivation d'une spe

$("#buttonOn").click(function() {
	setValue(true);
});


$("#buttonOff").click(function() {
	setValue(false);
});





// Boutton bloquage

$('.main').click(function() {

	current = "active-all-button";

	sendCmd("activeState", { ip: "all" }, function(d) {

		valueActiveAll(d);
		$("#button").show();
		
	});

});





// Affiche valeur du serveur

function updateValue(d) {

	for (var i = 0, l = d.value.length; i < l; i++) {

		if (d.value[i].name != current)
			continue;

		$("#buttonOn").hide();
		$("#buttonOff").hide();

		if (d.value[i].active)
			$("#buttonOff").show();
		else
			$("#buttonOn").show();

		break;
	};

}



function valueActiveAll(d) {

	$("#buttonOn").hide();
	$("#buttonOff").hide();

	if (d.value)
		$("#buttonOff").show();
	else
		$("#buttonOn").show();

}





// Envoye la valeur au serveur

function setValue(val) {

	if (!current)
		return;

	if (current == "active-all-button") {

		if (val) {
			sendCmd("seqOn", { value: true, seq: mainSeq }, valueActiveAll);
		}
		else {
			sendCmd("unactivePC", { ip: "all" }, valueActiveAll);
			sendCmd("seqOn", { value: false });
		}
		
		return;
	}

	sendCmd("activeSpe", {
		name: current,
		value: val
	}, updateValue);
}






// Envoye une commande

function sendCmd(cmd, params, success, error) {


	var data = "pwd=" + password;
	params.cmd = cmd;

	for (var i in params)
		data += "&" + i + "=" + params[i];


	function callError(msg) {
		if (error)
			error(msg);
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