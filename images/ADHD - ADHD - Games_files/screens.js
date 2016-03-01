var GameScreens = {
	loading: {
		construct:function() {
			var loadingScreen = new createjs.Container(),
				loadingBarOutline = new createjs.Shape(),
				loadingBarFill = new createjs.Shape();

			loadingBarOutline.graphics.setStrokeStyle(3,"round").beginStroke("#ffffff").drawRect(0,0, 300, 50);
			loadingBarFill.graphics.beginFill("#ffffff").drawRect(0,0, 100, 0);

			loadingBarOutline.x = loadingBarFill.x = 300;
			loadingBarOutline.y = loadingBarFill.y  = 300;

			loadingScreen.addChild(loadingBarOutline);
			loadingScreen.addChild(loadingBarFill);
			
			this.screenObject =  {
				container:loadingScreen,
				spriteObjs:{
					loadingBar:{
						outline:loadingBarOutline,
						fill:loadingBarFill
					}
				}
			};
		},

		getObject:function() {
			if (!this.screenObject)
				this.construct();

			return(this.screenObject);
		},

		show:function(toggleEvents) {
			var stage = ctrl.stage,
				def = $.Deferred(),
				toggleEvents = (!toggleEvents)?true:toggleEvents;

			if (toggleEvents) {
				screens.loading.setEvents();
			}

			stage.addChild(screens.loading.screenObject.container);

			screens.loading.screenObject.container.alpha = 1;
			stage.update();

			return(def.promise());
		},

		hide:function(toggleEvents) {
			var stage = GameController.stage,
				def = $.Deferred(),
				toggleEvents = (!toggleEvents)?true:toggleEvents;

			if (toggleEvents) {
				GameScreens.loading.removeEvents();
			}

			screens.loading.screenObject.container.alpha = 0;
			def.resolve();
			stage.update();

			return(def.promise());
		},

		setEvents:function() {
			var baseDir =  "../img/game" + ctrl.gameIndex
				dataDir =  "../game_data/game" + ctrl.gameIndex + "/",
				queue = new createjs.LoadQueue(),
				def = $.Deferred(),
				userDef = IOHelpers.getLoggedInUser(),
				externalFiles = ctrl.loadExternalFiles(),
				queueValues = [
					{id:"splash", src:baseDir + "/splash.png"},
					{id:"intro_screen", src:baseDir + "/intro_screen.png"},
					{id:"end_screen", src:baseDir + "/end_screen.png"},
					{id:"response_screen", src:baseDir + "/clipboard.png"},
					{id:"query_screen", src:baseDir + "/query_screen.png"},
					{id:"candy_box", src:baseDir + "/candy_box.png"},
					{id:"bkg", src:baseDir + "/conveyor_bg.png"},

					{id:"key", src:baseDir + "/button.png"},
					{id:"key-toggled", src:baseDir + "/button-toggled.png"},
					
					{id:"space", src:baseDir + "/space_button.png"},
					{id:"space-toggled", src:baseDir + "/space_button-toggled.png"},

					{id:"enter", src:baseDir + "/enter_button.png"},
					{id:"enter-toggled", src:baseDir + "/enter_button-toggled.png"}
				
				];

			for ( candy in ctrl.gameValues.candy_types) {

				for( color in ctrl.gameValues.colors){
					queueValues.push({id:color + "_" + candy, src:baseDir + "/candy/" + color + "_" + candy + ".png"});
				};

				queueValues.push({id: "divot_" + candy, src:baseDir + "/candy_divots/divot_" + candy + ".png"});
				queueValues.push({id: "question_" + candy, src:baseDir + "/candy_for_questions/question_" + candy + ".png"});
			
			};
			
			$.when(userDef, externalFiles).done(function(){
				ctrl.resources = queue;
				ctrl.user = arguments[0]['attributes'];

				queue.loadManifest(queueValues);
				queue.addEventListener("progress", GameScreens.loading.events.progressEvent);
				queue.addEventListener("complete", function(){
					ctrl.unloadState("loading");
				});
			});
		},

		removeEvents:function() {
			ctrl.resources.removeEventListener("progress", screens.loading.events.progressEvent);
		},

		events:{
			progressEvent:function(e) {
				var stage = ctrl.stage,
					loadingBar = screens.loading.screenObject.spriteObjs.loadingBar;

				loadingBar.fill.graphics.beginFill("#ffffff").drawRect(0,0, Utils.lerp(e.progress, 0, 1, 0, 300), 50);
				stage.update();
			}
		}
	},

	splash:{
		construct:function(){
			var resources = ctrl.resources,

				container = new createjs.Container(),
				splash = new createjs.Bitmap(resources.getResult("splash"));

				splash.scaleX = splash.scaleY = 1.8;

				Utils.centerGraphic(splash, {width:400, height:300});
				splash.x += 35;

				container.addChild(splash);
				container.alpha = 0;


				this.screenObject = {
					container:container
				}
		},

		getObject:function(){
			if (!this.screenObject)
				this.construct();

			return(this.screenObject);
		},

		show:function(toggleEvents){
			var def = $.Deferred(),
				splashScreen = this.getObject(),
				stage = ctrl.stage,
				toggleEvents = (!toggleEvents)?true:toggleEvents,
				anim = new TimelineLite({paused:true});

			anim.to(splashScreen.container, 1, {alpha:1, ease:Linear.easeOut})
				.add(function(){
					if (toggleEvents) {
						screens.splash.setEvents().done(function(){
							def.resolve();
						});
					} else {
						def.resolve();
					}
			});

			anim.play();

			return(def.promise());
		},

		hide:function(toggleEvents) {
			var def = $.Deferred(),
				stage = ctrl.stage,
				toggleEvents = (!toggleEvents)?true:toggleEvents,
				anim = new TimelineLite({paused:true});

			anim.to(screens.splash.screenObject.container, 0.5, {alpha:0})
				.add(function(){
					if (toggleEvents) {
						screens.splash.removeEvents();
						def.resolve();
					}
				}, 0.3);
			
			anim.play();

				return(def.promise());
		},

		setEvents:function(){
			screens.splash.promise = $.Deferred();
			window.onkeydown = screens.splash.events.keyPressEvent;

			return(screens.splash.promise);
		},

		removeEvents:function() {
			window.onkeydown = null;
		},

		events:{
			keyPressEvent: function() {
				screens.splash.promise.resolve();
				screens.splash.promise = null;
			}
		}
	},

	presentation_screen:{
		construct:function(){
			var resources = ctrl.resources,
				container = new createjs.Container(),
				bkg = new createjs.Bitmap(resources.getResult("bkg")),
				bkg_scroll = new createjs.Bitmap(resources.getResult("bkg")),
					
				candy_container = new createjs.Container(),
				candy_box = new createjs.Bitmap(resources.getResult("candy_box"));

			candy_box.x = 60;
			candy_box.y = 10;
			candy_box.scaleX = candy_box.scaleY = 1.2;
			candy_container.alpha = 0;

			candy_container.addChild(candy_box);

			container.addChild(bkg);
			container.addChild(bkg_scroll);
			container.addChild(candy_container);

			bkg_scroll.x = -bkg.image.width;
			bkg.alpha = 1;

			this.screenObject = {
				container:container,
				candy_box:candy_box,
				candy_box_container:candy_container,
				bkg:bkg,
				bkg_scroll:bkg_scroll
			}
		},

		getObject:function(){
			if (!this.screenObject)
				this.construct();

			return(this.screenObject);
		},

		show:function(toggleEvents){
			var def = $.Deferred(),
				screen = this.getObject(),
				stage = ctrl.stage,
				toggleEvents = (!toggleEvents)?true:toggleEvents,
				anim = new TimelineLite({paused:true});

			anim.to(this.screenObject.container, 0.5, {alpha:1})
				.add(def.resolve)
				.play();

			return(def.promise());
		},

		hide:function() {
			var def = $.Deferred(),
				stage = ctrl.stage,
				screen = this.getObject(),
				anim = new TimelineLite({paused:true});

			anim.to(this.screenObject.container, 0.3, {alpha:0})
				.add(def.resolve)
				.play();

			return(def.promise());
		},

		setEvents:function() {
		},

		removeEvents:function() {
		},

		events:{
			setCandyEvents:function(){
				var screen = screens.presentation_screen.screenObject;
				
				screen.key_candy.color.addEventListener("mousedown", function(e){
					var current_target = e.currentTarget,
						anim = new TimelineLite({paused:true});

					screen.candybox_anim.stop();
					screen.candybox_anim.clear();

					anim.to(current_target, 0.15, {scaleX:screen.key_size.scale + 0.3, scaleY:screen.key_size.scale + 0.3, ease:Expo.easeout})
						.to(current_target, 0.3, {scaleX:0, scaleY:0, rotation:"+=360", ease:Expo.easeout})
						.add(function(){
							screen.def.resolve({correct:true})
						})
						.play();
				});
				
			},

			removeCandyEvents:function(){
				var screen = screens.presentation_screen.screenObject;

				screen.key_candy.color.removeAllEventListeners();
				
			}
		},

		actions:{
			scrollBkg:function(params){
				var screen = screens.presentation_screen.screenObject,
					anim = new TimelineLite({paused:true});

				anim.addLabel("scroll")
					.fromTo(screen.bkg, params.time, {x:0}, {x:screen.bkg.image.width, ease:Expo.easeOut}, "scroll")
					.fromTo(screen.bkg_scroll, params.time, {x:-screen.bkg.image.width}, {x:0, ease:Expo.easeOut}, "scroll")
					.add(function(){
						screen.bkg.x = 0;
						screen.bkg_scroll.x = -screen.bkg.image.width;
					})
					.play();
			},

			createCandybox:function(params){
				var resources = ctrl.resources,
					screen = screens.presentation_screen.screenObject,
					candys = _.shuffle(_.keys(ctrl.gameValues.candy_types)),
					initx = screen.candy_box.x + 115,
					inity = screen.candy_box.y + 180,
					candies = {},
					startx;

				candys.forEach(function(candy_type, idx){
					var candy_container = new createjs.Container(),
						candy_divot = new createjs.Bitmap(resources.getResult("divot_" + candy_type)),
						candy_color = new createjs.Bitmap(resources.getResult("blue_" + candy_type));

					candy_divot.regX = candy_divot.image.width/2;
					candy_divot.regY = candy_divot.image.height/2;
					
					candy_color.regX = candy_color.image.width/2;
					candy_color.regY = candy_color.image.height/2;

					candy_color.scaleX = candy_color.scaleY = 1.05;
					candy_color.alpha = 0;

					candy_container.addChild(candy_divot);
					candy_container.addChild(candy_color);

					candy_container.scaleX = candy_container.scaleY = 0.9;

					startx = (idx%ctrl.gameValues.grid.width === 0)? initx : startx+125;

					candy_container.x = startx;
					candy_container.y = Math.floor(idx/ctrl.gameValues.grid.width)*180 + inity;

					screen.candy_box_container.addChild(candy_container);
					
					candies[candy_type] = {
						container:candy_container,
						color:candy_color,
						divot:candy_divot,

						type:candy_type,
						x:idx%ctrl.gameValues.grid.width,
						y:Math.floor(idx/ctrl.gameValues.grid.width)
					};
				});

				screen.candies = candies;
			},

			removeCandybox:function(params){
				var screen = screens.presentation_screen.screenObject;

				_.keys(screen.candies).forEach(function(type){
					screen.candies[type].container.removeChild(screen.candies[type].color);
					screen.candies[type].container.removeChild(screen.candies[type].divot);

					screen.candy_box_container.removeChild(screen.candies[type].container);
				});

				screen.candies = {};
			},

			showCandybox:function(params) {
				var screen = screens.presentation_screen.screenObject,
					resources = ctrl.resources,
					key_candy = screen.candies[params.c_type.candy],
					size = ctrl.gameValues.sizes[params.c_type.size],
					color = ctrl.gameValues.colors[params.c_type.color];

				params = params || {};
				params.display_interval = params.display_interval || 2,
				params.isi = params.isi || 2;
				
				screen.def = $.Deferred();
				screen.candybox_anim = new TimelineLite({pause:true});
				screen.key_candy = key_candy;
				screen.key_size = size;

				screen.candybox_anim.add(function(){
						screen.key_candy.color.alpha = 1;
						screen.key_candy.color.scaleX = screen.key_candy.color.scaleY = size.scale;
						screen.key_candy.color.image = resources.getResult(color.name + "_" + key_candy.type);
					})

					.fromTo(screen.candy_box_container, params.isi, {alpha:1, y:0, x:-1000}, {x:0})

					.add(screens.presentation_screen.events.setCandyEvents)
					
					.to(screen.candy_box_container, params.display_interval, {alpha:1})
					
					.add(function(){
						screen.def.resolve({correct:false})
					})
					
					.play();

				return(screen.def.promise());
			},

			hideCandybox:function(params) {
				var anim = new TimelineLite({paused:true}),
					screen = screens.presentation_screen.screenObject,
					def = $.Deferred();

				anim.to(screen.candy_box_container, params.isi, (params.correct)?{x:1000}:{y:1000, ease:Back.easeIn})
					.add(function(){
						screen.key_candy.color.alpha = 0;
					})
					.add(def.resolve)
					.play();

				return(def.promise());
			}
		}
	},

	response_screen:{
		construct:function(){
			var resources = ctrl.resources,
				container = new createjs.Container(),
				
				symbol_button_container = new createjs.Container(),
				symbol_keys = [],

				input_text = new createjs.Text("THIS IS JUST OTHER KINDS OF DATA. THIS IS JUST OTHER KINDS OF DATA. THIS IS JUST OTHER KINDS OF DATA. THIS IS JUST OTHER KINDS OF DATA.", "bold 15px 'Ubuntu'", "#a31313"),

				bkg = new createjs.Bitmap(resources.getResult("query_screen"));
			
				enter_button_container = new createjs.Container(),
				enter_button_bkg = new createjs.Bitmap(resources.getResult("enter")),
				enter_button_text = new createjs.Text("INPUT ORDER", "bold 28px 'Ubuntu'", "white"),

				delete_button_container = new createjs.Container(),
				delete_button_bkg = new createjs.Bitmap(resources.getResult("space")),
				delete_button_text = new createjs.Text("BACKSPACE", "bold 28px 'Ubuntu'", "white"),

				display_area_container = new createjs.Container(),
				display_area_bkg = new createjs.Shape(),
				
				display_digit_container = new createjs.Container(),
				display_area_digits = [],
				
				num_display_digits = ctrl.gameValues.num_display_digits;
				
			//create the digit keys
				init_x = 160,
				start_x = init_x,
				start_y = 330,

				max_col = 7,

				createDigitKey = function(d, idx, container, collection) {
					var key_container = new createjs.Container(),
						key = new createjs.Bitmap(resources.getResult("key")),
						key_symbol = new createjs.Bitmap(resources.getResult("question_" + d));

					key.scaleX = key.scaleY = 0.7;

					key.regX = key.image.width/2;
					key.regY = key.image.height/2;

					key_symbol.x = key.x;
					key_symbol.y = key.y - 3;
					key_symbol.regX = key_symbol.image.width/2;
					key_symbol.regY = key_symbol.image.height/2;
					key_symbol.scaleX = key_symbol.scaleY = 0.5;
					key_symbol.alpha = 0.7;
					key_symbol.mouseEnabled = false;

					key_container.x = start_x;
					key_container.y = start_y;
					key_container.addChild(key);
					key_container.addChild(key_symbol);
					key_container.symbol = d;

					key_container.bkg = key;
					
					start_x += 90;
					if ((idx+1) % max_col === 0) {
						start_y += 98;
						start_x = init_x + 180;
					}

					container.addChild(key_container);

					key_container.childIndex = container.getChildIndex(key_container);
					collection.push(key_container);
				};
				
			_.keys(ctrl.gameValues.candy_types).forEach(function(l, idx) {
				createDigitKey(l, idx, symbol_button_container, symbol_keys);
			});

			container.addChild(bkg);
			
			bkg.x = 35;
			bkg.y = 10;
			
			container.addChild(symbol_button_container);

			//create the bottom keys
			enter_button_text.textAlign = "left";
			enter_button_text.textBaseline = "middle";
			enter_button_text.x = 95;
			enter_button_text.y = 65;
			enter_button_text.mouseEnabled = false;
			enter_button_text.alpha = 0.8;

			enter_button_container.addChild(enter_button_bkg);
			enter_button_container.addChild(enter_button_text);
			
			enter_button_container.x = 110;
			enter_button_container.y = 380;
			enter_button_container.bkg = enter_button_bkg;
			enter_button_container.scaleX = enter_button_container.scaleY = 0.7;
			container.addChild(enter_button_container);

			delete_button_bkg.x = -175;

			delete_button_container.textAlign = "left";
			delete_button_container.textBaseline = "middle";
			delete_button_text.x = -120;
			delete_button_text.y = 48;
			delete_button_text.mouseEnabled = false;
			delete_button_text.alpha = 0.8;

			delete_button_container.addChild(delete_button_bkg);
			delete_button_container.addChild(delete_button_text);
			
			delete_button_container.x = 683;
			delete_button_container.y = 380;
			delete_button_container.bkg = delete_button_bkg;
			delete_button_container.scaleX = delete_button_container.scaleY = 0.7;
			
			container.addChild(delete_button_container);
			
			//create the display

			//digits
			var start_x = 30,
				start_y = 50;

			_.range(num_display_digits).forEach(function(i){
				var display_symbol = new createjs.Bitmap(resources.getResult("question_candy")),
					display_symbol_color = new createjs.Bitmap(resources.getResult("blue_fish")),
					digit_feedback_base = new createjs.Shape(),
					digit_feedback_correct = new createjs.Shape(),
					digit_feedback_incorrect = new createjs.Shape();
				
				display_symbol.scaleX = display_symbol.scaleY = 0.5;
				display_symbol_color.scaleX = display_symbol_color.scaleY = 0.5;

				display_symbol.x = start_x;
				display_symbol.y = start_y;
				
				display_symbol.regX = display_symbol.image.width/2;
				display_symbol.regY = display_symbol.image.height/2;

				display_symbol_color.x = start_x;
				display_symbol_color.y = start_y;
				
				display_symbol.name = "";
				
				display_symbol_color.regX = display_symbol_color.image.width/2;
				display_symbol_color.regY = display_symbol_color.image.height/2;

				display_symbol.alpha = 0.6;
				display_symbol_color.alpha = 0;

				digit_feedback_correct.alpha = 0;
				digit_feedback_incorrect.alpha = 0;

				digit_feedback_base.alpha = 0.5;

				digit_feedback_base.graphics.beginFill("rgba(0,0,0,0.3)").beginStroke("black").setStrokeStyle(2).drawRoundRect(-35, -35, 80, 120, 3);
				digit_feedback_correct.graphics.beginFill("green").drawRoundRect(-35, -35, 80, 120, 3);
				digit_feedback_incorrect.graphics.beginFill("red").drawRoundRect(-35, -35, 80, 120, 3);
				
				digit_feedback_incorrect.x = digit_feedback_correct.x = digit_feedback_base.x = display_symbol.x - 5;
				digit_feedback_incorrect.y = digit_feedback_correct.y = digit_feedback_base.y = display_symbol.y - 25;

				display_digit_container.addChild(digit_feedback_correct);
				display_digit_container.addChild(digit_feedback_incorrect);
				display_digit_container.addChild(digit_feedback_base);

				display_digit_container.addChild(display_symbol_color);
				display_digit_container.addChild(display_symbol);

				display_digit_container.alpha = 1;

				display_area_digits.push({symbol:display_symbol, symbol_color:display_symbol_color, base:digit_feedback_base, correct:digit_feedback_correct, incorrect:digit_feedback_incorrect});

				start_x += 85;
			});

			display_digit_container.x = 103;
			display_digit_container.y = 145;
			display_area_container.addChild(display_digit_container);

			input_text.x = display_area_container.x + 97;
			input_text.y = display_area_container.y + 95;
			
			input_text.alpha = 0.8;
			
			input_text.lineWidth = 680;
			input_text.text = "";


			color_patches = [];

			var start_x = 510;

			_.keys(ctrl.gameValues.colors).forEach(function(c){
				var c_patch = new createjs.Shape();
				
				c_patch.graphics.beginFill(ctrl.gameValues.colors[c].val).beginStroke("black").setStrokeStyle(2).drawCircle(0,0, 9);
				
				c_patch.x = start_x;
				c_patch.y = 104;
				c_patch.alpha = 0;

				start_x += 25;

				container.addChild(c_patch);
				color_patches.push(c_patch);
			});
				

			container.addChild(input_text);
			container.addChild(display_area_container);

			this.screenObject = {
				container:container,

				symbol_button_container: symbol_button_container,
				
				keys:symbol_keys,
				
				color_patches:color_patches,

				enter_key:enter_button_container,
				enter_key_text:enter_button_text,

				delete_key:delete_button_container,

				display_digits:display_area_digits,

				input_text:input_text
			}
		},

		getObject:function(){
			if (!this.screenObject)
				this.construct();

			return(this.screenObject);
		},

		show:function(params){
			var def = $.Deferred(),
				screen = screens.response_screen.getObject(),
				stage = ctrl.stage,
				anim = new TimelineLite({paused:true});

			screens.response_screen.actions.clearDisplay();
			screens.response_screen.actions.setDisplay();

			anim.fromTo(screen.container, 0.3, {y:-1000, x:0, alpha:1}, {y:0})
				.add(def.resolve)
				.play();

			return(def.promise());
		},

		hide:function() {
			var def = $.Deferred(),
				stage = ctrl.stage,
				screen = this.getObject(),
				anim = new TimelineLite({paused:true});

			anim.to(this.screenObject.container, 0.3, {x:1000})
				.add(def.resolve)
				.play();

			return(def.promise());
		},

		setEvents:function() {
		},

		removeEvents:function() {
		},

		events:{
			setButtonEvents:function(){
				var screen = screens.response_screen.screenObject,
					resources = ctrl.resources,
					current_digit = 0,
					inputing = false,
					def = $.Deferred(),
					response = [];


				screen.resp_def = $.Deferred();

				screen.keys.forEach(function(b){
					b.addEventListener("mouseover", function(e){
						var current_target = e.currentTarget,
							anim = new TimelineLite({paused:true});

						current_target.bkg.image = resources.getResult("key-toggled");
					});
					
					b.addEventListener("mouseout", function(e){
						var current_target = e.currentTarget,
							anim = new TimelineLite({paused:true});

						current_target.bkg.image = resources.getResult("key");
					});
					
					b.addEventListener("mousedown", function(e){
						var current_target = e.currentTarget,
							anim = new TimelineLite({paused:true});

						if (inputing)
							return;

					 	response.push(current_target.symbol);

						anim.add(function(){
								inputing = true;
							})
							.addLabel("typing")

							//keypress animation
							.to(current_target, 0.05, {scaleX:0.9, scaleY:0.9})
							.to(current_target, 0.1, {scaleX:1, scaleY:1})
							
							.add(function(){
								current_target.bkg.image = resources.getResult("key-toggled");
							})

						//display 
						if (current_digit < ctrl.gameValues.num_display_digits) {
							
							anim.add(function(){
								screen.display_digits[current_digit].symbol.name 		= current_target.symbol;
								screen.display_digits[current_digit].symbol.image	 	= resources.getResult("question_" + current_target.symbol);
								screen.display_digits[current_digit].symbol_color.image = resources.getResult("blue_" + current_target.symbol);
								current_digit += 1;
							}, "typing");

							anim.fromTo(screen.display_digits[current_digit].base, 	 0.3, {alpha:0}, {alpha:0.3, ease:Expo.easeOut}, "typing")
								.fromTo(screen.display_digits[current_digit].symbol, 0.3, {alpha:0, scaleX:0.3, scaleY:0.3}, {alpha:0.6, scaleX:0.5, scaleY:0.5, delay:0.1, ease:Back.easeOut}, "typing");
						}

						anim.add(function(){
								inputing = false;
							})

						anim.play();
					});
				});

				screen.enter_key.addEventListener("mouseover", function(e){
					var current_target = e.currentTarget,
						anim = new TimelineLite({paused:true});

					current_target.bkg.image = resources.getResult("enter-toggled");
				});
				
				screen.enter_key.addEventListener("mouseout", function(e){
					var current_target = e.currentTarget,
						anim = new TimelineLite({paused:true});

					current_target.bkg.image = resources.getResult("enter");
				});
				
				screen.enter_key.addEventListener("mousedown", function(e){
					var current_target = e.currentTarget,
						anim = new TimelineLite({paused:true});

					anim.addLabel("typing")
						//keypress animation
						.add(function(){
							current_target.bkg.image = resources.getResult("enter");
						}, "typing")
						
						.add(function(){
							screen.resp_def.resolve({finished:true, response:response})
						})
						
						.play();
				});

				screen.delete_key.addEventListener("mouseover", function(e){
					var current_target = e.currentTarget,
						anim = new TimelineLite({paused:true});

					current_target.bkg.image = resources.getResult("space-toggled");
				});
				
				screen.delete_key.addEventListener("mouseout", function(e){
					var current_target = e.currentTarget,
						anim = new TimelineLite({paused:true});

					current_target.bkg.image = resources.getResult("space");
				});
				
				screen.delete_key.addEventListener("mousedown", function(e){
					var current_target = e.currentTarget,
						anim = new TimelineLite({paused:true});

					if (inputing)
						return;
					
					response = response.slice(0, response.length-1);

					anim.add(function(){
							inputing = true;
						})
						.addLabel("typing")

						//keypress animation
						.add(function(){
							current_target.bkg.image = resources.getResult("space");
						}, "typing")
						.to(current_target, 0.1, {alpha:1})
						.add(function(){
							current_target.bkg.image = resources.getResult("space-toggled");
						})

					if (current_digit > 0) {

						screen.display_digits[current_digit-1].symbol.name 	= "";
								
						anim.to(screen.display_digits[current_digit-1].base, 0.2, {alpha:0, ease:Expo.easeOut}, "delete")
							.to(screen.display_digits[current_digit-1].symbol, 0.2, {alpha:0, scaleX:0.4, scaleY:0.4, ease:Expo.easeOut}, "delete")
							.add(function(){
								current_digit -= 1;
							});
					}

					anim.add(function(){
							inputing = false;
						})
						.play();
				});

				return(screen.resp_def.promise());
			},

			removeButtonEvents:function(){
				var screen = screens.response_screen.screenObject;
				
				screen.keys.forEach(function(b){
					b.removeAllEventListeners();
				});

				screen.enter_key.removeAllEventListeners();
				screen.delete_key.removeAllEventListeners();

			}
		},

		actions:{
			showMessage:function(params){
				var screen = screens.response_screen.screenObject,
					type = params.type || "normal",
					colors = params.colors || [],
					def = new $.Deferred();

				screen.message_anim = screen.message_anim || new TimelineLite({paused:true});
				
				switch(type) {
					case("normal"):
						screen.input_text.color = "#095c75";
						screen.input_text.y = 95;
						break;

					case("correct"):
						screen.input_text.color = "#006600";
						screen.input_text.y = 100;
						break;
					
					case("incorrect"):
						screen.input_text.color = "#aa0000";
						screen.input_text.y = 100;
						break;
				}

				if (screen.message_anim.isActive()) {
					screen.message_anim.stop();
					screen.message_anim.clear();
					
					
					screen.input_text.text = "";
					screen.input_text.alpha = 0;
				
				}	

				params.text.toUpperCase().split("").forEach( function(c) {
					screen.message_anim.add(function(){
						screen.input_text.text += c;
					})

					screen.message_anim.to(screen.input_text, _.random(0.02, 0.05), {alpha:1});
				});

				if (ctrl.session.game_data.trial_type === "color"){

					var idx = 0;
					
					colors.forEach(function(c){
						
						screen.color_patches[idx].graphics.beginFill(c.val).beginStroke("black").setStrokeStyle(2).drawCircle(0,0, 9);
						screen.message_anim.fromTo(screen.color_patches[idx], 0.3, {alpha:0, scaleX:0.1,scaleY:0.1}, {alpha:0.8, scaleX:1, scaleY:1});
						
						idx += 1;
					});
				}

				screen.message_anim.add(def.resolve)
					.play();
				
				return(def.promise());
			},

			hideMessage:function() {
				var screen = screens.response_screen.screenObject,
					anim = new TimelineLite({paused:true}),
					def = new $.Deferred();

				anim.addLabel("remove")
					.to(screen.input_text, 0.3, {alpha:0, ease:Expo.easeOut}, "remove");
				
				screen.color_patches.forEach(function(c_p){
					anim.to(c_p, 0.3, {alpha:0, scaleX:0.8, scaleY:0.8, ease:Expo.easeOut}, "remove");
				});
					
				anim.add(function(){
						screen.input_text.text = "";
						screen.input_text.alpha = 1;
						def.resolve();
					})
					.play();

				return(def.promise());
			},

			clearDisplay:function(){
				var screen = screens.response_screen.screenObject,
					anim = new TimelineLite({paused:true}),
					def = new $.Deferred();

				anim.addLabel("removeDisplay");

				screen.display_digits.forEach(function(d){
					
					anim.to(d.symbol, 0.1, {alpha:0}, "removeDisplay")
						.to(d.symbol_color, 0.1, {alpha:0}, "removeDisplay")
						.to(d.base, 0.1, {alpha:0}, "removeDisplay")
						.to(d.correct, 0.1, {alpha:0}, "removeDisplay")
						.to(d.incorrect, 0.1, {alpha:0}, "removeDisplay");
				});

				anim.add(def.resolve)
					.play();


				return(def.promise());
			},

			setDisplay:function(){
				var screen = screens.response_screen.screenObject,
					def = $.Deferred();
							
				screen.symbol_button_container.alpha = 1;

				screen.enter_key_text.text = "ENTER";
				screen.enter_key.alpha = 1;
				screen.delete_key.alpha = 1;

				screen.input_text.alpha = 1;
				screen.input_text.text = "";

				def.resolve();

				return(def.promise());
			},

			showFeedback:function(params) {
				var screen = screens.response_screen.screenObject,
					resources = ctrl.resources,
					anim = new TimelineLite({paused:true}),
					def = $.Deferred(),
					display_num_filled = 0,
					correct = true,
					responses = [];

				screen.display_digits.forEach(function(d){
					display_num_filled += (d.symbol.name === "")?0:1;
				});

				if (display_num_filled !== params.correct_sequence.length) {
					correct = false;
				}

				digit_range = _.range((params.correct_sequence.length > display_num_filled)?params.correct_sequence.length:display_num_filled);
				
				digit_range.forEach(function(idx){

					responses.push({correct:params.correct_sequence[idx], user:screen.display_digits[idx].symbol.name, overall_correct:idx < params.correct_sequence.length && screen.display_digits[idx].symbol.name === params.correct_sequence[idx].candy})
					if (idx >= params.correct_sequence.length ||  screen.display_digits[idx].symbol.name !== params.correct_sequence[idx].candy) {
						correct = false;
					}
					
				});
				
				screens.response_screen.events.removeButtonEvents();

				screens.response_screen.actions.hideMessage().done(function(){
					screens.response_screen.actions.showMessage({text:(correct?"SWEET!!! YOU GOT THE ORDER CORRECT!":"Nope. Uch. That left a bad taste in my mouth..."), type:(correct?"correct":"incorrect")}).done(function(){
						
							Utils.changeScore(ctrl.gameValues.scoring[(correct)?"correct_sequence":"incorrect_sequence"], screens);

							digit_range.forEach(function(idx){
								var correct_digit = (idx < params.correct_sequence.length && screen.display_digits[idx].symbol.name === params.correct_sequence[idx].candy);

								anim.addLabel("update")
									.fromTo(screen.display_digits[idx][correct_digit?"correct":"incorrect"], 0.3, {alpha:0}, {alpha:0.6, ease:Expo.easeOut, delay:0.1}, "update")

								if (correct_digit) {

									screen.display_digits[idx].symbol_color.image = resources.getResult(params.correct_sequence[idx].color + "_" + params.correct_sequence[idx].candy);
										
									var scale = ctrl.gameValues.sizes[params.correct_sequence[idx].size].scale - 0.3;

									scale = (scale <= 0)?0.15:scale;

									anim.to(screen.display_digits[idx].symbol, 		 		0.3, {alpha:0, delay:0.1}, "update")
										.to(screen.display_digits[idx].symbol_color, 		0.3, {alpha:1, delay:0.1}, "update")
										.fromTo(screen.display_digits[idx].symbol_color, 	0.3, {alpha:0, rotation:0, scaleX:0.5, scaleY:0.5}, {alpha:1, scaleX:scale, scaleY:scale, ease:Expo.easeOut, delay:0.3}, "update");
										
										
								}
							});
							
							anim.to(screen.enter_key, 0.5, {alpha:1, ease:Expo.easeOut})
								.add(function(){
									def.resolve({correct:correct, responses:responses});
								})
								.play();

					});
				});
							
				return(def.promise());
			},

			deactivateKeys:function(){
				var screen = screens.response_screen.screenObject,
					anim = new TimelineLite({paused:true}),
					def = $.Deferred();


				anim.addLabel("deactivateKeys")
					.to(screen.symbol_button_container, 0.2, {alpha:0.6}, "deactivateKeys")
					.to(screen.delete_key, 0.2, {alpha:0}, "deactivateKeys")
					.to(screen.enter_key, 0.2, {alpha:0}, "deactivateKeys")
					.add(def.resolve)
					.play();

				return(def.promise());
			},
		}
	},

	hud:{
		construct:function() {
			var container = new createjs.Container,
				scoreContainer = new createjs.Container()
				scoreBkg = new createjs.Shape(),
				scoreText = new createjs.Text("123453", "25px 'Lato'", "black"),
				
				trialContainer = new createjs.Container(),
				trialLabel = new createjs.Text("Trial", "15px 'Lato'", "white"),
				
				roundContainer = new createjs.Container(),
				roundLabel = new createjs.Text("Round", "15px 'Lato'", "white"),

				modeContainer = new createjs.Container(),
				modeBkg = new createjs.Shape(),
				modeLabel = new createjs.Text("Mode", "15px 'Lato'", "white"),
				modeText = new createjs.Text("COLOR", "20px 'Lato'", "black"),
				modePatches = [];

			scoreBkg.graphics.beginFill("white").drawRect(0,0, 150, 40, 5);
			scoreBkg.y += 5;

			scoreText.x = 10;
			scoreText.y = 25;

			scoreText.align = "center";
			scoreText.textBaseline = "middle";

			scoreContainer.addChild(scoreBkg);
			scoreContainer.addChild(scoreText);

			scoreContainer.x = 20;
			scoreContainer.y = 470;

			trialContainer.x = scoreContainer.x + 20;
			trialContainer.y = scoreContainer.y - 23;
			trialLabel.align = "left";
			trialLabel.x = 98;
			trialLabel.y = 5;

			//trial construction
			var startx = -20,
				trials = [],
				rounds = [];

			_.range(ctrl.constants.trials_per_round).forEach(function(idx){
				var trialShape = new createjs.Shape();
				
				trialShape.graphics.beginFill("white").drawRect(0,0,25, 25, 2);
				trialShape.x = startx;

				trialContainer.addChild(trialShape);
				
				startx += 28;
				trials.push(trialShape);
			});

			trialContainer.addChild(trialLabel);

			roundContainer.x = scoreContainer.x + 20;
			roundContainer.y = scoreContainer.y + 48;
			roundLabel.align = "left";
			roundLabel.x = 89;
			roundLabel.y = 2;

			//round construction
			startx = -20;
			_.range(ctrl.constants.total_rounds).forEach(function(idx){
				var roundShape = new createjs.Shape();
				
				roundShape.graphics.beginFill("white").drawRect(0,0,25, 25);
				roundShape.x = startx;
				
				roundContainer.addChild(roundShape);
				
				startx += 28;
				rounds.push(roundShape);
			});
			roundContainer.addChild(roundLabel);
			
			modeBkg.graphics.beginFill("white").drawRect(0,0, 210, 40, 5);
			modeBkg.y += 5;

			modeText.x = 10;
			modeText.y = 25;

			modeText.lineWidth = 210;
			modeText.align = "center";
			modeText.textBaseline = "middle";

			modeLabel.align = "left";
			modeLabel.x = 170;
			modeLabel.y = -17;

			modeContainer.addChild(modeBkg);
			modeContainer.addChild(modeText);
			modeContainer.addChild(modeLabel);
			modeContainer.alpha = 0.9;

			modeContainer.x = 860;
			modeContainer.y = 490;
			modeContainer.alpha = 0;

			var beginX = 95;
			_.keys(ctrl.gameValues.colors).forEach(function(c){
				var color_patch = new createjs.Shape();
				color_patch.graphics.beginFill(ctrl.gameValues.colors[c].val).setStrokeStyle(2).beginStroke("#333333").drawRect(-7.5, -13, 15, 26);
				
				color_patch.x = beginX;
				color_patch.y = 24;
				color_patch.alpha = 0;
				
				beginX += 20;

				modeContainer.addChild(color_patch);

				modePatches.push(color_patch);
			});

			container.x = -7;
			container.y = 110;

			container.addChild(scoreContainer);
			container.addChild(trialContainer);
			container.addChild(roundContainer);
			container.addChild(modeContainer);
			container.scaleX = container.scaleY = 0.8;

			this.screenObject =  {
				container:container,
				scoreContainer:scoreContainer,
				scoreText:scoreText,
				
				trialBoxes:trials,
				roundBoxes:rounds,

				trialContainer:trialContainer,
				roundContainer:roundContainer,

				modeContainer:modeContainer,
				modePatches:modePatches,
				modeBkg:modeBkg,
				modeText:modeText
			};
		},

		getObject:function() {
			if (!this.screenObject)
				this.construct();

			return(this.screenObject);
		},

		show:function(toggleEvents) {
			var def = $.Deferred(),
				screen = this.getObject(),
				stage = ctrl.stage,
				toggleEvents = (!toggleEvents)?true:toggleEvents,
				anim = new TimelineLite({paused:true});

			anim.fromTo(screen.container, 0.3, {alpha:0}, {alpha:1,ease:Linear.easeOut})
				.add(function(){
					if (toggleEvents) {
						screens.hud.setEvents();
						def.resolve();
					}
			});

			anim.play();

			return(def.promise());
		},

		hide:function(toggleEvents) {
			var def = $.Deferred(),
				stage = ctrl.stage,
				screen = this.getObject(),
				anim = new TimelineLite({paused:true});

			anim.to(screens.hud.screenObject.container, 0.3, {alpha:0})
				.add(def.resolve)
				.play();

			return(def.promise());
		},

		setEvents:function() {
		},

		removeEvents:function() {
			
		},

		events:{
		},

		actions:{
			setScore:function(start_score, end_score){
				var def = $.Deferred(),
					anim = new TimelineLite({paused:true}),
					score = {idx:start_score};

				end_score = (end_score >= 0)?end_score:0;

				anim.to(score, 0.5, {idx:end_score, ease:Bounce.easeOut, onUpdate:function(){screens.hud.screenObject.scoreText.text = Math.round(this.target.idx); ctrl.stage.update();}});

				if (end_score > start_score) {
					anim.to(screens.hud.screenObject.scoreText, 0.5, {scaleX:2, scaleY:2, alpha:1, ease:Expo.easeOut}, "-=0.5");
					anim.to(screens.hud.screenObject.scoreText, 0.2, {scaleX:1, scaleY:1, alpha:0.8, ease:Expo.easeOut});	
				}

				anim.add(function(){
					def.resolve();
				});

				anim.play();

				return(def);
			},

			setRounds:function() {
				var def = $.Deferred(),
					anim = new TimelineLite({paused:true}),
					session = ctrl.session;

				anim.add(function(){}, 0.5);

				_.map(_.range(ctrl.constants.total_rounds), function(idx) {
					var currentBox = screens.hud.screenObject.roundBoxes[idx];

					if (currentBox.alpha > 0.4) {
						anim.to(currentBox, 0.5, {alpha:0.4, ease:Expo.easeOut}, "-=0.5");
					}

					if (idx === session.current_round) {
						anim.fromTo(currentBox, 0.5, {alpha:0, scaleX:0.7, scaleY:0.7}, {alpha:1, scaleX:1, scaleY:1, ease:Back.easeOut}, "-=0.5");
					}
				});

				anim.play();

				return(def.promise());
			},

			setTrials:function() {
				var def = $.Deferred(),
					anim = new TimelineLite({paused:true}),
					session = ctrl.session;

				anim.add(function(){}, 0.5);

				_.map(_.range(ctrl.constants.trials_per_round), function(idx) {
					var currentBox = screens.hud.screenObject.trialBoxes[idx];
				
					if (currentBox.alpha > 0.4) {
						anim.to(currentBox, 0.5, {alpha:0.4, ease:Expo.easeOut}, "-=0.5");
					}

					if (idx === session.current_trial % ctrl.constants.trials_per_round) {
						anim.fromTo(currentBox, 0.5, {alpha:0.3, scaleX:01, scaleY:0.7}, {alpha:1, scaleX:1, scaleY:1, ease:Back.easeOut}, "-=0.5");
					}
				});

				anim.play();

				return(def.promise());
			},

			setMode:function(params) {
				var def = $.Deferred(),
					screen = screens.hud.screenObject,
					anim = new TimelineLite({paused:true});

				screen.modeText.text = _.capitalize(params.mode);
				screen.modeText.x = (params.mode === "color")?25:90;

				if (params.mode === "color") {
					
					params.colors.forEach(function(c, idx){
						screen.modePatches[idx].graphics.clear();
						screen.modePatches[idx].graphics.beginFill(c.val).setStrokeStyle(2).beginStroke("#333333").drawCircle(-7.5, -13, 15);
						screen.modePatches[idx].alpha = 0.8;
					});
				}

				screen.modeContainer.alpha = 1;
			},

			resetHud:function(){
				_.map(_.range(ctrl.constants.trials_per_round), function(idx){
					var currentBox = screens.hud.screenObject.trialBoxes[idx];
					currentBox.alpha = 0.4;
				});

				_.map(_.range(ctrl.constants.total_rounds), function(idx){
					var currentBox = screens.hud.screenObject.roundBoxes[idx];
					currentBox.alpha = 0.4;
				});

				screens.hud.screenObject.modePatches.forEach(function(p){
					p.alpha = 0;
				});

				screens.hud.screenObject.scoreText.text = "0";
				screens.hud.screenObject.modeText.text = "";
			}

		}
	},

	messaging:{
		construct:function()	{
			var resources = ctrl.resources,
				container = new createjs.Container(),
				title = new createjs.Text("Title of thing", "50px 'Bowlby One SC'", "#AB1C1E"),
				text = new createjs.Text("ipsum asdf asfasf asfdsaf skflajf; aldfasf", "23px 'Lato'", "black"),
				bkg = new createjs.Bitmap(resources.getResult("clipboard")),

				next_container = new createjs.Container(),
				next_bkg = new createjs.Shape(),
				next_text = new createjs.Text("Press Space to Continue", "30px Lato", "white");	

			bkg.x = 70;
			bkg.y = 30;

			title.textAlign = "center";
			title.x = 280;
			title.y = 110;
			
			text.x = 220;
			text.y = 210;
			text.lineWidth = 600;

			next_text.textAlign = "center";
			next_text.textBaseline = "middle";
			
			next_text.x = 170;
			next_text.y = 30;
			next_text.mouseEnabled = false;

			next_bkg.graphics.beginFill("#AE1E1F").drawRoundRect(0,0, 350, 60, 3)

			next_container.addChild(next_bkg);
			next_container.addChild(next_text);
			
			next_container.x = 180;
			next_container.y = 430;
			next_container.alpha = 1;

			container.addChild(bkg);
			container.addChild(title);
			container.addChild(text);
			container.addChild(next_container);

			this.screenObject = {
				container:container,

				bkg: bkg,
				title:title,
				text:text,

				next_container: next_container
			}
		},

		getObject:function(){
			if (!this.screenObject)
				this.construct();

			return(this.screenObject);
		},

		show:function(params) {
			var anim = new TimelineLite({paused:true}),
				resources = ctrl.resources,
				def = $.Deferred(),
				screen = this.getObject(),
				end_x;
			
			params.type = params.type || "response";


			switch(params.type) {
				case ("intro"):
					screen.bkg.image = resources.getResult("intro_screen");
					
					end_x = -5;
					
					break;

				case ("end"):
					screen.bkg.image = resources.getResult("end_screen");
					
					end_x = -5;
					break;

				case ("response"):
					screen.bkg.image = resources.getResult("response_screen");
					
					screen.title.x = 180;
					screen.text.x = 180;
					
					end_x = -50;
					break;
			}

			
			screen.container.x = end_x;
			screen.title.text = params.title;
			screen.text.text = params.text;

			anim.fromTo(screen.container, 0.5, {alpha:0.8, y:-1000}, {alpha:1, y:0})
				.add(function(){

					screens.messaging.setEvents().done(function() {
						def.resolve();
					});
				
				})
				.play();

			return(def.promise());
		},

		hide:function(){
			var anim = new TimelineLite({paused:true}),
				def = $.Deferred(),
				screen = this.getObject();

			anim.to(screen.container, 0.5, {alpha:0.8, x:1000})
				.add(def.resolve)
				.play();

			return(def.promise());
		},

		setEvents:function(){
			screens.messaging.promise = $.Deferred();

			window.onkeydown = screens.messaging.events.keyPressEvent;
			
			return(screens.messaging.promise);
		},

		removeEvents:function() {
			window.onkeydown = null;
		},

		events:{
			keyPressEvent: function() {
				screens.messaging.promise.resolve();
			}
		},

		actions:{
		}
	}
}


	
	// template: {
	// 	construct:function(){
		// var resources = ctrl.resources,

		// 	container = new createjs.Container(),
		// 	splash = new createjs.Bitmap(resources.getResult("splash"));

		// splash.scaleX = splash.scaleY = 1.8;

		// Utils.centerGraphic(splash, {width:400, height:300});
		// splash.x += 35;

		// container.addChild(splash);
		// container.alpha = 0;


		// this.screenObject = {
		// 	container:container
		// }
	// 	},

	// 	getObject:function(){
	// 		if (!this.screenObject)
	// 			this.construct();

	// 		return(this.screenObject);
	// 	},

	// 	show:function(){

	// 	},

	// 	hide:function(){

	// 	},

	// 	setEvents:function(){
	// 		window.onkeydown = screens.splash.events.keyPressEvent;
	// 	},

	// 	removeEvents:function() {
	// 		window.onkeydown = null;
	// 	},

	// 	events:{
	// 	},

	// 	actions:{
	// 	}
	// },
// }


