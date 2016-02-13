var canvas = document.getElementById("myCanvas");
	stage = new createjs.Stage("myCanvas"),
	bkg = new createjs.Shape(),

	loader = new createjs.LoadQueue(false);

var Utils = {
	centerBitmap:function(bitmap){
		bitmap.regX = bitmap.image.width/2;
		bitmap.regY = bitmap.image.height/2;

		Utils.centerObj(bitmap);
	},

	centerObj:function(obj) {
		obj.x = canvas.width/2;
		obj.y = canvas.height/2;
	}
}

var slides = [
	{
		init:function(){
			var container = new createjs.Container(),
	  			gif = new createjs.Bitmap(loader.getResult("animation_1"));

	  		Utils.centerBitmap(gif);
	  		gif.alpha = 0;

	  		container.addChild(gif);

	  		this.title = "intro"
	  		this.screen_obj = {
	  			container:container,
	  			gif:gif
	  		};

		},

		anim:function(){
			var def = $.Deferred(),
				anim = new TimelineLite({paused:true}),
				screen = this.screen_obj;

			anim.add(function(){
					screen.gif.alpha = 0.4;
					stage.update();
				});

			anim.to(screen.gif, 1, {x:1000})
				.play();

			
			return(def.promise());
		}
	}
]