var slides = [

///**********Fill House Intro***********////
	{	
		title:"intro",

		init:function(){
			var container = new createjs.Container(),
				loader = ctrl.loader,
	  			slide_images = [];

	  		_.range(1,23).forEach(function(idx){
	  			slide_images.push("animation_" + idx);
	  		});

	  		var gif = 	new createjs.Bitmap(loader.getResult(slide_images[slide_images.length-1])),
	  			gif_2 = new createjs.Bitmap(loader.getResult(slide_images[slide_images.length-1])),
	  			gif_container = new createjs.Container();
	  			
	  		Utils.centerBitmap(gif);
	  		Utils.centerBitmap(gif_2);
	  		gif.alpha = 0;
	  		gif_2.alpha = 0;

	  		gif_container.alpha = 1;
	  		gif_container.addChild(gif_2);
	  		gif_container.addChild(gif);

	  		container.addChild(gif_container);

	  		this.screen_obj = {
	  			slide_images:slide_images,
	  			container:container,

	  			gif_container:gif_container,
	  			gif_1:gif,
	  			gif_2:gif_2
	  		};

		},

		entrance:function(){
			var def = $.Deferred(),
				anim = new TimelineMax({paused:true}),
				screen = this.screen_obj;

			anim.to(screen.gif_1, 1, {alpha:0})

				.addLabel("expand_pic")
				.fromTo(screen.gif_1, 2, {alpha:0}, {alpha:1, scaleX:1, scaleY:1, ease:Back.easeOut}, "expand_pic")
				.fromTo(screen.gif_2, 2, {alpha:0}, {alpha:0, scaleX:1, scaleY:1, ease:Back.easeOut}, "expand_pic")
				.add(def.resolve)
				.play();

			
			return(def.promise());
		},

		loop:function(){
			var screen = this.screen_obj,
				anim  = new TimelineMax({paused:true, repeat:-1});

			anim = Utils.addSlideShowLoop({fadeTime:2, holdTime:2, container:screen.gif_container, anim:anim, images:screen.slide_images, image1:screen.gif_1, image2:screen.gif_2});
			anim.play();
			
			this.looping_anim = anim;
		},

		exit:function(){
			var def = $.Deferred(),
				anim = new TimelineMax({paused:true}),
				screen = this.screen_obj;

			this.looping_anim.stop();
			this.looping_anim.clear();

			anim.addLabel("remove")
				.to(screen.gif_1, 1, {alpha:0}, "remove")
				.to(screen.gif_2, 1, {alpha:0}, "remove")
				.add(def.resolve)
				.play();

			return(def.promise());

		}
	},

///**********Preamble Introduction***********////
	Utils.preambleIntroFactory({
		title: "Preamble Intro",
		text_1:{
			text:"The Poetic Preamble",
			font:"100px Cabin",
			color:"white",
			x:400,
			y:50
		},
		text:"Please Welcome Your Poetic Preamble MC",
		color1:"yellow",
		color2:"purple"
	})
];

///Preamble Poets
_.range(ctrl.youth_poets.length).forEach(function(idx) {
	
	slides.push(
		Utils.preamblePoetFactory({
			idx:idx,
			name:ctrl.youth_poets[idx].name,
			title:ctrl.youth_poets[idx].title,
			images:ctrl.youth_poets[idx].images,
			line1_add:ctrl.youth_poets[idx].line1_add,
			line2_add:ctrl.youth_poets[idx].line2_add
		})
	);
	
});
	
//Poetic Address Part 1
slides = slides.concat([

	Utils.addressIntroFactory({
		title: "Address Intro",
		text_1:{
			text:"The Address",
			font:"100px Cabin",
			color:"white",	
			x:400,
			y:50
		},
		color1:"yellow",
		color2:"purple"
	}),

	Utils.audioSonnetFactory({
		title: "People's Sonnet Number 5",
		author: "Luis J. Rodriguez",
		audio_file: "luis_audio_poem",
		images:["grant_20", "grant_19", "t_22", "t_29", "t_28", "t_11"]
		// images:["luis_1","luis_2", "luis_3", "luis_4"]
	}),

	Utils.specialColorFactory({
		title: "Seek Shelter",
		author: "Trapeta B. Mayson & Monnette Sudler",
		color1:"red",
		color2:"yellow",
	}),

	Utils.storyFactory({
		storyteller:"Nick",
		place: "From the Yellow Springs, Ohio Story Circle",
		title:"Hold These Things Close",
		reader: "Karina Puente",
		image:"story_1"
	}),

	Utils.sonnetVideoFactory({
		title: "video Sonnet",
		text_1:{
			text: "\"State of the Union: Higher Education\"",
			font:"50px Cabin",
			x:220,
			y:300
		},

		text_2:{
			text:"by Cathy Linh Che",
			font:"35px Source Sans Pro",
			x:220 + 50,
			y:300 + 60
		}
	}),

	Utils.sonnetFactory({
		title: "Because If They Taught Genocide",
		author: "Denice Frohman",
		reader: "David Escobar-Martin",

		text_1:{
			font:"50px Cabin",
			x:150,
			y:300
		},

		text_2:{
			font:"35px Source Sans Pro",
			x:200 + 50,
			y:300 + 60
		},

		text_3:{
			font:"35px Source Sans Pro",
			x:200 + 50,
			y:300 + 60 + 40
		}
	}),

	Utils.jenaFactory({
		title: "Likes",
		author: "Jena Osman",
		images:["jena_2", "jena_3", "jena_4", "jena_5", "jena_6", "jena_7", "jena_8"]
	}),


	Utils.storyFactory({
		title:"Story 2",
		storyteller:"Maren",
		place:"From the Tempe, Arizona Story Circle",
		title:"Two Little White Pills",
		reader: "Lenny Belasco",
		image: "story_2"
	}),

	Utils.sonnetFactory({
		title: "GOODBYE!",
		author: "Ross Gay",
		reader: "Kirwyn Sutherland",

		text_1:{
			font:"50px Cabin",
			x:150,
			y:300
		},

		text_2:{
			font:"35px Source Sans Pro",
			x:200 + 50,
			y:300 + 60
		},

		text_3:{
			font:"35px Source Sans Pro",
			x:200 + 50,
			y:300 + 60 + 40
		}
	}),

	Utils.sonnetFactory({
		title: "State of the Union Sonnet, 2016",
		author: "Bob Holman",
		reader: "Thomas Devaney",

		text_1:{
			font:"50px Cabin",
			x:150,
			y:300
		},

		text_2:{
			font:"35px Source Sans Pro",
			x:200 + 50,
			y:300 + 60
		},

		text_3:{
			font:"35px Source Sans Pro",
			x:200 + 50,
			y:300 + 60 + 40
		}
	}),

	Utils.storyFactory({
		title:"Story 3",
		storyteller:"Mark",
		place:"Uploaded from Philadelphia, Pennsylvania",
		title:"You're Now One of Us",
		reader: "Mark Palacio",
		image: "story_3"
	}),

	Utils.sonnetAuthorFactory({
		title: "#noAfricanafter5p.m.",
		author: "LaTasha N. Nevada Diggs",
		text_1:{
			font:"50px Cabin",
			x:150,
			y:300
		},

		text_2:{
			font:"35px Source Sans Pro",
			x:200 + 50,
			y:300 + 60
		}
	}),

	Utils.storyPoemFactory({
		title: "The State of the Union",
		author: "J.C. Todd",
		color_1:"orange",
		color_2:"purple"
	}),


	Utils.specialColorFactory({
		title: "Mother of Exiles",
		author: "Bethlehem & Sad Patrick",
		color1:"red",
		color2:"yellow",
	}),

	Utils.sonnetAuthorFactory({
		title: "Look Me in the Face Sonnet",
		author: "Thomas Devaney",
		text_1:{
			font:"50px Cabin",
			x:150,
			y:300
		},

		text_2:{
			font:"35px Source Sans Pro",
			x:200 + 50,
			y:300 + 60
		}
	}),

	Utils.storyFactory({
		title:"Story 4",
		storyteller:"Alma",
		place:"From the Penasco, New Mexico Story Circle",
		title:"Too Many Drunk Drivers",
		reader: "Alden Co-Doyle",
		image:"story_4"
	}),

	Utils.storyPoemFactory({
		title: "BabyBreathRattle",
		author: "Frank Sherlock",
		color_1:"blue",
		color_2:"purple"
	}),

	Utils.sonnetFactory({
		title: "Sonnet for the 2016 Poetic Address to the Nation",
		author: "Margaret Randall",
		reader: "J.C. Todd",

		text_1:{
			font:"40px Cabin",
			x:150,
			y:290
		},

		text_2:{
			font:"35px Source Sans Pro",
			x:200 + 50,
			y:290 + 60
		},

		text_3:{
			font:"35px Source Sans Pro",
			x:200 + 50,
			y:300 + 60 + 40
		}
	}),

	Utils.storyFactory({
		title:"Story 5",
		storyteller:"Nancy",
		place:"From the Lawrence, Kansas Story Circle",
		title:"Magic at the Dumpster",
		reader: "Paula Paul",
		image:"story_5"
	}),

	Utils.specialColorFactory({
		title: "One Flame",
		author: "Trapeta B. Mayson & Monnette Sudler",
		color1:"red",
		color2:"yellow"
	}),

	Utils.sonnetAuthorFactory({
		title: "TBA",
		author: "Yolanda Wisher",
		text_1:{
			font:"50px Cabin",
			x:150,
			y:300
		},

		text_2:{
			font:"35px Source Sans Pro",
			x:200 + 50,
			y:300 + 60
		}
	}),
	Utils.thanksFactory({
		title:"Closing",
		
		text_1:{ text:"Thank you for Attending!", 		x:120, 	y:200, 				font:"80px Cabin"},
		text_2:{ text:"Make your voice heard at:", 		x:120,	y:200 + 120,		font: "50px Source Sans Pro"},
		text_3:{ text:"usdac.us",						x:120,	y:200 + 120 + 60,	font: "50px Source Sans Pro"}
	})
]);
	
	// Utils.sonnetAuthorFactory({
	// 	title: "A Poet Laureate Reads the Comments Section",
	// 	author: "Yolanda Wisher",
	// 	text_1:{
	// 		font:"35px Cabin",
	// 		x:120,
	// 		y:300
	// 	},

	// 	text_2:{
	// 		font:"40px Source Sans Pro",
	// 		x:120 + 50,
	// 		y:300 + 60
	// 	}
	// }),


	// {	
	// 	title:"preamble",

	// 	init:function(){
	// 		var container = new createjs.Container(),
	// 			loader = ctrl.loader,
	// 			text = new createjs.Text("And now, THE POETIC PREAMBLE", "50px Cabin", "white"),
	// 			text_2 = new createjs.Text("Featuring Our MC:", "40px Cabin", "white"),
	// 			text_3 = new createjs.Text("David Escobar Martin", "50px Cabin", "white"),

	// 			slide_container = new createjs.Container(),

	// 			bkg_1 = 	new createjs.Bitmap(loader.getResult("grant_1")),
	// 			bkg_2 = new createjs.Bitmap(loader.getResult("grant_2"));

	// 		bkg_1.scaleX = bkg_1.scaleY = bkg_2.scaleX = bkg_2.scaleY = 0.7;

	// 		slide_container.addChild(bkg_2);
	// 		slide_container.addChild(bkg_1);

	// 		container.addChild(slide_container);
			
	// 		bkg_2.alpha = 0;
	// 		bkg_1.alpha = 0;
			
	// 		container.addChild(text);
	// 		container.addChild(text_2);
	// 		container.addChild(text_3);

	// 		Utils.centerObj(text);
	//   		Utils.centerObj(text_2);
	//   		Utils.centerObj(text_3);

	// 		text.textAlign = "center";
	// 		text_2.textAlign = "center";
	// 		text_3.textAlign = "center";

	// 		text.y -= 100;
	// 		text_3.y += 100;

	// 		text.alpha = text_2.alpha = text_3.alpha = 0;
			
	// 		var slide_images = [];
	// 		_.range(6, 16).forEach(function(idx){
	// 			slide_images.push("grant_" + idx);
	// 		});

	// 		bkg_1.image = loader.getResult(slide_images[slide_images.length-1]);
	// 		bkg_2.image = loader.getResult(slide_images[slide_images.length-1]);

	//   		this.screen_obj = {
	//   			slide_images:slide_images,
	//   			container:container,

	//   			text:text,
	//   			text_2:text_2,
	//   			text_3:text_3,

	//   			slide_container:slide_container,

	//   			bkg_1:bkg_1,
	//   			bkg_2:bkg_2
	//   		};

	// 	},

	// 	entrance:function(){
	// 		var def = $.Deferred(),
	// 			anim = new TimelineMax({paused:true}),
	// 			screen = this.screen_obj;

	// 		anim.fromTo(screen.text, 1, {alpha:0}, {alpha:1})
	// 			.fromTo(screen.text_2, 0.5, {alpha:0}, {alpha:1, delay:1})
	// 			.fromTo(screen.text_3, 0.5, {alpha:0}, {alpha:1, delay:1})
				
	// 			.addLabel("show")
	// 			.to(screen.bkg_1, 2, {alpha:1}, "show")
	// 			.to(screen.bkg_2, 2, {alpha:1}, "show")
				
	// 			.add(def.resolve)
	// 			.play();

	// 		return(def.promise());
	// 	},

	// 	loop:function(){
	// 		var screen = this.screen_obj,
	// 			loader = ctrl.loader,
	// 			anim = new TimelineMax({paused:true, repeat:-1});

	// 		anim = Utils.addSlideShowLoop({anim:anim, fadeTime:2, container:screen.slide_container, images:screen.slide_images, image1:screen.bkg_1, image2:screen.bkg_2});
	// 		anim.play();
						
	// 		this.looping_anim = anim;
	// 	},

	// 	exit:function(){
	// 		var def = $.Deferred(),
	// 			anim = new TimelineMax({paused:true}),
	// 			screen = this.screen_obj;

	// 		this.looping_anim.stop();
	// 		this.looping_anim.clear();

	// 		anim.addLabel("hide")

	// 			.to(screen.text, 	0.5, 		{alpha:0}, "hide")
	// 			.to(screen.text_2, 	0.5, 	{alpha:0}, "hide")
	// 			.to(screen.text_3, 	0.5, 	{alpha:0}, "hide")
	// 			.to(screen.bkg_1, 	0.5, 	{alpha:0}, "hide")
	// 			.to(screen.bkg_2, 	0.5, 	{alpha:0}, "hide")
	// 			.add(def.resolve)
	// 			.play();

	// 		return(def.promise());

	// 	}
	// }
	// template
	// {	
	// 	title:"preamble",

	// 	init:function(){
	// 		var container = new createjs.Container(),
	// 			loader = ctrl.loader;


	//   		this.screen_obj = {
	//   			container:container
	//   		};

	// 	},

	// 	entrance:function(){
	// 		var def = $.Deferred(),
	// 			anim = new TimelineMax({paused:true}),
	// 			screen = this.screen_obj;

	// 		anim.add(def.resolve)
	// 			.play();

			
	// 		return(def.promise());
	// 	},

	// loop:function(){
	// 		var screen = this.screen_obj,
	// 			anim = new TimelineMax({paused:true, repeat:-1});

	// 		anim.play();
			
	// 		this.looping_anim = anim;
	// },


	// 	exit:function(){
	// 		var def = $.Deferred(),
	// 			anim = new TimelineMax({paused:true}),
	// 			screen = this.screen_obj;

	// 		this.looping_anim.stop();
	// 		this.looping_anim.clear();

	// 		anim.add(def.resolve)
	// 			.play();

	// 		return(def.promise());

	// 	}
	// }