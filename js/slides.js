var slides = [
	{	
		title:"intro",

		init:function(){
			var container = new createjs.Container(),
	  			gif = new createjs.Bitmap(loader.getResult("animation_1"));

	  		Utils.centerBitmap(gif);
	  		gif.alpha = 0;

	  		container.addChild(gif);

	  		this.screen_obj = {
	  			container:container,
	  			gif:gif
	  		};

		},

		entrance:function(){
			var def = $.Deferred(),
				anim = new TimelineLite({paused:true}),
				screen = this.screen_obj;

			anim.fromTo(screen.gif, 1, {scaleX:1, scaleY:1, alpha:0}, {alpha:1})
				.add(def.resolve)
				.play();

			
			return(def.promise());
		},

		loop:function(){
			var screen = this.screen_obj;

			this.looping_anim = new TimelineLite({paused:true}),
			
			this.looping_anim.append(
					TweenMax.fromTo(screen.gif, 0.3,  {scaleY:1, scaleX:1}, {scaleX:0.9, scaleY:0.9, yoyo:true, repeat:-1})
				)
				.play();
		},

		exit:function(){
			var def = $.Deferred(),
				anim = new TimelineLite({paused:true}),
				screen = this.screen_obj;

			this.looping_anim.stop();
			this.looping_anim.clear();

			anim.to(screen.gif, 1, {alpha:0})
				.add(def.resolve)
				.play();

			return(def.promise());

		}
	},

	{	
		title:"preamble",

		init:function(){
			var container = new createjs.Container(),
	  			gif = new createjs.Bitmap(loader.getResult("animation_2"));

	  		Utils.centerBitmap(gif);
	  		gif.alpha = 0;

	  		container.addChild(gif);

	  		this.screen_obj = {
	  			container:container,
	  			gif:gif
	  		};

		},

		entrance:function(){
			var def = $.Deferred(),
				anim = new TimelineLite({paused:true}),
				screen = this.screen_obj;

			anim.fromTo(screen.gif, 1, {scaleX:1, scaleY:1, alpha:0}, {alpha:1})
				.add(def.resolve)
				.play();

			
			return(def.promise());
		},

		loop:function(){
			var screen = this.screen_obj;

			this.looping_anim = new TimelineLite({paused:true}),
			
			this.looping_anim.append(
					TweenMax.fromTo(screen.gif, 0.3,  {scaleY:1, scaleX:1}, {scaleX:0.9, scaleY:0.9, yoyo:true, repeat:-1})
				)
				.play();
		},

		exit:function(){
			var def = $.Deferred(),
				anim = new TimelineLite({paused:true}),
				screen = this.screen_obj;

			this.looping_anim.stop();
			this.looping_anim.clear();

			anim.to(screen.gif, 1, {alpha:0})
				.add(def.resolve)
				.play();

			return(def.promise());

		}
	}
]