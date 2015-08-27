/*

Fichier de gestion des PC

*/


// Variables jQuery

var $tablePc = $("#pc-list tbody"),
	$filtre = $("#pcFiltre");




// Events click

function onClickBtnRS(e) {
	App.post("cmd", { cmd: "quit", ip: e.data.ip + ':' + e.data.port });
	App.update();
}


function onClickBtnActive(e) {
	App.post("activePC", { ip: e.data.ip + ':' + e.data.port });
}


function onClickBtnUnActive(e) {
	App.post("unactivePC", { ip: e.data.ip + ':' + e.data.port });
}


function onClickBtnShutdown(e) {
	App.post("cmd", { cmd: "shutdown", ip: e.data.ip + ':' + e.data.port });
	App.update();
}






// Ajout d'un PC
App.addEventListener("new-pc", function(e) {

	console.log(e.message);

	var $elem = $('<tr data-ip="' + e.message.ip + ':' + e.message.port + '"></tr>');
	
	//$elem.append('<td>' + e.message.ip + '</td>');
	$elem.append('<td>' + e.message.port + '</td>');
	$elem.append('<td>' + e.message.namePC + '</td>');
	$elem.append('<td class="nameUser">' + e.message.nameUser + '</td>');


	var $btnRS = $('<button class="btn">RS</button>'),
		$btnActive = $('<button class="btn btn-Ac">Activer</button>'),
		$btnUnActive = $('<button class="btn btn-red btn-UnAc">Désactiver</button>'),
		$btnShutDown = $('<button class="btn">Shutdown</button>'),
		$td = $('<td></td>');


	$btnRS.click(e.message, onClickBtnRS);
	$btnActive.click(e.message, onClickBtnActive);
	$btnUnActive.click(e.message, onClickBtnUnActive).hide();
	$btnShutDown.click(e.message, onClickBtnShutdown);


	$td.append([ $btnActive, $btnUnActive, $btnRS, $btnShutDown ]);

	$elem.append($td);
	$tablePc.append($elem);

});


App.addEventListener("stop-updateList", function() {
	filtrePC();
});





// Suppression d'un PC
App.addEventListener("delete-pc", function(e) {

	$elem = $tablePc.find('tr[data-ip="'+ e.message.ip + ':' + e.message.port + '"]');
	$elem.remove();

});




// Cangement "nameUser"
App.addEventListener("set-nameUser", function(e) {
	var $elem = $tablePc.find('tr[data-ip="'+ e.message.ip + '"]');
	$elem.find(".nameUser").text(e.message.value);
});




// Changement "active"
App.addEventListener("set-active", function(e) {

	var $elem = $tablePc.find('tr[data-ip="'+ e.message.ip + '"]');
	
	var $btnAc = $elem.find(".btn-Ac").hide(),
		$btnUnAc = $elem.find(".btn-UnAc").hide();

	if (e.message.value)
		$btnUnAc.show();
	else
		$btnAc.show();
});






// Filtre

$filtre.bind("propertychange keyup input paste", function() {
	filtrePC();
});


function filtrePC(filtre) {

	if (!filtre)
		filtre = $filtre.val().trim().toLowerCase();


	$tablePc.find("tr").each(function() {

		var $this = $(this),
			searchs = [ "td:eq(0)", "td:eq(1)", "td:eq(2)" ],
			ok = false;

		for (var i = 0; i < searchs.length; i++)
			ok |= ($this.find(searchs[i]).text().toLowerCase().search(filtre) != -1);

		if (ok)
			$this.show();
		else
			$this.hide();
	});

}