/*

Serveur TCP

*/



var net = require('net');



var tcp = net.createServer(function(sock) {

	var ip = sock.remoteAddress + ":" + sock.remotePort;
	console.log("TCP " + ip + " s'est connecté");

	sock.setEncoding("utf8");



	// On ajoute le socket à la liste des sockets
	var socketObj = {
		type: "tcp",
		socket: sock,
		ip: sock.remoteAddress,
		port: sock.remotePort,
		active: false,
		infos: {
			nameUser: 'Inconnu',
			namePC: 'Inconnu'
		},
		runningSpe: null
	};

	ConnectedSockets[ip] = socketObj;




	// Quand on reçoi des données
	sock.on("data", function(text) {

		try {
			var obj = JSON.parse(text);
		} catch(e) {
			console.error("TCP " + ip + " erreur parse JSON");
			return;
		}

		SocketCmd.call(obj.type, socketObj, obj);
	});




	// Quand l y a une errreur
	sock.on("error", function(err) {
		console.log(err.stack);
	});




	// Quand le client se déconnecte
	sock.on('close', function() {
		console.log("TCP " + ip + " s'est déconnecté");

		SocketCmd.dispatchEvent({ type: "disconnect", message: socketObj });

		if (socketObj.onDisconnect)
			socketObj.onDisconnect();

		delete ConnectedSockets[ip];
	});



	SocketCmd.dispatchEvent({ type: "connect", message: socketObj });

});



// On ouvre le serveur TCP
tcp.listen(Config.tcpPort, Config.ip, function() {
	console.log('Serveur TCP lancé !');
});
