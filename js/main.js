
var Rendering = {
	init: function(){
		createjs.Ticker.setFPS(60);
		createjs.Ticker.addEventListener("tick", ctrl.stage);

		// window.addEventListener('resize', this.initStage, false);
	},

	load: function(){
		var def = $.Deferred(),
			loader = ctrl.loader;

		var loadManifest = [];

		createjs.Sound.registerSound("audio/Luis_Rodriguez.mp3", "luis_audio_poem");

		loadManifest.push({
			id:"usdac_logo",
			src:"images/logo/usdac_logo.png"
		});

		loadManifest.push({
			id:"staff",
			src:"images/other/staff.png"
		});

		loadManifest.push({
			id:"word_cloud_1",
			src:"images/other/word_cloud.png"
		});

		loadManifest.push({
			id:"word_cloud_2",
			src:"images/other/word_cloud2.png"
		});

		_.range(1,6).forEach(function(idx){
			loadManifest.push({
				id:"watercolor_" + idx,
				src:"images/water_color/watercolor_" + idx + ".png"
			});
		});

		_.range(1,23).forEach(function(idx){
			loadManifest.push({
				id:"animation_" + idx,
				src:"images/logo/Layer " + idx + ".png"
			});
		});

		_.range(1,6).forEach(function(idx){
			
			loadManifest.push({
				id:"story_" + idx,
				src:"images/story_images/story_" + idx + ".png"
			});
		});

		var grant_pics = [1,3,4,5,9,13,14,18,19,20,22,24,29,30,33,35,37,40,41,46,48];
		grant_pics.forEach(function(idx){
			
			loadManifest.push({
				id:"grant_" + idx,
				src:"images/final_images/grant/grant_" + idx + ".png"
			});
		});

		var t_pics = [1,6,7,10,11,17,19,20,21,22,23,25,27,28,29];
		t_pics.forEach(function(idx){
			
			loadManifest.push({
				id:"t_" + idx,
				src:"images/final_images/t/t_" + idx + ".png"
			});
		});

		var jena_pics = [2, 3, 4, 5, 6, 7, 8];
		jena_pics.forEach(function(idx){
			
			loadManifest.push({
				id:"jena_" + idx,
				src:"images/final_images/jena/jena.00" + idx + ".png"
			});
		});

		var luis_pics = [1,2,3,4];
		luis_pics.forEach(function(idx){
			
			loadManifest.push({
				id:"l_" + idx,
				src:"images/final_images/luis/luis_" + idx + ".png"
			});
		});
		loader.loadManifest(loadManifest);
		loader.on("progress", function(e){
			console.log(".....loaded " + String(Math.round(e.progress*100)) + "%.....");
		});

		loader.on("complete", function(e){

			def.resolve();

		});

		return(def.promise());
	},

	initStage:function(){
		var canvas = ctrl.canvas,
			stage = ctrl.stage
			bkg = 		new createjs.Shape();
		
		window.slide_title = new createjs.Text("slide title", "15px Helvetica", "grey");
		
		slide_title.textAlign = "left";
		slide_title.x = 10;
		slide_title.y = 10;
		
		canvas.width = document.body.clientWidth;
		canvas.height = document.body.clientHeight;

		bkg.graphics.beginFill("black").drawRect(0,0, canvas.width, canvas.height);

		stage.addChild(bkg);
		console.log("-------------");
		console.log("slide listing");

		slides.forEach(function(slide, idx) {	
			console.log(idx  + ":" + slide.title);
		
			slide.init();
			stage.addChild(slide.screen_obj.container);

		});

		console.log("-------------");


		var usdac_logo = new createjs.Bitmap(ctrl.loader.getResult("usdac_logo"));
		
		usdac_logo.scaleX = usdac_logo.scaleY = 0.2;
		usdac_logo.x = ctrl.canvas.width - 100;
		usdac_logo.y = ctrl.canvas.height - 100;
		usdac_logo.alpha = 0.7;
		slide_title.alpha = 0;

		ctrl.usdac_logo = usdac_logo;

		stage.addChild(usdac_logo);

		stage.addChild(slide_title);

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
		
		slide_title.text = (slide_idx+1) + " - " + slide.title;

		console.log((slide_idx+1) + " " + slide.title);
		
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
		Rendering.slide_idx = ctrl.start_slide;
		Rendering.animateSlides(ctrl.start_slide);
	}

}
