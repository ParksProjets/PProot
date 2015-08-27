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