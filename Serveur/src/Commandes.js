/*

Commandes utilisables par URL

*/




var Commandes = {};


Commandes.call = function(name, req, res) {

	if (req.param('pwd') != Config.mdp) {
		res.send({ error: "password" });
		return;
	}

	if (Commandes[name])
		Commandes[name](req, res);
	else
		res.send({ error: "commande" });
}






// Envoi une commandes à un PC
Commandes['cmdToOne'] = function(req, res) {
	
	var ip = req.param('ip');

	if (!ConnectedSockets[ip])
		return res.send({ error: "ip" });

	delete req.body.pwd;
	delete req.body.cmd;
	delete req.body.ip;
		
	Sockets.send(ConnectedSockets[ip], req.body);
	res.send({ success: "cmdToOne", ip: ip });
};





// Envoi une commande à tous
Commandes['cmdToAll'] = function(req, res) {

	delete req.body.pwd;
	delete req.body.cmd;
		
	Sockets.sendAll(req.body);
	res.send({ success: "cmdToAll", ip: "all" });
};







// Obtient la liste des pc connectés
Commandes['getList'] = function(req, res) {
	
	var list = {};

	for (var i in ConnectedSockets) {
		
		var socket = ConnectedSockets[i];

		list[i] = {
			ip: socket.ip,
			port: socket.port,
			nameUser: socket.infos.nameUser,
			namePC: socket.infos.namePC,
			active: socket.active
		};
	}


	var obj = {
		list: list,
		activeAll: Sockets.allActive,
		seqOn: Sequence.active,
		unlockedUsers: Options.unlockedUsers,
		affichage: Affichages.current ? Affichages.current.name : "none"
	};

	
	for (var i = 0; i < Affichages.ElemsWithOps.length; i++)
		obj[ "AFF" + Affichages.ElemsWithOps[i].name ] = Affichages.ElemsWithOps[i].getOptions();


	obj.Spe = [];
	for (var i in SpeCreated)
		obj.Spe.push(SpeCreated[i].toJSON());


	obj.Sequences = [];
	for (var i in SequenceCreated)
		obj.Sequences.push(SequenceCreated[i].toJSON());


	res.send(obj);
};





// Obtient l'état d'un PC
Commandes['activeState'] = function(req, res) {

	var ip = req.param('ip');

	if (ip == "all")
		res.send({ set: "activeAll", ip: "all", value: Sockets.allActive });

	else if (ConnectedSockets[ip])
		res.send({ set: "active", ip: ip, value: ConnectedSockets[ip].active });

	else
		res.send({ error: "ip" });
};




// Active un PC
Commandes['activePC'] = function(req, res) {

	var ip = req.param('ip');

	if (ip == "all") {
		
		Sockets.activeAll();
		res.send({ set: "activeAll", ip: "all", value: true });
	}

	else if (ConnectedSockets[ip]) {
		
		Sockets.active(ConnectedSockets[ip]);
		res.send({ set: "active", ip: ip, value: true });
	}

	else {
		res.send({ error: "ip" });
	}
};






// Désactive un PC
Commandes['unactivePC'] = function(req, res) {

	var ip = req.param('ip');

	if (ip == "all") {
		
		Sockets.unactiveAll();
		res.send({ set: "activeAll", ip: "all", value: false });
	}

	else if (ConnectedSockets[ip]) {
		
		Sockets.unactive(ConnectedSockets[ip]);
		res.send({ set: "active", ip: ip, value: false });
	}

	else {
		res.send({ error: "ip" });
	}
};






// Eteint un ordi
Commandes['shutdown'] = function(req, res) {

	var ip = req.param('ip');

	if (!ConnectedSockets[ip])
		return res.send({ error: "ip" });
		
	Sockets.shutdown(ConnectedSockets[ip]);
	res.send({ success: "shutdown", ip: ip });
};



// Quitter
Commandes['quit'] = function(req, res) {
	
	var ip = req.param('ip');

	if (!ConnectedSockets[ip])
		return res.send({ error: "ip" });
	
	Sockets.send(ConnectedSockets[ip], { type: "quit" });
	res.send({ success: "quit", ip: ip });
};









/* Users débloquées */


Commandes['setUnlockedUsers'] = function(req, res) {
	
	Options.unlockedUsers = req.body.users.split(",");

	res.send({ set: "unlockedUsers", value: Options.unlockedUsers });
};






/* Config */

var CmdConfigCallbacks = {};


Commandes['changeConfig'] = function(req, res) {
	
	var name = req.body.name,
		value = req.body.value,
		type = req.body.type;


	if (!Config.hasOwnProperty(name))
		return res.send({ error: 'name' });

	if (type == 'bool')
		value = value == 'true';

	Config[name] = value;

	if (CmdConfigCallbacks[name])
		CmdConfigCallbacks[name](value);

	res.send({ success: 'changeConfig', name: name, val: value });
};



CmdConfigCallbacks['mustDelete'] = function(val) {

	if (!val) return;

	for (var i in SpeCreated)
		Spe.setActive(i, false);

	Sequence.stopAll();

	Sockets.sendAll({ type: "quit" });
};