
var Rendering = {
	slide_idx:0,

	init: function(){
		createjs.Ticker.setFPS(60);
		createjs.Ticker.addEventListener("tick", stage);

		// window.addEventListener('resize', this.initStage, false);
	},

	load: function(){
		var def = $.Deferred();

		var loadManifest = [
			{
				id:"watercolor_1",
				src:"images/watercolor_1.png"
			},
			{
				id:"watercolor_2",
				src:"images/watercolor_2.png"
			},
			{
				id:"watercolor_3",
				src:"images/watercolor_3.png"
			},
			{
				id:"watercolor_4",
				src:"images/watercolor_4.png"
			}
		]

		_.range(1,23).forEach(function(idx){
			loadManifest.push({
				id:"animation_" + idx,
				src:"images/logo/Layer " + idx + ".png"
			});
		});


		loader.loadManifest(loadManifest);
		loader.on("complete", function(e){

			def.resolve();

		});

		return(def.promise());
	},

	initStage:function(){
		window.slide_title = new createjs.Text("slide title", "15px Helvetica", "grey");
		
		slide_title.textAlign = "left";
		slide_title.x = 10;
		slide_title.y = 10;
		
		canvas.width = document.body.clientWidth;
		canvas.height = document.body.clientHeight;

		bkg.graphics.beginFill("black").drawRect(0,0, canvas.width, canvas.height);

			stage.addChild(bkg);
		stage.addChild(slide_title);

		slides.forEach(function(slide) {
			slide.init();
			stage.addChild(slide.screen_obj.container);

		});

		stage.update();
	},

	shiftSlides:function(idx) {
		var next_slide = Rendering.slide_idx + 1;

		next_slide = (next_slide >= slides.length)?0:next_slide;
		Rendering.slide_idx = next_slide;
		
		Rendering.animateSlides(Rendering.slide_idx);
		
	},

	animateSlides:function(slide_idx) {
		var slide = slides[slide_idx];
		
		slide_title.text = slide.title;

		slide.entrance().done(function(){
			slide.loop();

			window.onkeydown = function(e){
				window.onkeydown = null;

				slide.exit().done(function(){
					Rendering.shiftSlides();
				});
			}	
			
		});
	},

	initSlides:function(){
		
		Rendering.animateSlides(0);
	}

}




Rendering.init();
Rendering.load().done(function(){
	
	Rendering.initStage();

	Rendering.initSlides();

});

