/*

Fichier App

*/



var App = {};

EventDispatcher.prototype.apply( App );



// Stocke le mot de passe
App.password = '';



// Post sur le serveur
App.post = function(url, params, success, error) {

	var data = "pwd=" + App.password;
	params = params || {};

	for (var i in params)
		data += "&" + i + "=" + params[i];


	function callError(msg) {
		if (error)
			error(msg);
	}


	$.ajax({
		url: url,
		method: "post",
		data: data,

		success: function(d) {

			if (d.error)
				return callError(d.error);

			if (d.success)
				App.dispatchEvent({ type: 'success-' + d.success });

			if (d.set)
				App.dispatchEvent({ type: 'set-' + d.set, message: { ip: d.ip || "all", value: d.value } });

			if (success)
				success(d);
		},

		error: function(d) {
			callError("connect");
		}
	});

};




// Post une commande
App.cmd = function(cmd, params, success, error) {
	params.cmd = cmd;
	App.post("cmd", params, success, error);
}





// Liste des PC
App.list = {};



// Met à jour la liste
App.update = function(success, error) {

	App.dispatchEvent({ type: 'start-updateList' });


	App.post("/getList", null, function(d) {

		App.checkList(d.list);

		delete d.list;

		for (var i in d)
			App.dispatchEvent({ type: 'set-' + i, message: { value: d[i] } });


		App.dispatchEvent({ type: 'stop-updateList' });

		if (success)
			success(d);

	},

	function(msg) {
		
		App.dispatchEvent({ type: 'stop-updateList' });

		if (error)
			error(msg);

	});

};




// Vérifie la liste
App.checkList = function(newList) {


	for (var i in App.list) {

		if (newList[i])  continue;

		var obj = App.list[i];

		delete App.list[i];
		App.dispatchEvent({ type: 'delete-pc', message: obj });
	}


	for (var i in newList) {

		var nl = newList[i];

		// Le PC esiste déja
		if (App.list[i]) {

			var al = App.list[i];

			for (var j in nl) {
				if (nl[j] == al[j])  continue;

				al[j] = nl[j];
				App.dispatchEvent({ type: 'set-' + j, message: { ip: i, value: nl[j] } });
			}

			continue;
		};



		// Nouveau PC
		var nl = App.list[i] = newList[i];
		
		App.dispatchEvent({ type: 'new-pc', message: nl });

		for (var j in nl)
			App.dispatchEvent({ type: 'set-' + j, message: { ip: i, value: nl[j] } });
	}

};





// Timer pour la mise à jour

App.timer = null;

App.interval = 10000;


App.startTimer = function() {
	App.timer = setInterval(App.update, App.interval);
}


App.stopTimer = function() {
	clearInterval(App.timer);
	App.timer = null;
}