/*

Serveur WebSocket

*/


var WebSocketServer = require('websocket').server;



var wsServer = new WebSocketServer({
	
	httpServer: server,

	autoAcceptConnections: true
});




wsServer.on('connect', function(connection) {
	
	
	var sock = connection.socket,
		ip = sock.remoteAddress + ":" + sock.remotePort;

	console.log("WebSocket " + ip + " s'est connecté");


	// On ajoute la connexion à la liste des sockets
	var socketObj = {
		type: "websocket",
		connection: connection,
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
	connection.on('message', function(message) {
		
		if (message.type !== 'utf8') {
			console.error("WebSocket " + ip + " non utf8 message");
			return;
		}

		
		try {
			var obj = JSON.parse(message.utf8Data);
		} catch(e) {
			console.error("WebSocket " + ip + " erreur parse JSON");
			return;
		}


		SocketCmd.call(obj.type, socketObj, obj);
	});



	// Quand le client se déconnecte
	connection.on('close', function(reasonCode, description) {
		console.log("WebSocket " + ip + " s'est déconnecté");

		SocketCmd.dispatchEvent({ type: "disconnect", message: socketObj });

		if (socketObj.onDisconnect)
			socketObj.onDisconnect();

		delete ConnectedSockets[ip];
	});



	SocketCmd.dispatchEvent({ type: "connect", message: socketObj });

});