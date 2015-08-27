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











