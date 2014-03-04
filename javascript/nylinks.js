if (typeof ic == "undefined") ic = {};

$(document).ready(function() {

	ic._init = function() {
		ic.vars = {};
		ic.vars.i_width = 290;
		ic.vars.i_duration = 20000;
		
		//loop images
		setInterval(ic.misc.loop, ic.vars.i_duration);
		//folder collapse/expand
		ic.misc.folder_expand();
	}//end init
	
	ic.misc = function() {
		return {
			
			loop: function() {
				var el_cycle = $('.cycle .inner');
				var el_cycle_items = el_cycle.children();
				var i_left = parseInt(el_cycle.css('left')) - ic.vars.i_width;
				var i_min = (el_cycle_items.length * ic.vars.i_width);
				
				//select first image
				var el_img = el_cycle_items.first();

				el_cycle.animate({'left':i_left+'px'},1000, 'linear', 
					function(){
						//move to end
						el_cycle.append(el_img);
						el_cycle.css('left', '0px');
					}
				);

			}//end super
			
			,folder_expand: function() {
				$('.folder').each(function(i, o) {
					var el_plus = $('em', o);
					var el_next = $(this).next();
					if(el_next.hasClass('folder_block')) {
						$(o).click(function() {
							if(el_next.hasClass('hidden')) {
								el_next.removeClass('hidden');
								el_next.addClass('show');
								el_plus.text('-');	
							}
							else {
								el_next.removeClass('show');
								el_next.addClass('hidden');
								el_plus.text('+');
							}
						});
					}
					
				});
			}
		}//end return
	}();//end ic.misc
	
	ic._init();
});