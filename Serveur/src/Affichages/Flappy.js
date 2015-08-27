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