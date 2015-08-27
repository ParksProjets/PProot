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