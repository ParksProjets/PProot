/**
 * @author mrdoob / http://mrdoob.com/
 */

var EventDispatcher = function () {}

EventDispatcher.prototype = {

	constructor: EventDispatcher,

	apply: function ( object ) {

		object.addEventListener = EventDispatcher.prototype.addEventListener;
		object.hasEventListener = EventDispatcher.prototype.hasEventListener;
		object.removeEventListener = EventDispatcher.prototype.removeEventListener;
		object.dispatchEvent = EventDispatcher.prototype.dispatchEvent;

	},

	addEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) this._listeners = {};

		var listeners = this._listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );

		}

	},

	hasEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return false;

		var listeners = this._listeners;

		if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {

			return true;

		}

		return false;

	},

	removeEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var listenerArray = listeners[ type ];

		if ( listenerArray !== undefined ) {

			var index = listenerArray.indexOf( listener );

			if ( index !== - 1 ) {

				listenerArray.splice( index, 1 );

			}

		}

	},

	dispatchEvent: function ( event ) {
			
		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var listenerArray = listeners[ event.type ];

		if ( listenerArray !== undefined ) {

			event.target = this;

			var array = [];
			var length = listenerArray.length;

			for ( var i = 0; i < length; i ++ ) {

				array[ i ] = listenerArray[ i ];

			}

			for ( var i = 0; i < length; i ++ ) {

				array[ i ].call( this, event );

			}

		}

	}

};
/*

Fonctions utiles

*/


function extend(target) {
	
	var sources = [].slice.call(arguments, 1);
	
	sources.forEach(function (source) {
		for (var p in source)
			target[p] = source[p];
	});

	return target;
}




function globToRegexp(glob) {

	var result = '',
		escapChar = ['.','\\','+','?','[','^',']','$','(',')','{','}','=','!','<','>','|',':','-'];


	var c;
	for (var i = 0, l = glob.length; i < l; i++) {
		
		c = glob[i];

		if (escapChar.indexOf(c) != -1)
			result += '\\' + c;

		else if (c == "*")
			result += ".*";

		else
			result += c;

	}


	return new RegExp("^" + result + "$");

};
/*

Configuration

*/



var Config = {


	// Ip du serveur
	ip: process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1",

	// Port du serveur HTTP et WebSocket
	httpPort: process.env.OPENSHIFT_NODEJS_PORT || 8080,

	// Port du serveur TCP
	tcpPort: 18327,


	// Mot de passe de l'interface
	mdp: "yolo",

	overrideSpe: false,

	active: true,

	mustDelete: false

};


EventDispatcher.prototype.apply( Config );




var DefaultOptions = {

	unlockedUsers: [],

	active: Config.active,

	mustDelete: Config.mustDelete

};






var fs = require('fs');



// Lecture des options

try {
	var Options = JSON.parse(fs.readFileSync("options.json", { encoding: "utf8" }));
} catch(e) {
	console.error("Erreur: Lecture du fichier option");
	console.error(e);
	var Options = {};
}



for (var i in DefaultOptions) {
	
	if (typeof Options[i] == "undefined")
		Options[i] = DefaultOptions[i];

	Config.active = Options.active;
	Config.mustDelete = Options.mustDelete;
}





// Sauvegarde

function saveOptionFile() {

	Config.dispatchEvent({ type: "save" });


	Options.active = Config.active;
	Options.mustDelete = Config.mustDelete;


	var txt = JSON.stringify(Options);

	fs.writeFile("options.json", txt, { encoding: "utf8" }, function(err) {
		if(err) console.log(err);
	});

};


var timerOptions = setInterval(saveOptionFile, 30000);



/*

Gestion de la page "infos"

*/




// Namespace
var Infos = {};


Infos.addIp = function(ip) {
	SavedInfos.deploitNbr++;

	if (SavedInfos.ip.indexOf(ip) == -1)
		SavedInfos.ip.push(ip);
};



Infos.reset = function() {

	SavedInfos.deploitNbr = 0;

	SavedInfos.ip = [];
};






// Lecture du fichier "infos.json"

try {
	var SavedInfos = JSON.parse(fs.readFileSync("infos.json", { encoding: "utf8" }));
} catch(e) {
	console.error("Erreur: Lecture du fichier infos");
	console.error(e);
	var SavedInfos = {};
}


SavedInfos.ip = SavedInfos.ip || [];

SavedInfos.deploitNbr = SavedInfos.deploitNbr || 0;





// Sauvegarde

function saveInfos() {

	var txt = JSON.stringify(SavedInfos);

	fs.writeFile("infos.json", txt, { encoding: "utf8" }, function(err) {
		if(err) console.log(err);
	});

};


var timerInfos = setInterval(saveInfos, 30000);
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
/*

Sequence

*/






// Objet Sequence

function SequenceObj(name) {

	this.name = name;
	this.cmds = [];

}


SequenceObj.prototype.toJSON = function(cmd) {
	return {
		name: this.name,
		cmds: this.cmds
	};
}










// Objet SéquenceRunner

function SequenceRunner(Seq, socket) {

	var _this = this;

	this.sequence = Seq;
	this.socket = socket;

	this.current = 0;
	this.isRunning = false;

	this.timer = 0;

	this.variables = {};


	this.run = function() {
		if (_this.isRunning)  return;
		
		_this.isRunning = true;

		_this.current = -1;
		_this.next();
	}


	this.stop = function() {
		if (!_this.isRunning)  return;

		clearTimeout(_this.timer);
		SocketCmd.removeWRFor(_this.socket);
		_this.isRunning = false;

		if (_this.subSequence)
			_this.subSequence.stop();

		_this.subSequence = null;

		if (_this.onStop)
			_this.onStop();
	}


	this.next = function() {
		_this.current++;

		if (_this.current >= Seq.cmds.length)
			return _this.stop();
		
		if (parse(_this.current))
			_this.next();
	}


	function parse(i) {

		var text = Seq.cmds[i],
			txt = text.trim().split(" "),
			params = text.trim().replace(",", " ").split(" "),
			cmdName = params[0];

		params.shift();
		txt.shift();

		if (SequencesCmd[cmdName])
			return (SequencesCmd[cmdName](params, _this, txt.join(" ")) !== true);

		return true;
	}


	this.run();
}










// Commandes de Séquences

var SequencesCmd = {};


// Delay en seconde
SequencesCmd['delay'] = function(params, parent) {

	parent.timer = setTimeout(parent.next, parseFloat(params.join(" ").trim()) * 1000);
	return true;
};



// Delay en minute
SequencesCmd['delayMin'] = function(params, parent) {

	parent.timer = setTimeout(parent.next, parseFloat(params.join(" ").trim()) * 60000);
	return true;
};



// Attendre fin subSéquence
SequencesCmd['wait'] = function(params, parent) {

	if (!parent.subSequence)
		return;
			
	parent.subSequence.onStop = parent.next;
	return true;
};




// Afficher à la console
SequencesCmd['log'] = function(params, parent, text) {

	var text = text.replace(/^"(.*)"$/, "$1");
	console.log("Seq '" + parent.sequence.name + "': '" + text + "'");
};




// Attend un message du une variable
SequencesCmd['waitReceiving'] = function(params, parent, text) {

	if (!parent.socket)
		return;

	var m = text.match(/^"(.*)"/),
		msg = m.length > 1 ? m[1] : '';

	m = text.match(/,\s*([0-9]+)$/);
	var time = m.length > 1 ? parseFloat(m[1]) : 0;

	if (!time && !msg)
		return;


	function next() {
		SocketCmd.removeWRFor(parent.socket);
		clearTimeout(parent.timer);
		parent.next();
	}

	SocketCmd.addWRFor(parent.socket, function(txt) {
		
		if (txt == msg)
			next();
	});

	if (time)
		parent.timer = setTimeout(next, time * 1000);

	return true;
};





// Activer le PC
SequencesCmd['lock'] = function(params, parent) {

	if (parent.socket)
		Sockets.active(parent.socket);
	else
		Sockets.activeAll();
};



// Désactiver le PC
SequencesCmd['unlock'] = function(params, parent) {

	if (parent.socket)
		Sockets.unactive(parent.socket);
	else
		Sockets.unactiveAll();
};





// Définir l'affichage
SequencesCmd['setView'] = function(params, parent) {

	var name = params[0].replace(/^"([a-zA-Z0-9]+)"$/, "$1");
	params.shift();

	parent.lastView = name;


	if (parent.socket)
		Affichages.setFor(name, parent.socket);
	else
		Affichages.set(name);


	var json = params.join(" ").trim();
	
	if (json && Affichages.Elements[name]) {

		if (json[0] != "{") json = "{" + json + "}";

		try {
			var obj = eval('obj = ' + json);
		} catch(e) {
			console.log("'setView': json invalide dans la séquence '" + parent.sequence.name + "'");
			return;
		}

		for (var i in obj)
			Affichages.Elements[name].cmd(i, obj[i], parent.socket);
	}
};





// Option d'affichage 
SequencesCmd['viewCmd'] = function(params, parent) {

	var json = params.join(" ").trim(),
		name = parent.lastView;
	
	if (!json || !Affichages.Elements[name])
		return;


	if (json[0] != "{") json = "{" + json + "}";
	json = json.replace(/([^", ])(\b[a-zA-Z0-9_]+\b)([^", ])/g, '$1"$2"$3');


	try {
		var obj = JSON.parse(json);
	} catch(e) {
		console.log("'viewCmd': json invalide dans la séquence '" + parent.sequence.name + "'");
		return;
	}

	for (var i in obj)
		Affichages.Elements[name].cmd(i, obj[i], parent.socket);

};




// Lance une subSéquence
SequencesCmd['runSequence'] = function(params, parent) {

	var name = params[0].replace(/^"([a-zA-Z0-9]+)"$/, "$1");

	if (!SequenceCreated[name])
		return;

	var seq = new SequenceRunner(SequenceCreated[name], parent.socket);

	if (parent.subSequence)
		parent.subSequence.stop();

	parent.subSequence = seq;
};




// Arrete la subSéquence
SequencesCmd['stopSequence'] = function(params, parent) {

	if (parent.subSequence)
		parent.subSequence.stop();

	parent.subSequence = null;
};




// Commande 'for'
SequencesCmd['for'] = function(params, parent, text) {

	var arr = text.split(",");

	if (arr.length < 3)
		return;
	
	var variable = arr[0].trim(),
		deb = parseInt(arr[1].trim()),
		fin = parseInt(arr[2].trim());

	if (!parent.forStack)
		parent.forStack = [];

	parent.forStack.push({ i: parent.current, v: variable, f: fin });
	parent.variables[variable] = deb;
	
};




// Commande 'endfor'
SequencesCmd['endfor'] = function(params, parent) {

	if (!parent.forStack || !parent.forStack.length)
		return;

	var obj = parent.forStack[ parent.forStack.length-1 ];

	parent.variables[obj.v]++;

	if (parent.variables[obj.v] >= obj.f)
		parent.forStack.pop();
	else
		parent.current = obj.i;
	
};













// Namespace "Sequence"


var Sequence = {};

var SequenceCreated = {};

var RunningSequences = [];



Sequence.active = false;

Sequence.current = "bonjour";


// Créer une séquence
Sequence.create = function(name) {

	var obj = new SequenceObj(name);
	SequenceCreated[name] = obj;

	return obj;
}




// Supprime une séquence
Sequence.delete = function(name) {

	if (!SequenceCreated[name])
		return;

	Sequence.stopAllName(name);
	delete SequenceCreated[name];
}




// Lance la séquence actuelle, si autorisé
Sequence.testForRun = function() {

	if (!Sequence.active || !Sequence.current)
		return false;

	Sequence.run(Sequence.current);
	return true;
}




// Lance une séquence
Sequence.run = function(name) {

	if (!SequenceCreated[name])
		return;

	var runner = new SequenceRunner(SequenceCreated[name]);
	runner.onStop = function() {
		Sequence.stop(runner);
	};

	RunningSequences.push(runner);
	console.log("Run: '" + name + "'");
}




// Arrete une séquence
Sequence.stop = function(runner) {
	console.log("Stop: '" + runner.sequence.name + "'");

	runner.stop();

	var i = RunningSequences.indexOf(runner);
	if (i != -1) 
		RunningSequences.splice(i, 1);
}




// Arrete toute les séquences du nom...
Sequence.stopAllName = function(name) {

	for (var i = 0, l = RunningSequences.length; i < l; i++) {
		
		if (RunningSequences[i].sequence.name == name)
			RunningSequences[i].stop();
	}

}




// Arrete toute les séquences
Sequence.stopAll = function() {

	for (var i = 0, l = RunningSequences.length; i < l; i++)
		RunningSequences[i].stop();

	RunningSequences = [];
}







// Listener: sauvegarde

Config.addEventListener("save", function() {

	Options.sequences = {};

	for (var i in SequenceCreated)
		Options.sequences[i] = SequenceCreated[i].toJSON();
});





// On ajoute les séquences existantes

for (var i in Options.sequences) {

	var obj = Options.sequences[i],
		seq = Sequence.create(obj.name);

	seq.cmds = obj.cmds;
}









// Envoi les séquences existances
function ReturnSequences(res) {

	var arr = [];
	for (var i in SequenceCreated)
		arr.push(SequenceCreated[i].toJSON());

	res.send({ set: "Sequences", value: arr });
}





// Commande: ajout séquence
Commandes['addSequence'] = function(req, res) {

	var name = req.body.name;

	if (SequenceCreated[name])
		return res.send({ error: "exist" });

	Sequence.create(name);


	ReturnSequences(res);
};





// Commande: suppression séquence
Commandes['deleteSequence'] = function(req, res) {

	var name = req.body.name;

	if (!SequenceCreated[name])
		return res.send({ error: "name" });

	Sequence.delete(name);


	ReturnSequences(res);
};





// Commande: set séquence cmds
Commandes['setSeqCmds'] = function(req, res) {

	var name = req.body.name,
		cmds = req.body.cmds;

	if (!SequenceCreated[name])
		return res.send({ error: "name" });

	SequenceCreated[name].cmds = cmds.split("\n");


	ReturnSequences(res);
};





// Commande: activer séquences
Commandes['seqOn'] = function(req, res) {

	var value = req.body.value == "true";

	Sequence.current = req.body.seq || Sequence.current;
	Sequence.active = value;

	if (value)
		Sequence.testForRun();
	else
		Sequence.stopAll();

	res.send({ set: "seqOn", value: value });
};
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
/*

Gestion des affichages

*/



var Affichages = {};

Affichages.current = null;


Affichages.Elements = {};
Affichages.ElemsWithOps = [];



Affichages.add = function(name, obj) {

	obj.name = name;
	obj.selected = false;
	obj.sockets = "all"; //[];

	Affichages.Elements[name] = obj;

	if (obj.hasHtml)
		Affichages.ElemsWithOps.push(obj);
};



Affichages.set = function(name) {

	if (Affichages.current) {
		Affichages.current.selected = false;
		Affichages.current = null;
	}

	if (Affichages.Elements[name]) {
		Affichages.current = Affichages.Elements[name];
		Affichages.current.show(Affichages.current.sockets);
		Affichages.current.selected = true;
	}
	else {
		Sockets.setView("none");
	}

};




Affichages.setFor = function(name, socket) {

	if (!Affichages.Elements[name])
		return;
	
	Affichages.Elements[name].show(socket);

};




// Retourne un JSON pour ejs
Affichages.getJSON = function() {

	var result = [];

	for (var i in Affichages.Elements) {
		var e = Affichages.Elements[i];

		result.push({
			name: i,
			displayName: e.displayName,
			hasHtml: e.hasHtml || false
		});
	}

	return result;
};





// Commande: changement d'affichage
Commandes['setAffichage'] = function(req, res) {

	var aff = req.body.aff;

	Affichages.set(aff);

	res.send({ set: "affichage", value: aff });
};




// Commande: option de l'affichage
Commandes['affichageCmd'] = function(req, res) {

	var aff = req.body.aff,
		cmd = req.body.cmd;

	delete req.body.pwd;
	delete req.body.cmd;
	delete req.body.aff;
	
	if (Affichages.Elements[aff])
		Affichages.Elements[aff].cmd(cmd, req.body);

	res.send({ success: "affichageCmd" });
};
/*

Affichage: Musique

*/



var MusiqueCmd = {};


MusiqueCmd['play'] = MusiqueCmd['src'] = function(obj, sockets) {

	var src = (obj && obj.src) || obj;
	
	if (MusiqueAff.selected || sockets)
		Sockets.viewCmd("play", { src: src, volume: MusiqueAff.volume }, sockets);
}



MusiqueCmd['pause'] = function(obj, sockets) {
	
	if (MusiqueAff.selected || sockets)
		Sockets.viewCmd("pause", sockets);
}



MusiqueCmd['setVolume'] = function(obj, sockets) {
	
	if (MusiqueAff.selected || sockets)
		Sockets.viewCmd("volume", { volume: obj.volume }, sockets);

	if (!sockets)
		MusiqueAff.volume = obj.volume;
}



MusiqueCmd['setText'] = MusiqueCmd['text'] = function(obj, sockets) {

	var text = (typeof obj == "object") ? obj.text : obj;
	
	if (MusiqueAff.selected || sockets)
		Sockets.viewCmd("text", { text: text }, sockets);

	if (!sockets)
		MusiqueAff.text = text;
}






var MusiqueAff = {


	displayName: "Musique",

	hasHtml: true,


	show: function(sockets) {

		Sockets.setView("musique", sockets);
		Sockets.sendFor(sockets, { type: "allowUserInput", value: false });

		Sockets.viewCmd("volume", { volume: MusiqueAff.volume }, sockets);
		Sockets.viewCmd("text", { text: MusiqueAff.text }, sockets);

	},


	cmd: function(cmd, obj, sockets) {

		if (MusiqueCmd[cmd])
			MusiqueCmd[cmd](obj, sockets);
	},


	getOptions: function() {

		return { volume: MusiqueAff.volume, text: MusiqueAff.text };
	},


	volume: 100,

	text: "Music !"

};



Affichages.add("musique", MusiqueAff);
/*

Affichage: Web

*/



var WebCmd = {};


WebCmd['setUrl'] = WebCmd['url'] = function(obj, sockets) {

	var url = (typeof obj == "object") ? obj.url : obj;
	
	if (WebAff.selected || sockets)
		Sockets.viewCmd("loadUrl", { url: url }, sockets);

	if (!sockets)
		WebAff.url = url;
}


WebCmd['allowInput'] = WebCmd['input'] = function(obj, sockets) {
	
	var value = (typeof obj == "object") ? obj.value : obj;

	if (WebAff.selected || sockets)
		Sockets.sendFor(sockets || WebAff.sockets, { type: "allowUserInput", value: value });

	if (!sockets)
		WebAff.allowInput = value;
}






var WebAff = {


	displayName: "Web",

	hasHtml: true,


	show: function(sockets) {

		Sockets.setView("web", sockets);

		Sockets.sendFor(sockets, { type: "allowUserInput", value: WebAff.allowInput });
		Sockets.viewCmd("loadUrl", { url: WebAff.url }, sockets);

	},


	cmd: function(cmd, obj, sockets) {

		if (WebCmd[cmd])
			WebCmd[cmd](obj, sockets);
	},


	getOptions: function() {

		return { url: WebAff.url, allowInput: WebAff.allowInput };
	},



	url: "http://google.fr",

	allowInput: false

};



Affichages.add("web", WebAff);
/*

Affichage: Flappy

*/



var FlappyCmd = {};


FlappyCmd['setUrl'] = function(obj) {
	FlappyAff.url = obj.url;

	if (FlappyAff.selected)
		Sockets.viewCmd("loadUrl", { url: obj.url }, FlappyAff.sockets);
};





var FlappyAff = {


	displayName: "Flappy Bird",

	url: "http://parksprojets.tk/Flappy/",


	show: function(sockets) {

		Sockets.setView("web", sockets);
		
		Sockets.viewCmd("loadUrl", { url: FlappyAff.url }, sockets);
		Sockets.sendFor(sockets, { type: "allowUserInput", value: true });
		
	},


	cmd: function(cmd, obj) {

		if (FlappyCmd[cmd])
			FlappyCmd[cmd](obj);
	},


};



Affichages.add("flappy", FlappyAff);
/*

Affichage: Msg

*/



var MsgCmd = {};


MsgCmd['setMsg'] = MsgCmd['msg'] = function(obj) {
	MsgAff.msg = obj.text;

	if (MsgAff.selected)
		Sockets.viewCmd("setMsg", { text: obj.text }, MsgAff.sockets);
}







var MsgAff = {


	displayName: "Message",

	msg: "Bonjour !",


	show: function(sockets) {

		Sockets.setView("msg", sockets);
		Sockets.sendFor(sockets, { type: "allowUserInput", value: false });

		Sockets.viewCmd("setMsg", { text: MsgAff.msg }, sockets);

	},


	cmd: function(cmd, obj) {

		if (MsgCmd[cmd])
			MsgCmd[cmd](obj);
	},


};



Affichages.add("msg", MsgAff);
/*

Express

*/



var express = require('express'),
	bodyParser = require('body-parser'),
	http = require('http'),
	path = require("path");





// Init
var app = express();
var server = http.createServer(app);

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: false }) );

app.use(express.static(path.join(__dirname, 'static')));





// Obtient l'index
app.get('/', function(req, res) {
	
	var affs = Affichages.getJSON(),
		seqCmd = [];

	for (var i = 0; i < affs.length; i++) {
		if (affs[i].hasHtml)
			affs[i].html = fs.readFileSync("views/" + affs[i].name + ".html", "utf8");
	}

	for (var i in SequencesCmd)
		seqCmd.push(i);

	res.render("index.ejs", {
		seqCmd: seqCmd,
		affichages: affs
	});

});




// Mobile
app.get('/mobile', function(req, res) {
	
	var spes = [];
	for (var i in SpeCreated)
		spes.push(SpeCreated[i].toJSON());

	res.render("mobile.ejs", {
		spes: spes
	});

});



// Page de config
app.get('/globalConfig', function(req, res) {
	
	res.render("config.ejs", {
		active: Config.active,
		mustDelete: Config.mustDelete
	});

});





// Page d'info
app.get('/infos', function(req, res) {
	
	res.render("infos.ejs", {
		infos: SavedInfos
	});

});


// Reset des infos
app.get('/resetInfos', function(req, res) {
	Infos.reset();

	res.redirect('../infos');
});






// URL de commandes

app.post('/getList', function(req, res) {
	Commandes.call('getList', req, res);
});



app.post('/activePC', function(req, res) {
	Commandes.call('activePC', req, res);
});

app.post('/unactivePC', function(req, res) {
	Commandes.call('unactivePC', req, res);
});



app.post('/affichageCmd', function(req, res) {
	Commandes.call('affichageCmd', req, res);
});

app.post('/setAffichage', function(req, res) {
	Commandes.call('setAffichage', req, res);
});



app.post('/cmd', function(req, res) {
	Commandes.call(req.param('cmd'), req, res);
});





// URL pour PProot-Deploit

app.get('/isActive', function(req, res) {

	var ipAddr = req.headers["x-forwarded-for"];
	
	if (ipAddr) {
		var list = ipAddr.split(",");
		ipAddr = list[list.length-1];
	} else {
		ipAddr = req.connection.remoteAddress;
	}

	Infos.addIp(ipAddr);

	res.send(Config.active ? "true" : "false");
});

app.get('/mustDelete', function(req, res) {	
	res.send(Config.mustDelete ? "true" : "false");
});




// On écoute le port
server.listen(Config.httpPort, Config.ip, function() {
	console.log("Serveur HTTP/WebSocket lancé !");
});
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
