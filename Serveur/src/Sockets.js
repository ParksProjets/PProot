/*

Objet Sockets

*/




var ConnectedSockets = {};

var Sockets = {};



Sockets.allActive = false;





Sockets.send = function(socket, data) {
	
	if (typeof data == "object")
		data = JSON.stringify(data);


	if (socket.type == "websocket")
		socket.connection.sendUTF(data);

	else if (socket.type == "tcp")
		socket.socket.write(data);
}





Sockets.sendAll = function(data) {
	
	for (var i in ConnectedSockets) {

		if (!ConnectedSockets[i].runningSpe || Config.overrideSpe)
			Sockets.send(ConnectedSockets[i], data);
	}
}





Sockets.sendFor = function(sockets, data) {
	
	if (sockets === "all") {
		Sockets.sendAll(data);
		return;
	}

	if (!(sockets instanceof Array))
		sockets = [ sockets ];

	for (var i = 0; i < sockets.length; i++)
		Sockets.send(sockets[i], data);
}






// Active un PC
Sockets.active = function(socket) {
	
	Sockets.send(socket, { type: "startFS" });
	socket.active = true;

	if (Affichages.current)
		Affichages.current.show(socket);
};




// Desactive un PC
Sockets.unactive = function(socket) {
	
	Sockets.send(socket, { type: "stopFS" });
	socket.active = false;
};




// Active tous les PC
Sockets.activeAll = function() {
	
	for (var i in ConnectedSockets) {
		
		if (!ConnectedSockets[i].runningSpe || Config.overrideSpe)
			Sockets.active(ConnectedSockets[i]);
	}

	Sockets.allActive = true;
};




// Desactive tous les PC
Sockets.unactiveAll = function() {
	
	for (var i in ConnectedSockets) {

		if (!ConnectedSockets[i].runningSpe || Config.overrideSpe)
			Sockets.unactive(ConnectedSockets[i]);
	}

	Sockets.allActive = false;
};




// Eteint un PC
Sockets.shutdown = function(socket) {
	
	Sockets.send(socket, { type: "shutdown" });
};






// Définit la vue des PC
Sockets.setView = function(view, sockets) {
	sockets = sockets || "all";
	Sockets.sendFor(sockets, { type: "GMoption", option: "setView", view: view });
}



// Envoi une commande à la vue
Sockets.viewCmd = function(type, obj, sockets) {

	if (obj instanceof Array) {
		sockets = obj;
		obj = {};
	}

	obj = obj || {};
	var cmd = extend({ type: "GMoption", option: "viewOption", viewOption: type }, obj);

	if (sockets)
		Sockets.sendFor(sockets, cmd);
	else
		Sockets.sendAll(cmd);
}