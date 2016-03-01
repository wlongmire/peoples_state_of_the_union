var ctrl = {};

ctrl.canvas = 	document.getElementById("myCanvas");
ctrl.stage = 	new createjs.Stage("myCanvas");
ctrl.loader = 	new createjs.LoadQueue(false);
ctrl.start_slide = 	0;
ctrl.youth_poets = [

	{
		name:"Sabrina Slipchenko",
		title:"48",
		line1_add:-790,
		line2_add:-1290,
		images:["grant_9", "grant_5", "grant_35", "grant_24", "t_1"]
	},
	
	{
		name:"Shaneka Briggs",
		title:"Where I Come From",
		line1_add:-900,
		line2_add:-1030,
		images:["t_17", "t_19", "t_20", "t_21", "grant_18"]
	},

	{
		name:"Kassidi Jones",
		title:"A Tour of Michael Slager's House",
		line1_add:-1000,
		line2_add:-900,
		images:["grant_3", "grant_41", "grant_4", "t_10", "grant_46"]
	},
	
	{
		name:"Julian Randall",
		title:"Churches",
		line1_add:-930,
		line2_add:-1200,
		images:["t_25", "t_27", "grant_40", "grant_13", "grant_29", "grant_30"]
	},

	{
		name:"David Escobar-Martin",
		title:"My best friend wants to be a burning flag",
		line1_add:-715,
		line2_add:-740,
		images:["grant_1", "grant_33", "grant_37", "grant_14", "t_6", "t_7", "grant_22"]
	}
];

window.ctrl = ctrl;


var Utils = {
	centerBitmap:function(bitmap){
		bitmap.regX = bitmap.image.width/2;
		bitmap.regY = bitmap.image.height/2;

		Utils.centerObj(bitmap);
	},

	centerObj:function(obj) {
		obj.x = ctrl.canvas.width/2;
		obj.y = ctrl.canvas.height/2;
	},

	scaleBkgImage:function(img) {
		img.scaleX = img.scaleY = 0.7;
	},

	buildBkgColor:function(bkg, color) {
		bkg.graphics.beginFill(color).drawRect(0,0, ctrl.canvas.width, ctrl.canvas.height);
	},

	buildBkgGradient:function(bkg, color1, color2) {
		bkg.graphics.beginLinearGradientFill([color1,color2], [0, 1], 0, 0, ctrl.canvas.height, ctrl.canvas.width).drawRect(0, 0, ctrl.canvas.width, ctrl.canvas.height);
	},

	addSlideShowColorLoop:function(params) {
		var loader = ctrl.loader,
			anim = params.anim;

		params.fadeTime = 	params.fadeTime || 1;

		params.colors.forEach(function(color) {

			anim.add(function(){
					Utils.buildBkgColor(params.image2, color);
					params.image2.alpha = 1;
					params.image1.alpha = 1;
				})
				
				.to(params.image1, params.fadeTime, {alpha:0, delay:_.random(params.holdTime, params.holdTime - 0.5), ease:Expo.easeOut})
				
				.add(function(){
					Utils.buildBkgColor(params.image1, color);
					params.image1.alpha = 1;
				});

		});

		return(anim);
	},

	addSlideShowLoop:function(params) {
		var loader = ctrl.loader,
			anim = params.anim;

		params.fadeTime = 	params.fadeTime || 1;

		params.images.forEach(function(image_file) {


			anim.add(function(){
					params.image2.image = loader.getResult(image_file);
					params.image2.alpha = 1;
					params.image1.alpha = 1;
					console.log(image_file);
				})
				
				.to(params.image1, params.fadeTime, {alpha:0, delay:params.holdTime, ease:Expo.easeOut})
				
				.add(function(){
					params.image1.image = loader.getResult(image_file);
					params.image1.alpha = 1;
				});

		});

		return(anim);
	},

	baseSlideFactory:function(params) {
		return(
			{
				title:"",
				init:function(){
					var container = new createjs.Container(),
						loader = ctrl.loader;
						
			  		this.screen_obj = {
			  			container:container
			  		};

				},

				entrance:function(){
					var def = $.Deferred(),
						anim = new TimelineMax({paused:true}),
						screen = this.screen_obj;

					anim.add(def.resolve)
						.play();

					
					return(def.promise());
				},

				loop:function(){
					var screen = this.screen_obj,
						anim  = new TimelineMax({paused:true, repeat:-1});

					anim.play();
					
					this.looping_anim = anim;
				},

				exit:function(){
					var def = $.Deferred(),
						anim = new TimelineMax({paused:true}),
						screen = this.screen_obj;

					this.looping_anim.stop();
					this.looping_anim.clear();

					anim.add(def.resolve)
						.play();

					return(def.promise());

				}
			}
		);
	},

	thanksFactory:function(params) {
		return({
			title:params.title,
			init:function(){
				var container = new createjs.Container(),
					loader = ctrl.loader,
					text_1 = new createjs.Text(params.text_1.text, params.text_1.font, "white"),
					text_2 = new createjs.Text(params.text_2.text, params.text_2.font, "white"),
					text_3 = new createjs.Text(params.text_3.text, params.text_3.font, "white");

				text_1.lineWidth = 1100;
				text_1.textAlign = "center";

				text_1.x = ctrl.canvas.width/2;//params.text_1.x;
				text_2.x = params.text_2.x;
				text_3.x = params.text_3.x;

				text_1.y = params.text_1.y;
		  		text_2.y = params.text_2.y;
		  		text_3.y = params.text_3.y;

		  		text_1.alpha = text_2.alpha = text_3.alpha = 0
		  		
		  		container.addChild(text_1);
		  		container.addChild(text_2);
		  		container.addChild(text_3);
		  		
		  		this.screen_obj = {
		  			container:container,

		  			text_1:text_1,
		  			text_2:text_2,
		  			text_3:text_3
		  		};

			},

			entrance:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				anim.fromTo(screen.text_1, 1, {alpha:0}, {alpha:1, ease:Expo.easeOut})
					.fromTo(screen.text_2, 1, {alpha:0}, {alpha:1, ease:Expo.easeOut})
					
					.fromTo(screen.text_3, 1, {alpha:0}, {alpha:1, ease:Expo.easeOut})

				anim.add(def.resolve)
					.play();

				
				return(def.promise());
			},

			loop:function(){
				var screen = this.screen_obj,
					anim  = new TimelineMax({paused:true, repeat:-1});

				anim.play();
				
				this.looping_anim = anim;
			},

			exit:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				this.looping_anim.stop();
				this.looping_anim.clear();

				anim.addLabel("hide")
					.to(screen.text_1, 3, {alpha:0, y:"+=200", ease:Expo.easeOut}, "hide")
					.to(screen.text_2, 3, {alpha:0, y:"+=200", ease:Expo.easeOut}, "hide")
					.to(screen.text_3, 3, {alpha:0, y:"+=200", ease:Expo.easeOut}, "hide")

					.add(def.resolve)
					.play();

				return(def.promise());

			}
		});
	},

	twoTextFactory:function(params) {
		return({
			title:params.title,
			init:function(){
				var container = new createjs.Container(),
					loader = ctrl.loader,
					text_1 = new createjs.Text(params.text_1.text, params.text_1.font, "white"),
					text_2 = new createjs.Text(params.text_2.text, params.text_2.font, "white");

				text_1.lineWidth = 1100;
				text_1.textAlign = "center";

				text_1.x = ctrl.canvas.width/2;//params.text_1.x;
				text_2.x = ctrl.canvas.width/2 - text_2.getMeasuredWidth() + 50;//params.text_2.x;
				
				text_1.y = params.text_1.y;
		  		text_2.y = params.text_2.y;

		  		text_1.alpha = text_2.alpha = 0
		  		
		  		container.addChild(text_1);
		  		container.addChild(text_2);
		  		
		  		this.screen_obj = {
		  			container:container,

		  			text_1:text_1,
		  			text_2:text_2
		  		};

			},

			entrance:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				anim.fromTo(screen.text_1, 3, {alpha:0}, {alpha:1, delay:1, ease:Expo.easeOut})
					.fromTo(screen.text_2, 1.5, {alpha:0}, {alpha:1, delay:0.5, ease:Expo.easeOut})

				anim.add(def.resolve)
					.play();

				
				return(def.promise());
			},

			loop:function(){
				var screen = this.screen_obj,
					anim  = new TimelineMax({paused:true, repeat:-1});

				anim.play();
				
				this.looping_anim = anim;
			},

			exit:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				this.looping_anim.stop();
				this.looping_anim.clear();

				anim.addLabel("hide")
					.to(screen.text_1, 3, {alpha:0, y:"+=200", ease:Expo.easeOut}, "hide")
					.to(screen.text_2, 3, {alpha:0, y:"+=200", ease:Expo.easeOut}, "hide")

					.add(def.resolve)
					.play();

				return(def.promise());

			}
		});
	},

	threeTextFactory:function(params) {
		return({
			title:params.title,
			init:function(){
				var container = new createjs.Container(),
					loader = ctrl.loader,
					text_1 = new createjs.Text(params.text_1.text, params.text_1.font, "white"),
					text_2 = new createjs.Text(params.text_2.text, params.text_2.font, "white"),
					text_3 = new createjs.Text(params.text_3.text, params.text_3.font, "white");

				text_1.lineWidth = 1100;
				text_1.textAlign = "center";

				text_1.x = ctrl.canvas.width/2;//params.text_1.x;
				text_2.x = ctrl.canvas.width/2 - text_2.getMeasuredWidth() + 50;//params.text_2.x;
				text_3.x = ctrl.canvas.width/2 - text_2.getMeasuredWidth() + 50;//params.text_3.x;

				text_1.y = params.text_1.y;
		  		text_2.y = params.text_2.y;
		  		text_3.y = params.text_3.y;

		  		text_1.alpha = text_2.alpha = text_3.alpha = 0
		  		
		  		container.addChild(text_1);
		  		container.addChild(text_2);
		  		container.addChild(text_3);
		  		
		  		this.screen_obj = {
		  			container:container,

		  			text_1:text_1,
		  			text_2:text_2,
		  			text_3:text_3
		  		};

			},

			entrance:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				anim.fromTo(screen.text_1, 1, {alpha:0}, {alpha:1, ease:Expo.easeOut})
					.fromTo(screen.text_2, 1, {alpha:0}, {alpha:1, ease:Expo.easeOut})
					
					.fromTo(screen.text_3, 1, {alpha:0}, {alpha:1, ease:Expo.easeOut})

				anim.add(def.resolve)
					.play();

				
				return(def.promise());
			},

			loop:function(){
				var screen = this.screen_obj,
					anim  = new TimelineMax({paused:true, repeat:-1});

				anim.play();
				
				this.looping_anim = anim;
			},

			exit:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				this.looping_anim.stop();
				this.looping_anim.clear();

				anim.addLabel("hide")
					.to(screen.text_1, 3, {alpha:0, y:"+=200", ease:Expo.easeOut}, "hide")
					.to(screen.text_2, 3, {alpha:0, y:"+=200", ease:Expo.easeOut}, "hide")
					.to(screen.text_3, 3, {alpha:0, y:"+=200", ease:Expo.easeOut}, "hide")

					.add(def.resolve)
					.play();

				return(def.promise());

			}
		});
	},

	preambleIntroFactory:function(params) {
		params = {
			title: "Preamble Intro",
			text_1:{
				text:"The Poetic Preamble",
				font:"70px Cabin",
				color:"white",	
				x:400,
				y:80
			},
			text_2:{
				text:"Where in some of Philadelphia's boldest young poets\npresent their words of change to you and to the world\nby way of introduction.",
				font:"26px Source Sans Pro",
				color:"#cccccc",
				lineWidth:200,
				x:160,
				y:230
			},
			text_3:{
				text:params.text,
				font:"25px Source Sans Pro",
				color:"#cccccc",
				x:160,
				y:270 + 50
			},
			text_4:{
				text:"David Escobar-Martin",
				font:"60px Cabin",
				color:"white",
				x:160,
				y:300 + 50
			},

			color1:params.color1,
			color2:params.color2
		}

		return(
			{
				title:params.title,
				init:function(){
					var container = new createjs.Container(),
						loader = ctrl.loader,

						staff_1 = new createjs.Bitmap(loader.getResult("staff")),
						staff_2 = new createjs.Bitmap(loader.getResult("staff")),

						color_splash = new createjs.Bitmap(loader.getResult("watercolor_5")),

						title_text 	= new createjs.Text(params.text_1.text, params.text_1.font, params.text_1.color),
						sub_text 	= new createjs.Text(params.text_2.text, params.text_2.font, params.text_2.color),

						sub_text_2 	= new createjs.Text(params.text_3.text, params.text_3.font, params.text_3.color),
						sub_text_3 	= new createjs.Text(params.text_4.text, params.text_4.font, params.text_4.color),

						line_1 = new createjs.Shape(),
						line_2 = new createjs.Shape(),

						bkg = new createjs.Shape();

					title_text.textAlign = "center";
					title_text.x = ctrl.canvas.width/2;
					title_text.y = params.text_1.y;

					title_text.alpha = 0;

					line_1.graphics.beginFill('white').drawRect(0,0, title_text.getMeasuredWidth() + 160, 3);
					line_2.graphics.beginFill('white').drawRect(0,0, title_text.getMeasuredWidth() + 160, 3);
					
					line_1.x = title_text.x - (title_text.getMeasuredWidth() + 160)/2;
					line_1.y = title_text.y;
					
					line_2.x = title_text.x - (title_text.getMeasuredWidth() + 160)/2;
					line_2.y = title_text.y + 90;
					
					line_1.alpha = 0;
					line_2.alpha = 0;
					
					staff_1.scaleX = staff_1.scaleY = staff_2.scaleX = staff_2.scaleY = 0.25;
					staff_1.y = title_text.y + 20;
					staff_2.y = title_text.y + 70;
					
					staff_1.x = title_text.x + 350;
					staff_2.x = title_text.x - 350;
					staff_2.rotation = 180;
					
					staff_1.alpha = 0;
					staff_2.alpha = 0;
					
					color_splash.scaleX = color_splash.scaleY = 0.3;
					color_splash.x = title_text.x - 490;
					color_splash.y = title_text.y - 160;
					
					color_splash.alpha = 0;

					sub_text.x = ctrl.canvas.width/2 - title_text.getMeasuredWidth()/2 + 45;
					sub_text.y = params.text_2.y + 70;
					sub_text.lineWidth = title_text.getMeasuredWidth();
					sub_text.lineHeight = 40;

					sub_text.alpha = 0;

					sub_text_2.textAlign = "center";
					sub_text_2.x = ctrl.canvas.width/2;
					sub_text_2.y = params.text_3.y;
					
					sub_text_2.alpha = 0;

					sub_text_3.textAlign = "center";
					sub_text_3.x = ctrl.canvas.width/2;
					sub_text_3.y = params.text_4.y;
					
					sub_text_3.alpha = 0;
					
					Utils.buildBkgGradient(bkg, params.color1, params.color2);
					bkg.alpha = 0;

					container.addChild(bkg);
					container.addChild(color_splash);
					
					container.addChild(line_1);
					container.addChild(title_text);
					container.addChild(line_2);
					
					container.addChild(sub_text);
					container.addChild(sub_text_2);
					container.addChild(sub_text_3);

					container.addChild(staff_1);
					container.addChild(staff_2);

			  		this.screen_obj = {
			  			container:container,

			  			color_splash:color_splash,
					
						line_1:line_1,
						title_text:title_text,
						line_2:line_2,
					
						sub_text:sub_text,
						sub_text_2:sub_text_2,
						sub_text_3:sub_text_3,

						staff_1:staff_1,
						staff_2:staff_2,

						bkg:bkg
			  		};

				},

				entrance:function(){
					var def = $.Deferred(),
						anim = new TimelineMax({paused:true}),
						screen = this.screen_obj;

					var line_x = screen.line_1.x;

					anim.addLabel("show_title")
						.fromTo([screen.line_1, screen.line_2], 2, {alpha:0, x:line_x-300}, {alpha:1, x:line_x}, "show_title")
						.to([screen.title_text, screen.staff_1, screen.staff_2], 2, {alpha:1, delay:0.5}, "show_title")
						.to(screen.color_splash, 0.5, {alpha:0.8, ease:Back.easeOut})
						
						.to(screen.sub_text, 0.5, {alpha:0})
						.to(screen.sub_text_2, 1, {alpha:1, delay:1})
						.to(screen.sub_text_3, 1, {alpha:1, delay:1})

						.to(screen.bkg, 1, {alpha:0.7, delay:0.3})
							
						.add(def.resolve)
						.play();

					
					return(def.promise());
				},

				loop:function(){
					var screen = this.screen_obj,
						anim  = new TimelineMax({paused:true, repeat:-1});

					anim.play();
					
					this.looping_anim = anim;
				},

				exit:function(){
					var def = $.Deferred(),
						anim = new TimelineMax({paused:true}),
						screen = this.screen_obj;

					this.looping_anim.stop();
					this.looping_anim.clear();

					var hide_arr = [screen.line_1, screen.line_2, screen.title_text, screen.staff_1, screen.staff_2, screen.color_splash, screen.sub_text_2, screen.sub_text_3];

					anim.addLabel("hide")
						.to(hide_arr, 1, {alpha:0, x:"-=100"}, "hide")
						.to(screen.bkg, 1, {alpha:0})
						.add(def.resolve)
						.play();

					return(def.promise());

				}
			}
		);
	},

	preamblePoetFactory:function(params){
		params = {
			title:"Preamble poem " + params.idx,
			text_1:{
				text:params.name,
				x:150,
				y:200 + 130,
				font:"70px Cabin",
				color:"white"
			},
			text_2:{
				text:"\"" + params.title + "\"",
				x:150,
				y:200 + 130 + 90,
				font:"37px Source Sans Pro",
				color:"white"
			},
			line1_add:params.line1_add,
			line2_add:params.line2_add,
			images:params.images
		};

		return({
			title:params.title,

			init:function(){
				var container = new createjs.Container(),
					loader = ctrl.loader,
					text_1 = new createjs.Text(params.text_1.text, params.text_1.font, params.text_1.color),
					text_2 = new createjs.Text(params.text_2.text, params.text_2.font, params.text_2.color);
					line = new createjs.Shape(),
					line_2 = new createjs.Shape();
					
					box = new createjs.Shape(),

					bkg_container = new createjs.Container(),
					bkg_1 = new createjs.Bitmap(loader.getResult(params.images[params.images.length-1])),
					bkg_2 = new createjs.Bitmap(loader.getResult(params.images[params.images.length-1]));
					
				text_1.lineWidth = 1100;

				text_1.x = params.text_1.x;
				text_2.x = params.text_2.x;
				
				text_1.y = params.text_1.y;
		  		text_2.y = params.text_2.y;
		  		
		  		text_1.alpha = text_2.alpha = 0;

		  		line.graphics.beginFill(text_1.color).drawRect(0,0, 1500, 5)
		  		line.x = 0;
		  		line.y = text_1.y;
		  		line.alpha = 0;


		  		line_2.graphics.beginFill("white").drawRect(0,0, 1500, 2)
		  		line_2.x = 0;
		  		line_2.y = text_2.y;
		  		line_2.alpha = 0;

		  		box.graphics.beginFill("black").drawRect(0,0, text_1.getMeasuredWidth(), 150);
		  		box.x = text_1.x - 10;
		  		box.y = text_1.y + 170;
		  		box.alpha = 0;

		  		bkg_1.alpha = bkg_2.alpha = 0;
		  		Utils.scaleBkgImage(bkg_1);
		  		Utils.scaleBkgImage(bkg_2);
		  		
		  		bkg_1.scaleX = bkg_1.scaleY = bkg_2.scaleX = bkg_2.scaleY = 0.5;

		  		Utils.centerBitmap(bkg_1);
		  		Utils.centerBitmap(bkg_2);

		  		bkg_container.addChild(bkg_2);
		  		bkg_container.addChild(bkg_1);
				
				container.addChild(bkg_container);

				container.addChild(box);
		  		container.addChild(line);
		  		container.addChild(line_2);
		  		
		  		container.addChild(text_1);
		  		container.addChild(text_2);

		  		this.screen_obj = {
		  			container:container,

		  			line_1:line,
		  			line_2:line_2,

		  			text_1:text_1,
		  			text_2:text_2,

		  			bkg_container:bkg_container,
		  			bkg_1:bkg_1,
		  			bkg_2:bkg_2,

		  			box:box
		  		};

			},

			entrance:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				anim.addLabel("show")
					.fromTo(screen.line_1, 4, {x:-1500, alpha:0}, {alpha:1, x:params.line1_add, ease:Expo.easeOut}, "show")
					.fromTo(screen.line_2, 3, {x:-1500, alpha:0}, {alpha:1, x:params.line2_add, ease:Expo.easeOut}, "show")
					
					.fromTo(screen.text_1, 4, {alpha:0}, {alpha:1, delay:0.5}, "show")
					.fromTo(screen.text_2, 2, {alpha:0}, {alpha:1, delay:0.5}, "show")
										
					.addLabel("down")
					.to(screen.line_1, 	1.6, {y:"+=180", ease:Sine.easeInOut}, "down")
					.to(screen.line_2, 	1.6, {y:"+=180", ease:Sine.easeInOut}, "down")
					
					.to(screen.text_1, 	1.6, {y:"+=180", ease:Sine.easeInOut}, "down")
					.to(screen.text_2, 	1.6, {y:"+=180", ease:Sine.easeInOut}, "down")
					.to(screen.box, 	1.6, {alpha:0.5}, "down")
					.fromTo(screen.bkg_1, 2, {alpha:0}, {alpha:1, delay:1}, "down")

					.addLabel("line_back")
					.to(screen.line_1, 3, {x:"-=1000", ease:Expo.easeOut}, "line_back")
					.to(screen.line_2, 3, {x:"-=1000", ease:Expo.easeOut}, "line_back")

					.add(def.resolve)
					.play();

				
				return(def.promise());
			},

			loop:function(){
				var screen = this.screen_obj,
				anim  = new TimelineMax({paused:true, repeat:-1});

				anim = Utils.addSlideShowLoop({fadeTime:3, holdTime:3, container:screen.bkg_container, anim:anim, images:params.images, image1:screen.bkg_1, image2:screen.bkg_2});
				anim.play();
			
				this.looping_anim = anim;
			},

			exit:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				this.looping_anim.stop();
				this.looping_anim.clear();

				anim.addLabel("hide")
					.to(screen.bkg_1, 	3, {alpha:0, ease:Expo.easeOut}, "hide")
					.to(screen.bkg_2, 	3, {alpha:0, ease:Expo.easeOut}, "hide")

					.to(screen.text_1, 	3, {alpha:0, y:"-=40", ease:Expo.easeOut, delay:1}, "hide")
					.to(screen.text_2, 	3, {alpha:0, y:"-=40", ease:Expo.easeOut, delay:1}, "hide")
					.to(screen.box, 	3, {alpha:0, y:"-=40", ease:Expo.easeOut, delay:1}, "hide")
					.to(screen.line_1, 	3, {alpha:0, y:"-=40", ease:Expo.easeOut, delay:1}, "hide")
					.to(screen.line_2, 	3, {alpha:0, y:"-=40", ease:Expo.easeOut, delay:1}, "hide")
					
					.add(def.resolve)
					.play();

				return(def.promise());

			}
		});
	},

	addressIntroFactory:function(params) {
		params = {
			title: "Address Intro",
			colors:["#422c51", "#0c2f89", "#89250c"],
			text_1:{
				text:"The Poetic Address to the Nation",
				font:"70px Cabin",
				color:"white",	
				x:400,
				y:80
			},
			text_2:{
				text:"And Now, Please Welcome Your Poetic Address MC",
				font:"35px Source Sans Pro",
				color:"#cccccc",
				x:160,
				y:270 + 50
			},
			text_3:{
				text:"Yolanda Wisher",
				font:"70px Cabin",
				color:"white",
				x:160,
				y:300 + 70
			},

			color1:params.color1,
			color2:params.color2,
		}

		return(
			{
				title:params.title,
				init:function(){
					var container = new createjs.Container(),
						loader = ctrl.loader,

						// staff_1 = new createjs.Bitmap(loader.getResult("staff")),
						// staff_2 = new createjs.Bitmap(loader.getResult("staff")),

						color_splash = new createjs.Bitmap(loader.getResult("watercolor_5")),

						title_text 	= new createjs.Text(params.text_1.text, params.text_1.font, params.text_1.color),
						
						sub_text 	= new createjs.Text(params.text_2.text, params.text_2.font, params.text_2.color),
						sub_text_2 	= new createjs.Text(params.text_3.text, params.text_3.font, params.text_3.color),

						line_1 = new createjs.Shape(),
						line_2 = new createjs.Shape(),

						bkg_2 = new createjs.Shape(),
						bkg_1 = new createjs.Shape();

					title_text.textAlign = "center";
					title_text.x = ctrl.canvas.width/2;
					title_text.y = params.text_1.y;

					title_text.alpha = 0;

					line_1.graphics.beginFill('white').drawRect(0,0, title_text.getMeasuredWidth() + 160, 3);
					line_2.graphics.beginFill('white').drawRect(0,0, title_text.getMeasuredWidth() + 160, 3);
					
					line_1.x = title_text.x - (title_text.getMeasuredWidth() + 160)/2;
					line_1.y = title_text.y;
					
					line_2.x = title_text.x - (title_text.getMeasuredWidth() + 160)/2;
					line_2.y = title_text.y + 90;
					
					line_1.alpha = 0;
					line_2.alpha = 0;
					
					// staff_1.scaleX = staff_1.scaleY = staff_2.scaleX = staff_2.scaleY = 0.25;
					// staff_1.y = title_text.y + 20;
					// staff_2.y = title_text.y + 70;
					
					// staff_1.x = title_text.x + 350;
					// staff_2.x = title_text.x - 350;
					// staff_2.rotation = 180;
					
					// staff_1.alpha = 0;
					// staff_2.alpha = 0;
					
					color_splash.scaleX = color_splash.scaleY = 0.3;
					color_splash.x = title_text.x - 490;
					color_splash.y = title_text.y - 160;
					
					color_splash.alpha = 0;

					sub_text.textAlign = "center";
					sub_text.x = ctrl.canvas.width/2;
					sub_text.y = params.text_2.y;
					
					sub_text.alpha = 0;

					sub_text_2.textAlign = "center";
					sub_text_2.x = ctrl.canvas.width/2;
					sub_text_2.y = params.text_3.y;
					
					sub_text_2.alpha = 0;
					
					Utils.buildBkgGradient(bkg_1, params.color1, params.color2);

					var bkg_container = new createjs.Container();
					bkg_container.addChild(bkg_1);
					bkg_1.alpha = 0;
					
					container.addChild(bkg_container);

					container.addChild(color_splash);
					
					container.addChild(line_1);
					container.addChild(title_text);
					container.addChild(line_2);
					
					container.addChild(sub_text);
					container.addChild(sub_text_2);

					// container.addChild(staff_1);
					// container.addChild(staff_2);

			  		this.screen_obj = {
			  			container:container,

			  			color_splash:color_splash,
					
						line_1:line_1,
						title_text:title_text,
						line_2:line_2,
					
						sub_text:sub_text,
						sub_text_2:sub_text_2,

						// staff_1:staff_1,
						// staff_2:staff_2,

						bkg_container:bkg_container,
						bkg_1:bkg_1
							
			  		};

				},

				entrance:function(){
					var def = $.Deferred(),
						anim = new TimelineMax({paused:true}),
						screen = this.screen_obj;

					var line_x = screen.line_1.x;

					anim.addLabel("show_title")
						.fromTo([screen.line_1, screen.line_2], 2.5, {alpha:0, x:line_x-900}, {alpha:1, x:line_x, ease:Linear.easeOut}, "show_title")
						.to([screen.title_text, screen.staff_1, screen.staff_2], 2, {alpha:1, delay:0.5}, "show_title")
						.to(screen.color_splash, 0.5, {alpha:0.8, ease:Back.easeOut, delay:0.3})
						
						.to(screen.sub_text, 1, {alpha:1, delay:1})
						.to(screen.sub_text_2, 1, {alpha:1, delay:1})

						.addLabel("bkg_in")
						.to(screen.bkg_container, {alpha:0.8}, "bkg_in")
						.to(screen.bkg_1, 1, {alpha:1}, "bkg_in")
						
						.add(def.resolve)
						.play();

					
					return(def.promise());
				},

				loop:function(){
					var screen = this.screen_obj,
						anim  = new TimelineMax({paused:true, repeat:-1});

					// anim = Utils.addSlideShowColorLoop({fadeTime:4, holdTime:0.5, anim:anim, colors:params.colors, image1:screen.bkg_1, image2:screen.bkg_2});
					anim.play();
			
					
					this.looping_anim = anim;
				},

				exit:function(){
					var def = $.Deferred(),
						anim = new TimelineMax({paused:true}),
						screen = this.screen_obj;

					this.looping_anim.stop();
					this.looping_anim.clear();

					var hide_arr = [screen.line_1, screen.line_2, screen.title_text,  screen.color_splash, screen.sub_text, screen.sub_text_2];

					anim.addLabel("hide")
						.to(hide_arr, 1, {alpha:0, x:"-=100"}, "hide")
						.to(screen.bkg_container, 1, {alpha:0})
						.add(def.resolve)
						.play();

					return(def.promise());

				}
			}
		);
	},

	storyFactory:function(params){
		
		var shift_image = 700;

		return(
			{
				title:params.title,
				init:function(){
					var container = new createjs.Container(),
						loader = ctrl.loader,

						title = new createjs.Text("\"" + params.title + "\"", 					"30px Cabin", "white"),
						teller = new createjs.Text(params.storyteller + "'s Story", 			"120px Cabin", "white"),
						place = new createjs.Text(params.place, "25px Source Sans Pro", "white"),
						reader = new createjs.Text("Read By " + params.reader, 					"25px Source Sans Pro", "white"),
						
						line = new createjs.Shape(),

						bkg_1 = new createjs.Bitmap(loader.getResult(params.image)),
						bkg_2 = new createjs.Bitmap(loader.getResult(params.image));
					
					var base_x = 280,
						base_y = 200;
					
					bkg_1.scaleX = bkg_1.scaleY = bkg_2.scaleX = bkg_2.scaleY = 0.5;

					bkg_2.x = bkg_1.image.width/2;// + shift_image;


					line.graphics.beginFill("white").drawRect(0,0, ctrl.canvas.width, 5);
					line.x = 0;
					line.y = base_y + 130;
					line.alpha = 0;

					title.x = 	base_x;
					teller.x = 	base_x;
					place.x = 	base_x + 100;
					reader.x = 	base_x + 100;
					
					title.y = 	base_y;
					teller.y = 	base_y + 15;
					place.y = 	base_y + 145;
					reader.y = 	base_y + 180;

					title.alpha = teller.alpha = place.alpha = reader.alpha = 0;
					
					bkg_1.alpha = 0;
					bkg_2.alpha = 0;

					container.addChild(bkg_1);
					container.addChild(bkg_2);
					
					container.addChild(title);
					container.addChild(teller);
					container.addChild(place);
					container.addChild(reader);
					container.addChild(line);
					
			  		this.screen_obj = {
			  			title:title,
			  			teller:teller,
			  			place:place,
			  			reader:reader,
			  			line:line,

			  			bkg_1:bkg_1,
			  			bkg_2:bkg_2,

			  			container:container
			  		};

				},

				entrance:function(){
					var def = $.Deferred(),
						anim = new TimelineMax({paused:true}),
						screen = this.screen_obj;

					anim.to(screen.teller, 	2, {alpha:1})
						.to(screen.line, 	2, {alpha:1})
						
						.addLabel("show")
						.to(screen.title, 	2, {alpha:1}, "show")

						.to(screen.place, 	2, {alpha:1, delay:1}, "show")
						.to(screen.reader, 	2, {alpha:1, delay:1}, "show")

						.add(def.resolve)

						.addLabel("show_images")
						.to(screen.bkg_1, 	2, {alpha:1}, "show_images")
						.to(screen.bkg_2, 	2, {alpha:1}, "show_images")


						
						.play();

					
					return(def.promise());
				},

				loop:function(){
					var screen = this.screen_obj,
						anim  = new TimelineMax({paused:true, repeat:-1});

					anim.addLabel("scroll_images")
						.to(screen.bkg_1, 20, {x:"-=" + (bkg_1.image.width + (shift_image)), ease:Linear.easeOut}, "scroll_images")
						.to(screen.bkg_2, 20, {x:"-=" + (bkg_1.image.width + (shift_image)), ease:Linear.easeOut}, "scroll_images")
						.add(function(){
							screen.bkg_1.x = 0;
							screen.bkg_2.x = (bkg_1.image.width/2);
						})
						.play();
					
					this.looping_anim = anim;
				},

				exit:function(){
					var def = $.Deferred(),
						anim = new TimelineMax({paused:true}),
						screen = this.screen_obj;

					this.looping_anim.stop();
					this.looping_anim.clear();

					anim.addLabel("hide")
						.to(screen.title, 1, 	{alpha:0}, "hide")
						.to(screen.teller, 1, 	{alpha:0}, "hide")
						.to(screen.place, 1, 	{alpha:0}, "hide")
						.to(screen.reader, 1, 	{alpha:0}, "hide")

						.to(screen.line, 1, 	{alpha:0}, "hide")

						.to(screen.bkg_1, 1, {alpha:0}, "hide")
						.to(screen.bkg_2, 1, {alpha:0}, "hide")

						.add(def.resolve)
						.play();

					return(def.promise());

				}
			}
		);
	},

	sonnetFactory:function(params){
		var base = Utils.threeTextFactory({
			title:"Sonnet Reading",
			text_1:{
				text:"\"" + params.title + "\"",
				x:params.text_1.x,
				y:params.text_1.y,
				font:params.text_1.font
			},
			text_2:{
				text:"by " + params.author,
				x:params.text_2.x,
				y:params.text_2.y,
				font:params.text_2.font
			},
			text_3:{
				text:"as read by " + params.reader,
				x:params.text_3.x,
				y:params.text_3.y,
				font:params.text_3.font
			}
		});

		return(base);
	},

	sonnetAuthorFactory:function(params){
		var base = Utils.twoTextFactory({
			title:"Sonnet Reading",
			text_1:{
				text:"\"" + params.title + "\"",
				x:params.text_1.x,
				y:params.text_1.y,
				font:params.text_1.font
			},
			text_2:{
				text:"by " + params.author,
				x:params.text_2.x,
				y:params.text_2.y,
				font:params.text_2.font
			}
		});

		return(base);
	},

	sonnetAccompanyFactory:function(params){
		var base = Utils.threeTextFactory({
			title:"Sonnet With Accompanist Reading",
			text_1:{
				text:"\"" + params.title + "\"",
				x:120,
				y:200,
				font:"70px Cabin"
			},
			text_2:{
				text:"by " + params.author,
				x:120 + 50,
				y:200 + 140,
				font:"50px Cabin"
			},
			text_3:{
				text:"accompanied by " + params.accompany,
				x:120 + 50,
				y:200 + 140 + 60,
				font:"40px Cabin"
			}
		});

		return(base);
	},

	sonnetVideoFactory:function(params){
		// params = { two
		// 	title:"Video Poem Reading",
		// 	text_1:{
		// 		text:"\"" + params.title + "\"",
		// 		x:120,
		// 		y:200,
		// 		font:"73px Cabin"
		// 	},
		// 	text_2:{
		// 		text:"by " + params.author,
		// 		x:120 + 50,
		// 		y:200 + 140,
		// 		font:"60px Cabin"
		// 	}
		// };

		return({
			title:params.title,
			init:function(){
				var container = new createjs.Container(),
					loader = ctrl.loader,
					text_1 = new createjs.Text(params.text_1.text, params.text_1.font, "white"),
					text_2 = new createjs.Text(params.text_2.text, params.text_2.font, "white");

				text_1.lineWidth = 1100;

				text_1.x = params.text_1.x - 100;
				text_2.x = params.text_2.x;

				text_1.y = params.text_1.y;
		  		text_2.y = params.text_2.y;

		  		text_1.alpha = text_2.alpha = 0
		  		
		  		container.addChild(text_1);
		  		container.addChild(text_2);
		  		
		  		this.screen_obj = {
		  			container:container,

		  			text_1:text_1,
		  			text_2:text_2
		  		};

			},

			entrance:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				anim.fromTo(screen.text_1, 3, {alpha:0}, {alpha:1, delay:1, ease:Expo.easeOut})
					.fromTo(screen.text_2, 1.5, {alpha:0}, {alpha:1, delay:0.5, ease:Expo.easeOut})

					.to(screen.container, 1, {alpha:1})
					
					.addLabel("startVideo")
					.to(screen.container, 1, {alpha:0, y:"+=200"}, "startVideo")

					.add(function(){
						var video = document.getElementById("vid"); ;
	
						$('#vid').animate({
							opacity:1
						}, 2000);
						
						video.play();

					}, "startVideo")
					.add(def.resolve)
					.play();

				
				return(def.promise());
			},

			loop:function(){
				var screen = this.screen_obj,
					anim  = new TimelineMax({paused:true, repeat:-1});

				anim.play();
				
				this.looping_anim = anim;
			},

			exit:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				this.looping_anim.stop();
				this.looping_anim.clear();

				anim.addLabel("hide")
					.add(function(){
						var video = document.getElementById("vid"); ;
	
						$('#vid').animate({
							opacity:0
						}, 2000);

						video.pause();

					}, "hide") 
					.to(screen.text_1, 2, {alpha:0, y:"+=200", ease:Expo.easeOut}, "hide")
					.to(screen.text_2, 2, {alpha:0, y:"+=200", ease:Expo.easeOut}, "hide")
					.add(def.resolve)
					.play();

				return(def.promise());

			}
		});
	},

	introFactory:function(params) {

		params = {
			title:"Story Poem Reading",
			text_1:{
				text:"\"" + params.title + "\"",
				x:120,
				y:200,
				font:"73px Cabin"
			},
			text_2:{
				text:"by " + params.author,
				x:120 + 50,
				y:200 + 140,
				font:"60px Cabin"
			}
		};

		return({
			title:params.title,
			init:function(){
				var container = new createjs.Container(),
					loader = ctrl.loader,
					text_1 = new createjs.Text(params.text_1.text, params.text_1.font, "white"),
					text_2 = new createjs.Text(params.text_2.text, params.text_2.font, "white");
				
				text_1.lineWidth = 1100;

				text_1.x = params.text_1.x;
				text_2.x = params.text_2.x;

				text_1.y = params.text_1.y;
		  		text_2.y = params.text_2.y;

		  		text_1.alpha = text_2.alpha = 0
		  		
		  		container.addChild(text_1);
		  		container.addChild(text_2);
		  		
		  		this.screen_obj = {
		  			container:container,

		  			text_1:text_1,
		  			text_2:text_2
		  		};

			},

			entrance:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				anim.fromTo(screen.text_1, 0.5, {alpha:0}, {alpha:1, ease:Expo.easeOut})
					.fromTo(screen.text_2, 0.5, {alpha:0}, {alpha:1, ease:Expo.easeOut})
					.add(def.resolve)
					.play();

				
				return(def.promise());
			},

			loop:function(){
				var screen = this.screen_obj,
					anim  = new TimelineMax({paused:true, repeat:-1});

				anim.play();
				
				this.looping_anim = anim;
			},

			exit:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				this.looping_anim.stop();
				this.looping_anim.clear();

				anim.addLabel("hide")
					.to(screen.text_1, 0.5, {alpha:0, ease:Expo.easeOut}, "hide")
					.to(screen.text_2, 0.5, {alpha:0, ease:Expo.easeOut}, "hide")
					
					.add(def.resolve)
					.play();

				return(def.promise());

			}
		})
	},

	jenaFactory:function(params) {

		params = {
			title:"Story Poem Reading",
			text_1:{
				text:"\"" + params.title + "\"",
				x:120,
				y:200,
				font:"73px Cabin"
			},
			text_2:{
				text:"by " + params.author,
				x:120 + 50,
				y:200 + 140,
				font:"60px Cabin"
			},
			images:params.images
		};

		return({
			title:params.title,
			init:function(){
				var container = new createjs.Container(),
					loader = ctrl.loader,
					text_1 = new createjs.Text(params.text_1.text, params.text_1.font, "white"),
					text_2 = new createjs.Text(params.text_2.text, params.text_2.font, "white"),
					bkg_1 = new createjs.Bitmap(loader.getResult("jena_1")),
					bkg_2 = new createjs.Bitmap(loader.getResult("jena_1"));
				
				text_1.lineWidth = 1100;

				text_1.x = params.text_1.x;
				text_2.x = params.text_2.x;

				text_1.y = params.text_1.y;
		  		text_2.y = params.text_2.y;

		  		text_1.alpha = text_2.alpha = 0
		  		bkg_1.alpha = bkg_2.alpha = 0;

		  		bkg_1.scaleX = bkg_1.scaleY = bkg_2.scaleX = bkg_2.scaleY = 0.5;

		  		// bkg_1.x += 100;
		  		// bkg_2.x += 100;
		  		
		  		container.addChild(bkg_2);
				container.addChild(bkg_1);
		  		
		  		container.addChild(text_1);
		  		container.addChild(text_2);
		  		
		  		
		  		this.screen_obj = {
		  			container:container,

		  			text_1:text_1,
		  			text_2:text_2,

		  			bkg_1:bkg_1,
		  			bkg_2:bkg_2
		  		};

			},

			entrance:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				anim.fromTo(screen.text_1, 	2, {alpha:0}, {alpha:1, ease:Expo.easeOut})
					.fromTo(screen.text_2, 	2, {alpha:0}, {alpha:1, ease:Expo.easeOut})
					.addLabel("show")
					.fromTo(screen.bkg_1, 	2, {alpha:1}, {alpha:1, ease:Expo.easeOut}, "show")
					.fromTo(screen.bkg_2, 	2, {alpha:1}, {alpha:1, ease:Expo.easeOut}, "show")
					.to(screen.text_1, 		2, {alpha:0}, "show")
					.to(screen.text_2, 		2, {alpha:0}, "show")

					.add(def.resolve)

					.play();

				
				return(def.promise());
			},

			loop:function(){
				var screen = this.screen_obj,
					anim  = new TimelineMax({paused:true, repeat:-1});

				anim = Utils.addSlideShowLoop({fadeTime:1, holdTime:30, anim:anim, images:params.images, image1:screen.bkg_1, image2:screen.bkg_2});
				anim.play();
				
				this.looping_anim = anim;
			},

			exit:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				this.looping_anim.stop();
				this.looping_anim.clear();

				anim.addLabel("hide")
					.to(screen.text_1, 	0.3, {alpha:0, ease:Expo.easeOut}, "hide")
					.to(screen.text_2, 	0.3, {alpha:0, ease:Expo.easeOut}, "hide")
					.to(screen.bkg_1, 	0.3, {alpha:0, ease:Expo.easeOut}, "hide")
					.to(screen.bkg_2, 	0.3, {alpha:0, ease:Expo.easeOut}, "hide")
					
					.add(def.resolve)
					.play();

				return(def.promise());

			}
		});
	},


	storyPoemFactory:function(params) {

		params = {
			title:"Story Poem Reading",
			text_1:{
				text:"\"" + params.title + "\"",
				x:120,
				y:200,
				font:"80px Cabin"
			},
			text_2:{
				text:"by " + params.author,
				x:120 + 50,
				y:200 + 100,
				font:"50px Source Sans Pro"
			},

			color_1:params.color_1,
			color_2:params.color_2
		};

		return({
			title:params.title,
			init:function(){
				var container = new createjs.Container(),
					loader = ctrl.loader,
					text_1 = new createjs.Text(params.text_1.text, params.text_1.font, "white"),
					text_2 = new createjs.Text(params.text_2.text, params.text_2.font, "white"),
					bkg = new createjs.Shape();
				
				text_1.lineWidth = 1100;

				text_1.x = params.text_1.x;
				text_2.x = params.text_2.x;

				text_1.y = params.text_1.y;
		  		text_2.y = params.text_2.y;

		  		text_1.alpha = text_2.alpha = 0
		  		
		  		Utils.buildBkgGradient(bkg, params.color_1, params.color_2);
				bkg.alpha = 0;
				
		  		container.addChild(bkg);
		  		container.addChild(text_1);
		  		container.addChild(text_2);
		  		
		  		
		  		this.screen_obj = {
		  			container:container,

		  			text_1:text_1,
		  			text_2:text_2,
		  			bkg:bkg
		  		};

			},

			entrance:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				anim.fromTo(screen.text_1,  2, {alpha:0}, {alpha:1, ease:Expo.easeOut})
					.fromTo(screen.text_2, 	2, {alpha:0}, {alpha:1, ease:Expo.easeOut})
					.fromTo(screen.bkg, 	2, {alpha:0}, {alpha:1, ease:Expo.easeOut})
					.add(def.resolve)
					.play();

				
				return(def.promise());
			},

			loop:function(){
				var screen = this.screen_obj,
					anim  = new TimelineMax({paused:true, repeat:-1});

				anim.play();
				
				this.looping_anim = anim;
			},

			exit:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				this.looping_anim.stop();
				this.looping_anim.clear();

				anim.addLabel("hide")
					.to(screen.text_1, 	2, {alpha:0, ease:Expo.easeOut}, "hide")
					.to(screen.text_2, 	2, {alpha:0, ease:Expo.easeOut}, "hide")
					.to(screen.bkg, 	2, {alpha:0, ease:Expo.easeOut}, "hide")
					
					.add(def.resolve)
					.play();

				return(def.promise());

			}
		});
	},

	audioSonnetFactory:function(params) {

		params = {
			title:"Audio Poem Reading",
			text_1:{
				text:"\"" + params.title + "\"",
				x:120,
				y:490,
				font:"70px Cabin"
			},
			text_2:{
				text:"by " + params.author,
				x:120 + 30,
				y:200 + 80,
				font:"45px Source Sans Pro"
			},

			audio_file:params.audio_file,
			images:params.images
		};

		return({
			title:params.title,
			init:function(){
				var container = new createjs.Container(),
					loader = ctrl.loader,
					
					name_container = new createjs.Container(),
					line_1 = new createjs.Shape(),
					line_2 = new createjs.Shape(),

					staff = new createjs.Bitmap(loader.getResult("staff")),

					bkg_container = new createjs.Container(),
					bkg_1 = new createjs.Bitmap(loader.getResult(params.images[0])),
					bkg_2 = new createjs.Bitmap(loader.getResult(params.images[1])),

					text_1 = new createjs.Text(params.text_1.text, params.text_1.font, "white"),
					text_2 = new createjs.Text(params.text_2.text, params.text_2.font, "white");
				
				text_1.lineWidth = 1100;

				text_1.x = params.text_1.x;
				text_2.x = params.text_2.x;

				params.text_2.y = params.text_1.y + 80;

				text_1.y = params.text_1.y;
		  		text_2.y = params.text_2.y;

		  		text_1.alpha = text_2.alpha = 0
		  		
		  		line_1.graphics.beginFill("white").drawRect(0,0, -2000, 5);
		  		line_1.x = 940;
		  		line_1.y = text_2.y;

		  		line_2.graphics.beginFill("white").drawRect(0,0, 3, -2000);
		  		line_2.x = text_1.x - 20;
		  		line_2.y = 1000;

		  		line_1.alpha = line_2.alpha = 0;

		  		staff.x = 80;
		  		staff.y = line_1.y - 20;

		  		staff.rotation = 180;
		  		staff.scaleX = staff.scaleY = 0.2;
		  		staff.alpha = 0;

				name_container.addChild(text_1);
				name_container.addChild(text_2);
				name_container.addChild(staff);

		  		Utils.scaleBkgImage(bkg_1);
		  		Utils.scaleBkgImage(bkg_2);
		  		bkg_1.alpha = bkg_2.alpha = 0;

		  		bkg_container.addChild(bkg_2);
		  		bkg_container.addChild(bkg_1);

		  		container.addChild(bkg_container);
		  		container.addChild(name_container);

		  		container.addChild(line_1);
		  		container.addChild(line_2);

		  		
		  		this.screen_obj = {
		  			container:container,

		  			text_1:text_1,
		  			text_2:text_2,

		  			line_1:line_1,
		  			line_2:line_2,

		  			bkg_1:bkg_1,
		  			bkg_2:bkg_2,

		  			bkg_container:bkg_container,

		  			name_container:name_container,
		  			staff:staff
		  		};

			},

			entrance:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				anim.addLabel("show_lines")
					.fromTo(screen.line_2, 2, {alpha:0}, {alpha:1, delay:0.5, ease:Expo.easeOut}, "show_lines")
					.fromTo(screen.line_1, 2, {alpha:0, x:0}, {alpha:1, x:940, delay:1, ease:Expo.easeOut}, "show_lines")
					.fromTo(screen.text_1, 4, {alpha:0}, {alpha:1, ease:Expo.easeOut, delay:1.5}, "show_lines")
					
					.add(function(){
						createjs.Sound.play(params.audio_file);
					})
					.addLabel('play_intro')
					.fromTo(screen.text_2, 3, {alpha:0}, {alpha:1, ease:Expo.easeOut, delay:0.5}, "play_intro")
					.to(screen.bkg_1, 3, {alpha:1}, "play_intro")
					.add(def.resolve)
					.play();

				
				return(def.promise());
			},

			loop:function(){
				var screen = this.screen_obj,
					anim  = new TimelineMax({paused:true, repeat:-1});


				anim = Utils.addSlideShowLoop({fadeTime:5, holdTime:3, container:screen.bkg_container, anim:anim, images:params.images, image1:screen.bkg_1, image2:screen.bkg_2});
				anim.play();
				
				this.looping_anim = anim;
			},

			exit:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				this.looping_anim.stop();
				this.looping_anim.clear();
				
				var hide_arr = [screen.line_1, screen.line_2, screen.name_container,, screen.bkg_container]

				anim.addLabel("hide")
					.add(function(){
						createjs.Sound.stop(params.audio_file);
					})
					
					.to(hide_arr, 4, {alpha:0, ease:Expo.easeOut}, "hide")
					.to(screen.name_container, 4, {y:"+=200", ease:Expo.easeOut}, "hide")
					.to(screen.line_1, 4, {y:"+=200", ease:Expo.easeOut}, "hide")
					
					.add(def.resolve)
					.play();

				return(def.promise());

			}
		});
	},

	specialImageFactory:function(params) {

		params = {
			title:"Special Reading",
			text_1:{
				text:"\"" + params.title + "\"",
				x:120,
				y:490,
				font:"70px Cabin"
			},
			text_2:{
				text:"by " + params.author,
				x:120 + 30,
				y:200 + 80,
				font:"45px Source Sans Pro"
			},

			images:params.images
		};

		return({
			title:params.title,
			init:function(){
				var container = new createjs.Container(),
					loader = ctrl.loader,
					
					name_container = new createjs.Container(),
					line_1 = new createjs.Shape(),
					line_2 = new createjs.Shape(),

					staff = new createjs.Bitmap(loader.getResult("staff")),

					bkg_container = new createjs.Container(),
					bkg_1 = new createjs.Bitmap(loader.getResult(params.images[0])),
					bkg_2 = new createjs.Bitmap(loader.getResult(params.images[1])),

					text_1 = new createjs.Text(params.text_1.text, params.text_1.font, "white"),
					text_2 = new createjs.Text(params.text_2.text, params.text_2.font, "white");
				
				text_1.lineWidth = 1100;

				text_1.x = params.text_1.x;
				text_2.x = params.text_2.x;

				params.text_2.y = params.text_1.y + 80;

				text_1.y = params.text_1.y;
		  		text_2.y = params.text_2.y;

		  		text_1.alpha = text_2.alpha = 0
		  		
		  		line_1.graphics.beginFill("white").drawRect(0,0, -2000, 5);
		  		line_1.x = 940;
		  		line_1.y = text_2.y;

		  		line_2.graphics.beginFill("white").drawRect(0,0, 3, -2000);
		  		line_2.x = text_1.x - 20;
		  		line_2.y = 1000;

		  		line_1.alpha = line_2.alpha = 0;

		  		staff.x = 80;
		  		staff.y = line_1.y - 20;

		  		staff.rotation = 180;
		  		staff.scaleX = staff.scaleY = 0.2;
		  		staff.alpha = 0;

				name_container.addChild(text_1);
				name_container.addChild(text_2);
				name_container.addChild(staff);

		  		Utils.scaleBkgImage(bkg_1);
		  		Utils.scaleBkgImage(bkg_2);
		  		bkg_1.alpha = bkg_2.alpha = 0;

		  		bkg_container.addChild(bkg_2);
		  		bkg_container.addChild(bkg_1);

		  		container.addChild(bkg_container);
		  		container.addChild(name_container);

		  		container.addChild(line_1);
		  		container.addChild(line_2);

		  		
		  		this.screen_obj = {
		  			container:container,

		  			text_1:text_1,
		  			text_2:text_2,

		  			line_1:line_1,
		  			line_2:line_2,

		  			bkg_1:bkg_1,
		  			bkg_2:bkg_2,

		  			bkg_container:bkg_container,

		  			name_container:name_container,
		  			staff:staff
		  		};

			},

			entrance:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				anim.addLabel("show_lines")
					.fromTo(screen.line_2, 2, {alpha:0}, {alpha:1, delay:0.5, ease:Expo.easeOut}, "show_lines")
					.fromTo(screen.line_1, 2, {alpha:0, x:0}, {alpha:1, x:940, delay:1, ease:Expo.easeOut}, "show_lines")
					.fromTo(screen.text_1, 4, {alpha:0}, {alpha:1, ease:Expo.easeOut, delay:1.5}, "show_lines")
					
					.addLabel('play_intro')
					.fromTo(screen.text_2, 3, {alpha:0}, {alpha:1, ease:Expo.easeOut, delay:0.5}, "play_intro")
					.to(screen.bkg_1, 3, {alpha:1}, "play_intro")
					.add(def.resolve)
					.play();

				
				return(def.promise());
			},

			loop:function(){
				var screen = this.screen_obj,
					anim  = new TimelineMax({paused:true, repeat:-1});


				anim = Utils.addSlideShowLoop({fadeTime:5, holdTime:2, container:screen.bkg_container, anim:anim, images:params.images, image1:screen.bkg_1, image2:screen.bkg_2});
				anim.play();
				
				this.looping_anim = anim;
			},

			exit:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				this.looping_anim.stop();
				this.looping_anim.clear();
				
				var hide_arr = [screen.line_1, screen.line_2, screen.name_container,, screen.bkg_container]

				anim.addLabel("hide")
					
					.to(hide_arr, 2, {alpha:0, ease:Expo.easeOut}, "hide")
					.to(screen.name_container, 2, {y:"+=200", ease:Expo.easeOut}, "hide")
					.to(screen.line_1, 2, {y:"+=200", ease:Expo.easeOut}, "hide")
					
					.add(def.resolve)
					.play();

				return(def.promise());

			}
		});
	},

	specialColorFactory:function(params) {

		params = {
			title:"Special Reading",
			text_1:{
				text:"\"" + params.title + "\"",
				x:120,
				y:490,
				font:"70px Cabin"
			},
			text_2:{
				text:"by " + params.author,
				x:120 + 30,
				y:200 + 80,
				font:"45px Source Sans Pro"
			},

			color1:params.color1,
			color2:params.color2
		};

		return({
			title:params.title,
			init:function(){
				var container = new createjs.Container(),
					loader = ctrl.loader,
					
					name_container = new createjs.Container(),
					line_1 = new createjs.Shape(),
					line_2 = new createjs.Shape(),

					staff = new createjs.Bitmap(loader.getResult("staff")),

					bkg_container = new createjs.Container(),
					bkg_1 = new createjs.Shape(),

					text_1 = new createjs.Text(params.text_1.text, params.text_1.font, "white"),
					text_2 = new createjs.Text(params.text_2.text, params.text_2.font, "white");
				
				Utils.buildBkgGradient(bkg_1, params.color1, params.color2);
				
				text_1.lineWidth = 1100;

				text_1.x = params.text_1.x;
				text_2.x = params.text_2.x;

				params.text_2.y = params.text_1.y + 80;

				text_1.y = params.text_1.y - 300;
		  		text_2.y = params.text_2.y - 300;

		  		text_1.alpha = text_2.alpha = 0
		  		
		  		line_1.graphics.beginFill("white").drawRect(0,0, -2000, 5);
		  		line_1.x = 940;
		  		line_1.y = text_2.y;

		  		line_2.graphics.beginFill("white").drawRect(0,0, 3, -2000);
		  		line_2.x = text_1.x - 20;
		  		line_2.y = 1000;

		  		line_1.alpha = line_2.alpha = 0;

		  		staff.x = 80;
		  		staff.y = line_1.y - 20;

		  		staff.rotation = 180;
		  		staff.scaleX = staff.scaleY = 0.2;
		  		staff.alpha = 0;

				name_container.addChild(text_1);
				name_container.addChild(text_2);
				name_container.addChild(staff);

		  		bkg_1.alpha = 0;
		  		bkg_container.addChild(bkg_1);

		  		container.addChild(bkg_container);
		  		container.addChild(name_container);

		  		container.addChild(line_1);
		  		container.addChild(line_2);

		  		
		  		this.screen_obj = {
		  			container:container,

		  			text_1:text_1,
		  			text_2:text_2,

		  			line_1:line_1,
		  			line_2:line_2,

		  			bkg_1:bkg_1,

		  			bkg_container:bkg_container,

		  			name_container:name_container,
		  			staff:staff
		  		};

			},

			entrance:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				anim.addLabel("show_lines")
					.fromTo(screen.line_2, 2, {alpha:0}, {alpha:1, delay:0.5, ease:Expo.easeOut}, "show_lines")
					.fromTo(screen.line_1, 2, {alpha:0, x:0}, {alpha:1, x:940, delay:1, ease:Expo.easeOut}, "show_lines")
					.fromTo(screen.text_1, 4, {alpha:0}, {alpha:1, ease:Expo.easeOut, delay:1.5}, "show_lines")
					
					.addLabel('play_intro')
					.fromTo(screen.text_2, 3, {alpha:0}, {alpha:1, ease:Expo.easeOut, delay:0.5}, "play_intro")
					.to(screen.bkg_1, 3, {alpha:1}, "play_intro")
					.add(def.resolve)
					.play();

				
				return(def.promise());
			},

			loop:function(){
				var screen = this.screen_obj,
					anim  = new TimelineMax({paused:true, repeat:-1});


				// anim = Utils.addSlideShowColorLoop({fadeTime:5, holdTime:2, container:screen.bkg_container, anim:anim, colors:params.colors, image1:screen.bkg_1, image2:screen.bkg_2});
				// anim.play();
				
				this.looping_anim = anim;
			},

			exit:function(){
				var def = $.Deferred(),
					anim = new TimelineMax({paused:true}),
					screen = this.screen_obj;

				this.looping_anim.stop();
				this.looping_anim.clear();
				
				var hide_arr = [screen.line_1, screen.line_2, screen.name_container,, screen.bkg_container]

				anim.addLabel("hide")
					
					.to(hide_arr, 3, {alpha:0, ease:Expo.easeOut}, "hide")
					.to(screen.name_container, 3, {y:"+=200", ease:Expo.easeOut}, "hide")
					.to(screen.line_1, 3, {y:"+=200", ease:Expo.easeOut}, "hide")
					
					.add(def.resolve)
					.play();

				return(def.promise());

			}
		});
	}
}