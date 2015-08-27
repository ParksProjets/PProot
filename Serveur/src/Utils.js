/*

Fonctions utiles

*/


function extend(target) {
	
	var sources = [].slice.call(arguments, 1);
	
	sources.forEach(function (source) {
		for (var p in source)
			target[p] = source[p];
	});

	return target;
}




function globToRegexp(glob) {

	var result = '',
		escapChar = ['.','\\','+','?','[','^',']','$','(',')','{','}','=','!','<','>','|',':','-'];


	var c;
	for (var i = 0, l = glob.length; i < l; i++) {
		
		c = glob[i];

		if (escapChar.indexOf(c) != -1)
			result += '\\' + c;

		else if (c == "*")
			result += ".*";

		else
			result += c;

	}


	return new RegExp("^" + result + "$");

};