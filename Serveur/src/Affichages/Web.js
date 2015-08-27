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