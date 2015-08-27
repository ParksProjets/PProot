var gulp = require('gulp');

var concat = require('gulp-concat');




gulp.task('server', function() {

	var base = "src/";

	var files = [
		"EventDispatcher.js",
		"Utils.js",
		"Config.js",
		"InfosManager.js",
		"Sockets.js",
		"SocketCmd.js",
		"Commandes.js",

		"Sequence.js",
		"Spe.js",

		"Affichages.js",
		"Affichages/Musique.js",
		"Affichages/Web.js",
		"Affichages/Flappy.js",
		"Affichages/Msg.js",

		"Express.js",
		"WebSocket.js",
		"TCP.js"
	];



	for (var i = 0; i < files.length; i++)
		files[i] = base + files[i];
	
	return gulp.src(files)
		.pipe(concat("server.js"))
		.pipe(gulp.dest('./'));

});





gulp.task('js', function() {

	var base = "web/js/";

	var files = [
		"jquery.pedit.js",
		"EventDispatcher.js",
		"Utils.js",
		"App.js",
		"main.js",
		"Affichages.js",
		"controller-PC.js",
		"controller-top.js",
		"Spe.js",
		"Sequences.js",
		"controller-right.js"
	];



	for (var i = 0; i < files.length; i++)
		files[i] = base + files[i];
	
	return gulp.src(files)
		.pipe(concat("all.js"))
		.pipe(gulp.dest('./static/js'));

});






gulp.task('default', ['server']);