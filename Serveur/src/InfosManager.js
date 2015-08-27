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