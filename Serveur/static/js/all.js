/*

P-edit

(c) Guillaume Gonnet

*/


(function($) {



	function onInput() {

		var $this = $(this);
		var elems = $this.text().split(/[\s]+/);


		if ($this.is(":focus"))
			var caretPos = getCaretPosIn(this);
		else
			var caretPos = false;


		$this.empty();

		elems.forEach(function(elem, i) {

			if (!elem.trim().length) {

				if (i == elems.length-1 && $this.text().length)
					$this.append("&nbsp;");

				return;
			}
			
			if ($this.text().length)
				$this.append("&nbsp;");

			$this.append($("<span></span>").text(elem));

		});


		if (caretPos !== false)
			setCaretPosIn(this, Math.min(caretPos, $this.text().length));

	}




	$.fn.pedit = function(options, trigger) {


		if (typeof options == "undefined") {
			return this.text().trim().split(/[\s]+/);
		}


		if (typeof options == "string") {

			this.text(options);
			this.trigger('input');

			if (trigger)
				this.trigger('blur');

			return;
		}



		options = $.extend({}, $.fn.pedit.defaults, options);


		this.bind("propertychange keyup input paste", onInput);
	

		return this.each(function() {

			var $this = $(this),
				timer = null,
				val = $this.text();

			$this.unbind("change");


			$this.focus(function() {

				if (options.timer && !timer)
					timer = setInterval(onChange, options.interval);
			});

			$this.blur(function() {
				clearInterval(timer);
				timer = null;

				onChange();
			});


			function onChange() {

				if (val == $this.text().trim())
					return;

				val = $this.text().trim();
				$this.trigger({ type: "change", value: val, elements: val.split(/[\s]+/) });
			}

		});
	};



	$.fn.pedit.defaults = {
		timer: true,
		interval: 1000
	};


})( jQuery );
/**
 * @author mrdoob / http://mrdoob.com/
 */

var EventDispatcher = function () {}

EventDispatcher.prototype = {

	constructor: EventDispatcher,

	apply: function ( object ) {

		object.addEventListener = EventDispatcher.prototype.addEventListener;
		object.hasEventListener = EventDispatcher.prototype.hasEventListener;
		object.removeEventListener = EventDispatcher.prototype.removeEventListener;
		object.dispatchEvent = EventDispatcher.prototype.dispatchEvent;

	},

	addEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) this._listeners = {};

		var listeners = this._listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );

		}

	},

	hasEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return false;

		var listeners = this._listeners;

		if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {

			return true;

		}

		return false;

	},

	removeEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var listenerArray = listeners[ type ];

		if ( listenerArray !== undefined ) {

			var index = listenerArray.indexOf( listener );

			if ( index !== - 1 ) {

				listenerArray.splice( index, 1 );

			}

		}

	},

	dispatchEvent: function ( event ) {
			
		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var listenerArray = listeners[ event.type ];

		if ( listenerArray !== undefined ) {

			event.target = this;

			var array = [];
			var length = listenerArray.length;

			for ( var i = 0; i < length; i ++ ) {

				array[ i ] = listenerArray[ i ];

			}

			for ( var i = 0; i < length; i ++ ) {

				array[ i ].call( this, event );

			}

		}

	}

};
/*

Fonctions utiles

*/


String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
};



// Retourne la position du curseur
function getCaretPosIn(elem) {

	var range = window.getSelection().getRangeAt(0),
		preCaretRange = range.cloneRange();

	preCaretRange.selectNodeContents(elem);
	preCaretRange.setEnd(range.endContainer, range.endOffset);

	return preCaretRange.toString().length;
}



// Définit la position du curseur
function setCaretPosIn(elem, pos) {
	setSelectionRange(elem, pos, pos);
}



// Obtient les Text Node d'un élément
function getTextNodesIn(node) {
	
	if (node.nodeType == 3)
		return [ node ];


	var children = node.childNodes,
		textNodes = [];

	for (var i = 0, len = children.length; i < len; ++i)
		textNodes.push.apply(textNodes, getTextNodesIn(children[i]));

	return textNodes;
}



// Définit la sélection
function setSelectionRange(el, start, end) {
	
	var range = document.createRange();
	range.selectNodeContents(el);
	var textNodes = getTextNodesIn(el);
	var foundStart = false;
	var charCount = 0, endCharCount;

	for (var i = 0, textNode; textNode = textNodes[i++]; ) {
		endCharCount = charCount + textNode.length;
		if (!foundStart && start >= charCount && start <= endCharCount) {
			range.setStart(textNode, start - charCount);
			foundStart = true;
		}
		if (foundStart && end <= endCharCount) {
			range.setEnd(textNode, end - charCount);
			break;
		}
		charCount = endCharCount;
	}

	var sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
}
/*

Fichier App

*/



var App = {};

EventDispatcher.prototype.apply( App );



// Stocke le mot de passe
App.password = '';



// Post sur le serveur
App.post = function(url, params, success, error) {

	var data = "pwd=" + App.password;
	params = params || {};

	for (var i in params)
		data += "&" + i + "=" + params[i];


	function callError(msg) {
		if (error)
			error(msg);
	}


	$.ajax({
		url: url,
		method: "post",
		data: data,

		success: function(d) {

			if (d.error)
				return callError(d.error);

			if (d.success)
				App.dispatchEvent({ type: 'success-' + d.success });

			if (d.set)
				App.dispatchEvent({ type: 'set-' + d.set, message: { ip: d.ip || "all", value: d.value } });

			if (success)
				success(d);
		},

		error: function(d) {
			callError("connect");
		}
	});

};




// Post une commande
App.cmd = function(cmd, params, success, error) {
	params.cmd = cmd;
	App.post("cmd", params, success, error);
}





// Liste des PC
App.list = {};



// Met à jour la liste
App.update = function(success, error) {

	App.dispatchEvent({ type: 'start-updateList' });


	App.post("/getList", null, function(d) {

		App.checkList(d.list);

		delete d.list;

		for (var i in d)
			App.dispatchEvent({ type: 'set-' + i, message: { value: d[i] } });


		App.dispatchEvent({ type: 'stop-updateList' });

		if (success)
			success(d);

	},

	function(msg) {
		
		App.dispatchEvent({ type: 'stop-updateList' });

		if (error)
			error(msg);

	});

};




// Vérifie la liste
App.checkList = function(newList) {


	for (var i in App.list) {

		if (newList[i])  continue;

		var obj = App.list[i];

		delete App.list[i];
		App.dispatchEvent({ type: 'delete-pc', message: obj });
	}


	for (var i in newList) {

		var nl = newList[i];

		// Le PC esiste déja
		if (App.list[i]) {

			var al = App.list[i];

			for (var j in nl) {
				if (nl[j] == al[j])  continue;

				al[j] = nl[j];
				App.dispatchEvent({ type: 'set-' + j, message: { ip: i, value: nl[j] } });
			}

			continue;
		};



		// Nouveau PC
		var nl = App.list[i] = newList[i];
		
		App.dispatchEvent({ type: 'new-pc', message: nl });

		for (var j in nl)
			App.dispatchEvent({ type: 'set-' + j, message: { ip: i, value: nl[j] } });
	}

};





// Timer pour la mise à jour

App.timer = null;

App.interval = 10000;


App.startTimer = function() {
	App.timer = setInterval(App.update, App.interval);
}


App.stopTimer = function() {
	clearInterval(App.timer);
	App.timer = null;
}
/*

Main JS

*/



// Variables jQuery

var $mainPage = $("#page-main"),
	$nbrPc = $("#nbrConnectedPc b");




$("#page-password form").submit(function(e) {

	e.preventDefault();
	var $this = $(this);

	App.password = $(this).find("input").val();
	App.update(function() {

		var tl = new TimelineMax({ pause: true, onComplete: function() {
			console.log(45);
			$mainPage.css("transform", "");
		}});

		tl.to($this.find("input"), 1, { x: -200, opacity: 0 })
		  .to($this.find("button"), 1, { x: 200, opacity: 0 }, 0)
		  .fromTo($mainPage, 0.5, { y: 200, display: "block", opacity: 0 }, { y: 0, opacity: 1 }, "-=0.7");


		tl.play();
		App.startTimer();
		
	});

});






// Mise à jour du nombre de PC
function updateNbrPc() {
	$nbrPc.text(Object.keys(App.list).length);
}

App.addEventListener("new-pc", updateNbrPc);
App.addEventListener("delete-pc", updateNbrPc);












/*

Affichages

*/


var $views = $(".views"),
	$cachePanel = $("#cachePanel");


var Affichages = {};

Affichages.current = "none";


Affichages.set = function(name, send) {

	$views.filter('[data-name="' + Affichages.current + '"]').removeClass('active');

	if (!name || name == "none") {
		Affichages.current = null;
		return;
	}
	
	$views.filter('[data-name="' + name + '"]').addClass('active');
	Affichages.current = name;
}



$views.click(function() {

	var name = $(this).attr("data-name");
	
	if (name == Affichages.current)
		name = "none";

	Affichages.set(name);
	App.post("setAffichage", { aff: name });

});


App.addEventListener("set-affichage", function(d) {
	Affichages.set(d.message.value);
});






// Panels

$views.find(".edit").click(function(e) {

	e.stopPropagation();

	var name = $(this).parent().attr("data-name"),
		$panel = $('.panel[data-name="' + name + '"]');


	$cachePanel.fadeIn();
	$panel.fadeIn();

});



$cachePanel.click(function() {

	var $panels = $('.panel:visible');

	$panels.fadeOut();
	$cachePanel.fadeOut();

});
/*

Fichier de gestion des PC

*/


// Variables jQuery

var $tablePc = $("#pc-list tbody"),
	$filtre = $("#pcFiltre");




// Events click

function onClickBtnRS(e) {
	App.post("cmd", { cmd: "quit", ip: e.data.ip + ':' + e.data.port });
	App.update();
}


function onClickBtnActive(e) {
	App.post("activePC", { ip: e.data.ip + ':' + e.data.port });
}


function onClickBtnUnActive(e) {
	App.post("unactivePC", { ip: e.data.ip + ':' + e.data.port });
}


function onClickBtnShutdown(e) {
	App.post("cmd", { cmd: "shutdown", ip: e.data.ip + ':' + e.data.port });
	App.update();
}






// Ajout d'un PC
App.addEventListener("new-pc", function(e) {

	console.log(e.message);

	var $elem = $('<tr data-ip="' + e.message.ip + ':' + e.message.port + '"></tr>');
	
	//$elem.append('<td>' + e.message.ip + '</td>');
	$elem.append('<td>' + e.message.port + '</td>');
	$elem.append('<td>' + e.message.namePC + '</td>');
	$elem.append('<td class="nameUser">' + e.message.nameUser + '</td>');


	var $btnRS = $('<button class="btn">RS</button>'),
		$btnActive = $('<button class="btn btn-Ac">Activer</button>'),
		$btnUnActive = $('<button class="btn btn-red btn-UnAc">Désactiver</button>'),
		$btnShutDown = $('<button class="btn">Shutdown</button>'),
		$td = $('<td></td>');


	$btnRS.click(e.message, onClickBtnRS);
	$btnActive.click(e.message, onClickBtnActive);
	$btnUnActive.click(e.message, onClickBtnUnActive).hide();
	$btnShutDown.click(e.message, onClickBtnShutdown);


	$td.append([ $btnActive, $btnUnActive, $btnRS, $btnShutDown ]);

	$elem.append($td);
	$tablePc.append($elem);

});


App.addEventListener("stop-updateList", function() {
	filtrePC();
});





// Suppression d'un PC
App.addEventListener("delete-pc", function(e) {

	$elem = $tablePc.find('tr[data-ip="'+ e.message.ip + ':' + e.message.port + '"]');
	$elem.remove();

});




// Cangement "nameUser"
App.addEventListener("set-nameUser", function(e) {
	var $elem = $tablePc.find('tr[data-ip="'+ e.message.ip + '"]');
	$elem.find(".nameUser").text(e.message.value);
});




// Changement "active"
App.addEventListener("set-active", function(e) {

	var $elem = $tablePc.find('tr[data-ip="'+ e.message.ip + '"]');
	
	var $btnAc = $elem.find(".btn-Ac").hide(),
		$btnUnAc = $elem.find(".btn-UnAc").hide();

	if (e.message.value)
		$btnUnAc.show();
	else
		$btnAc.show();
});






// Filtre

$filtre.bind("propertychange keyup input paste", function() {
	filtrePC();
});


function filtrePC(filtre) {

	if (!filtre)
		filtre = $filtre.val().trim().toLowerCase();


	$tablePc.find("tr").each(function() {

		var $this = $(this),
			searchs = [ "td:eq(0)", "td:eq(1)", "td:eq(2)" ],
			ok = false;

		for (var i = 0; i < searchs.length; i++)
			ok |= ($this.find(searchs[i]).text().toLowerCase().search(filtre) != -1);

		if (ok)
			$this.show();
		else
			$this.hide();
	});

}
/*

Fichier de gestion du panel en haut

*/



// Variables jQuery

var $inputUnlock = $("#input-userUnlokck"),
	$inputSpe = $("#input-userSpe"),
	$btnReloadTime = $("#input-reloadTime");



// Input edit
$(".p-edit").pedit({});




// Reaload time

$btnReloadTime.change(function() {
	
	if (!$(this).val())
		return;

	App.stopTimer();
	App.interval = parseInt($(this).val()) * 1000;
	App.startTimer();
});





// Utilisateurs débloquéées

$inputUnlock.change(function(e) {
	App.cmd("setUnlockedUsers", { users: e.elements.join(",") });
});


App.addEventListener("set-unlockedUsers", function(e) {

	if (!$inputUnlock.is(":focus"))
		$inputUnlock.pedit(e.message.value.join(" "));
});

/*

Spe

*/


// jQuery
var $speContainer = $("#spe"),
	$cacheSpe = $("#cacheSpe"),

	$speAddPanel = $("#speAddPanel"),

	$spePanel = $("#spePanel"),
	$spePanelH3 = $spePanel.find("h3 span"),
	$spePanelUsers = $spePanel.find(".p-edit"),
	$spePanelSelect = $spePanel.find("select");


var specialites = {};



// Update
App.addEventListener("set-Spe", function(e) {
	var obj = e.message.value;

	var $exist = $speContainer.children(),
		exists = {};

	$exist.each(function(index, element) {
		var el = $(element);

		if (el.attr("data-name"))
			exists[el.attr("data-name")] = el;
	});


	for (var i = 0; i < obj.length; i++) {

		var spe = obj[i];

		if (!specialites[spe.name])
			specialites[spe.name] = { name: spe.name, active: false, users: [], seq: null };


		specialites[spe.name].active = spe.active;
		specialites[spe.name].users = spe.users;
		specialites[spe.name].seq = spe.sequence;


		if (exists[spe.name]) {
			
			if (spe.active)
				exists[spe.name].addClass('active');
			else
				exists[spe.name].removeClass('active');

			delete exists[spe.name];
			continue;
		}


		var $btn = $('<i class="edit">&#xe600;</i>'),
			$p = $ ('<p>' + spe.name + '</p>'),
			$div = $('<div data-name="' + spe.name + '"></div>');

		$btn.click(onSpeClick);
		$div.click(switchSpe);

		$speContainer.prepend($div.append([ $btn, $p ]));
	}


	for (var i in exists) {
		exists[i].remove();
		delete specialites[i];
	}

});





// Hide

var currentSpe = null;

function speFadeOut() {
	
	$cacheSpe.fadeOut();
	$speAddPanel.fadeOut();
	$spePanel.fadeOut();

	if (currentSpe)
		App.cmd("setSpeOpt", {
			name: currentSpe,
			users: $spePanelUsers.pedit(),
			seq: $spePanelSelect.val()
		});


	currentSpe = null;
}


$cacheSpe.click(speFadeOut);






// Bouton d'ajout

$("#addSpeBtn").click(function() {
	$cacheSpe.fadeIn();
	$speAddPanel.fadeIn();
});


$speAddPanel.find("button").click(function() {
	App.cmd("addSpe", { name: $speAddPanel.find("input").val() });
	speFadeOut();
});





// Bouton suppression

$spePanel.find(".delete").click(function() {
	App.cmd("deleteSpe", { name: currentSpe });
	currentSpe = null;
	speFadeOut();
});





// Affichage d'une spécialité

function onSpeClick(e) {

	e.stopPropagation();

	var name = currentSpe = $(this).parent().attr("data-name");
	$spePanelH3.text(name);

	$spePanelUsers.pedit(specialites[name].users.join(" "));
	$spePanelSelect.val(specialites[name].seq || 'empty');

	$cacheSpe.fadeIn();
	$spePanel.fadeIn();
}





// Activation d'sactivation

function switchSpe(e) {

	App.cmd("activeSpe", {
		name: $(this).attr("data-name"),
		value: !$(this).hasClass('active')
	});
}


/*

Séquences

*/


// jQuery
var $seqContainer = $("#sequences"),
	$seqAddPanel = $("#seqAddPanel"),
	$seqPanel = $("#seqPanel"),
	$seqPanelH3 = $seqPanel.find("h3 span"),
	$seqPanelText = $seqPanel.find("pre"),
	$cacheSeq = $("#cacheSeq");


var sequences = {};



// Update
App.addEventListener("set-Sequences", function(e) {
	
	var obj = e.message.value,
		seqOptions = [];

	var $exist = $seqContainer.children(),
		exists = {};

	$exist.each(function(index, element) {
		var el = $(element);

		if (el.attr("data-name"))
			exists[el.attr("data-name")] = el;
	});


	for (var i = 0; i < obj.length; i++) {

		var seq = obj[i];
		seqOptions.push('<option value="' + seq.name + '">' + seq.name + '</option>');

		if (!sequences[seq.name])
			sequences[seq.name] = { name: seq.name, cmds: [] };

		sequences[seq.name].cmds = seq.cmds;

		if (exists[seq.name]) {
			delete exists[seq.name];
			continue;
		}


		$div = $('<div data-name="' + seq.name + '">' + seq.name + '</div>');
		$div.click(onSeqClick);

		$seqContainer.prepend($div);
	}


	for (var i in exists) {
		exists[i].remove();
		delete sequences[i];
	}


	var $select = $('.selectSeq'),
		$options = $(seqOptions.join());

	$select.each(function() {
		var $this = $(this),
			select = $this.val();

		if (!$this.is(':focus')) {
			$this.empty().append($options.clone());

			if ($this.hasClass('firstEmpty'))
				$this.prepend('<option value="empty"></option>');

			if (select)
				$this.val(select);
		}
	});

});






// Hide

var currentSeq = null;


function seqFadeOut() {
	
	$cacheSeq.fadeOut();
	$seqAddPanel.fadeOut();
	$seqPanel.fadeOut();

	if (currentSeq)
		App.cmd("setSeqCmds", { name: currentSeq, cmds: $seqPanelText.text() });

	currentSeq = null;
}


$cacheSeq.click(seqFadeOut);






// Bouton d'ajout

$("#addSeqBtn").click(function() {

	$cacheSeq.fadeIn();
	$seqAddPanel.fadeIn();
});


$seqAddPanel.find("button").click(function() {
	App.cmd("addSequence", { name: $seqAddPanel.find("input").val() });
	seqFadeOut();
});





// Bouton suppression

$seqPanel.find(".delete").click(function() {
	App.cmd("deleteSequence", { name: currentSeq });
	currentSeq = null;
	seqFadeOut();
});






// Affichage d'une séquence

function onSeqClick() {

	var name = currentSeq = $(this).attr("data-name");
	$seqPanelH3.text(name);

	setSeqPanelTxt(sequences[name].cmds.join("\n"));


	$cacheSeq.fadeIn();
	$seqPanel.fadeIn();
}







// Coloration du texte

function setSeqPanelTxt(text) {


	text = text.replace(/"([^"\n]+)(["\n]?)/g, '<span style="color:#7977B0">"$1$2</span>');

	for (var i = 0; i < seqCmdWords.length; i++)
		text = text.replace(new RegExp('(\\b' + seqCmdWords[i] + '\\b)', 'g'), '<span style="color:#F06666">$1</span>');

	
	$seqPanelText.html(text);
}



$seqPanelText.bind("input", function(e) {

	var text = $(this).text();
	var caretPos = getCaretPosIn(this);

	setSeqPanelTxt(text);

	setCaretPosIn(this, caretPos);

}).keydown(function(e) {
	
	if (e.keyCode == 13) {
		var pos = getCaretPosIn(this);
		$seqPanelText.html($(this).text().splice(pos, 0, "\n"));
		setCaretPosIn(this, pos + 1);
	}

});
/*

Fichier de gestion du panel sur la droite

*/




/* Bouton activeAll */


var $btnAAOff = $("#btn-activeOnAll"),
	$btnAAOn = $("#btn-unactiveOnAll");


// Bouton "Activer sur tous"
$btnAAOff.click(function() {
	App.post("activePC", { ip: "all" });
	App.update();
});


// Bouton "Désactiver sur tous"
$btnAAOn.click(function() {
	App.post("unactivePC", { ip: "all" });
	App.update();
});


// Event: changer le boutton
App.addEventListener("set-activeAll", function(e) {

	$btnAAOff.hide();
	$btnAAOn.hide();

	if (e.message.value)
		$btnAAOn.css("display", "block");
	else
		$btnAAOff.css("display", "block");
});






/* Bouton sequences */

var $btnSeqOff = $("#btn-seqOff"),
	$btnSeqOn = $("#btn-seqOn"),
	$selectSeq = $("#select-seq");


// Bouton "Activer séquences"
$btnSeqOn.click(function() {

	App.cmd("seqOn", {
		value: true,
		seq: $selectSeq.val()
	});
});



// Bouton "Désactiver séqunces"
$btnSeqOff.click(function() {
	App.cmd("seqOn", { value: false });
});



// Event: changer le boutton
App.addEventListener("set-seqOn", function(e) {

	$btnSeqOn.hide();
	$btnSeqOff.hide();

	if (e.message.value)
		$btnSeqOff.css("display", "block");
	else
		$btnSeqOn.css("display", "block");
});
