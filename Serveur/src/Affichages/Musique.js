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