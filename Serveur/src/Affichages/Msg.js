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