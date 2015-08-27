/*

Spe

*/




// Objet Spe

function SpeObj(name) {

	this.name = name;
	this.active = false;

	this.users = [];
	this.sequence = null;

}


SpeObj.prototype.toJSON = function() {
	return {
		name: this.name,
		active: this.active,
		users: this.users,
		sequence: this.sequence
	};
}



SpeObj.prototype.testForName = function(name) {

	for (var i = 0; i < this.users.length; i++) {

		if (globToRegexp(this.users[i]).test(name))
			return true;
	}

	return false;
}










// Objet SpeRunner

function SpeRunner(spe, socket) {

	if (!SequenceCreated[spe.sequence])
		return;


	var _this = this;

	this.isRunning = false;
	this.spe = spe;

	socket.runningSpe = this;



	var runner = new SequenceRunner(SequenceCreated[spe.sequence], socket);


	this.stop = function() {
		if (!_this.isRunning)  return;

		_this.isRunning = false;

		runner.stop();

		socket.onDisconnect = null;
		socket.runningSpe = null;


		if (!Sockets.allActive)
			Sockets.unactive(socket);
		
		else if (Affichages.current)
			Affichages.current.show(socket);


		if (_this.onStop)
			_this.onStop();
	}


	socket.onDisconnect = this.stop;
	runner.onStop = this.stop;

	this.isRunning = true;

}









// Namespace


var Spe = {};

var SpeCreated = {};

var RunningSpe = [];



// Créer une spécialité
Spe.create = function(name, infos) {

	var obj = new SpeObj(name);
	SpeCreated[name] = obj;


	infos = infos || {};

	for (var i in infos) {
		
		if (obj.hasOwnProperty(i))
			obj[i] = infos[i];
	}


	return obj;
}





// Suppression d'une spécialité
Spe.delete = function(name) {

	if (!SpeCreated[name])
		return;

	Spe.stopAllName(name);
	delete SpeCreated[name];
}





// Activer / Désactiver une spécialité
Spe.setActive = function(name, active) {

	if (!SpeCreated[name])
		return;

	SpeCreated[name].active = active;

	if (active) {

		for (var i in ConnectedSockets)
			Spe.runFor(ConnectedSockets[i]);

	} else {

		Spe.stopAllName(name);
	}
	
};





// Teste pour lancer une spécialité pour...
Spe.runFor = function(socket) {

	var name = socket.infos.nameUser;
	if (!name)  return;

	for (var i in SpeCreated) {

		if (!SpeCreated[i].active || !SpeCreated[i].testForName(name) || (socket.runningSpe && socket.runningSpe.spe.name == i))
			continue;

		Spe.run(i, socket);
		break;
	}
};





// Lancer une spécialité pour...
Spe.run = function(name, socket) {

	if (!SpeCreated[name])
		return;

	var runner = new SpeRunner(SpeCreated[name], socket);
	runner.onStop = function() {
		Spe.stop(runner);
	};

	RunningSpe.push(runner);
	console.log("Run spe: '" + name + "' pour '" + socket.infos.nameUser + "'");
};





// Arrêter les spécialité avec le nom...
Spe.stopAllName = function(name) {
	
	for (var i = 0, l = RunningSpe.length; i < l; i++) {

		if (RunningSpe[i].spe.name == name)
			RunningSpe[i].stop();
	}
};





// Arrêter une spécialité
Spe.stop = function(runner) {
	console.log("Stop spe: '" + runner.spe.name + "'");

	runner.stop();

	var i = RunningSpe.indexOf(runner);
	if (i != -1) 
		RunningSpe.splice(i, 1);
};








// Dès que quelqu'un se connecte, on regard son nom
SocketCmd.addEventListener("hadInfos", function(obj) {
	Spe.runFor(obj.message.socket);
});









// Listener: sauvegarde

Config.addEventListener("save", function() {

	Options.spe = {};

	for (var i in SpeCreated)
		Options.spe[i] = SpeCreated[i].toJSON();
});






// On ajoute les séquences existantes

for (var i in Options.spe) {

	var obj = Options.spe[i],
		spe = Spe.create(obj.name);

	spe.users = obj.users;
	spe.sequence = obj.sequence;
}










// Envoi les spécialités existantes
function ReturnSpe(res) {

	var arr = [];
	for (var i in SpeCreated)
		arr.push(SpeCreated[i].toJSON());

	res.send({ set: "Spe", value: arr });
}





// Commande: optient les speciatilés
Commandes['getSpe'] = function(req, res) {

	ReturnSpe(res);
};




// Commande: ajout d'une speciatilé
Commandes['addSpe'] = function(req, res) {

	var name = req.body.name;

	if (SpeCreated[name])
		return res.send({ error: "exist" });

	Spe.create(name, req.body);

	ReturnSpe(res);
};





// Commande: suppression d'une speciatilé
Commandes['deleteSpe'] = function(req, res) {

	var name = req.body.name;

	if (!SpeCreated[name])
		return res.send({ error: "name" });

	Spe.delete(name);

	ReturnSpe(res);
};






// Commande: activé speciatilé
Commandes['activeSpe'] = function(req, res) {

	var name = req.body.name,
		value = req.body.value;

	if (!SpeCreated[name])
		return res.send({ error: "name" });

	Spe.setActive(name, value == "true");

	ReturnSpe(res);
};






// Commande: définit les options d'une speciatilé
Commandes['setSpeOpt'] = function(req, res) {

	var name = req.body.name,
		users = req.body.users,
		seq = req.body.seq;

	if (!SpeCreated[name])
		return res.send({ error: "name" });


	SpeCreated[name].users = users.split(",");
	SpeCreated[name].sequence = (seq == 'empty') ? null : seq;

	ReturnSpe(res);
};