/*

SocketCmd

*/


var SocketCmd = {};

EventDispatcher.prototype.apply( SocketCmd );


SocketCmd.call = function(name, socket, obj) {

	if (SocketCmd[name])
		SocketCmd[name](socket, obj);
};




// Mesaages

SocketCmd.wrSockets = {};


SocketCmd.addWRFor = function(socket, callback) {

	if (!SocketCmd.wrSockets[socket])
		SocketCmd.wrSockets[socket] = callback;
}

SocketCmd.removeWRFor = function(socket) {

	if (SocketCmd.wrSockets[socket])
		delete SocketCmd.wrSockets[socket];
}


SocketCmd.msg = function(socket, obj) {

	if (SocketCmd.wrSockets[socket])
		SocketCmd.wrSockets[socket](obj.text);

};





// Dés qu'un client se connecte
SocketCmd.addEventListener("connect", function(obj) {

	var socket = obj.message;

	// On active le PC (si besoin)
	if (Sockets.allActive) {
		Sockets.active(socket);

		if (Affichages.current)
			Affichages.current.show(socket);
	}


});







SocketCmd['infos'] = function(socket, obj) {

	delete obj.type;
	Sockets.unactive(socket);


	for (var i in obj)
		socket.infos[i] = obj[i];


	if (Options.unlockedUsers.indexOf(socket.infos.nameUser) != -1)
		Sockets.unactive(socket);

	else if (Sockets.allActive) {
		Sockets.active(socket);

		if (Affichages.current)
			Affichages.current.show(socket);
	}


	SocketCmd.dispatchEvent({ type: "hadInfos", message: { socket: socket, infos: obj } });

};





SocketCmd['stopFS'] = function(socket, obj) {

	socket.active = false;
};


