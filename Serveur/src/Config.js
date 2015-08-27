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


