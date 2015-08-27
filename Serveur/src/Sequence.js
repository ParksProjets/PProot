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