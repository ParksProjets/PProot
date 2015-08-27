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