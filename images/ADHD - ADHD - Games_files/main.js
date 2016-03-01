var GameController = {

	debug: {
		resetLevel:false,
		startLevel:0,

		loadFrom:"google_doc",
		dev:false,
		
		showScreen:false,
		showScreenType:"playField",

		skipToState:false,
		skipToStateType:"instructions"
	},

	gameValues: {
		scoring:{
			clicked_candy:30,
			missed_candy:-15
		},

		grid:{
			width:5,
			height:2
		},

		sizes:{large:{name:"large", scale:1}, medium:{name:"medium", scale:0.7}, small:{name:"small", scale:0.3}},
		
		candy_types:{ candy:{name:"candy"}, corn:{name:"corn"}, fish:{name:"fish"}, "gummy-bear":{name:"gummy-bear"}, heart:{name:"heart"}, "jelly-bean":{name:"jelly-bean"}, kiss:{name:"kiss"}, "life-saver":{name:"life-saver"}, peep:{name:"peep"}, star:{name:"star"}},
		
		colors: {blue:{name:"blue", val:"#0000FF"}, green:{name:"green", val:"#00FF00"}, orange:{name:"orange", val:"#ff7b00"}, purple:{name:"purple", val:"#9A07D7"}, red:{name:"red", val:"#FF0000"}, yellow:{name:"yellow", val:"#FFFF00"}},
		
		num_display_digits:8
	},

	currentState:"",
	gameIndex:9,
	gameName:"Game 9 Sweet Sampler",
	screenTypes: ["presentation_screen", "splash", "response_screen", "hud", "messaging"],	

	//construction
	init:function(game, canvas, stage) {
		GameController.canvas = canvas;
		GameController.stage = stage;

		GameController.loadState("loading");
	},

	destroy:function() {
		alert("destroying game");
	},

	loadState:function(type, params) {
		var ctrl = GameController,
			screens = GameScreens,
			session = ctrl.session,
			stage = ctrl.stage;

		currentState = (type)?type:currentState;
		Utils.doLog("				LOADING " + type, "info");

		switch(type) {
			case("loading"):
				ctrl.stage.enableMouseOver(300);

				ctrl.screens = {};
				ctrl.screens.loading = GameScreens.loading.getObject();
				
				// ctrl.stage.enableMouseOver(100);
				createjs.Ticker.setFPS(60);
				createjs.Ticker.addEventListener("tick", ctrl.stage);

				ctrl.session = {};
				ctrl.gameData = game;

				screens.loading.show();

				break; 

			case("splash"):
				screens.splash.show().done(function(){
					ctrl.unloadState("splash");
				});
				break;

			case("instructions"):
				screens.presentation_screen.show().done(function(){
					var instructions_text = (ctrl.session.game_data.trial_type === "size")?"SO LITTLE TIME! It's up to you to sort each candy piece correctly.\n\nClick on each candy as it appears.\n\nThen sort the candies from smallest to largest candy that has appeared.\n\nLooking forward to your sweet success.":"SO LITTLE TIME! It's up to you to sort each candy piece correctly.\n\nClick on each candy as it appears.\n\nThen sort the candies of specific color in the order each candy appeared.\n\nLooking forward to your sweet success.";

					screens.messaging.show({title:"SO MUCH CANDY!!!!", text:instructions_text}).done(function(){
						ctrl.unloadState("instructions");
					});
				
				});
				break;

			case("startSession"):
				
				session.initial_level = ctrl.session.current_level;
				session.initial_run = true;
				session.total_score = 0;
				session.current_trial = 0;
				session.current_round = 0;

				
				var data = {start:moment().format('YYYY-MM-DD hh:mm:ss'), stop:moment().format('YYYY-MM-DD hh:mm:ss'), user_id:ctrl.user.id, game_id:ctrl.gameIndex, mission_id:null, start_level:session.current_level, completed:false, end_level:session.current_level, response_time:0, accuracy:0};

				IOHelpers.startPlaythrough(data).done(function(play) {
					session.playthrough = play['attributes'];
					screens.hud.actions.resetHud();
					screens.hud.show().done(function(){
						ctrl.unloadState("startSession");
					});
				});
			

				break;

			case("trial_presentation"):
				var current_level = Utils.getCurrentLevel(ctrl),
					current_trial = Utils.getCurrentTrial(ctrl),
					trial_dis = session.current_trial - (session.current_round * ctrl.constants.trials_per_round) + 1,
					data = Utils.addTrialData(ctrl, {}),

					total_candies = _.random(current_level.candies_per_trial.min, current_level.candies_per_trial.max),
					total_sizes = 	_.random(current_level.size.min, current_level.size.max),
					total_color = 	_.random(current_level.color.min, current_level.color.max),
					
					candies = 		_.sampleSize(ctrl.gameValues.candy_types, 	total_candies),
					sizes = 		_.sampleSize(ctrl.gameValues.sizes, 		total_sizes),
					colors = 		_.sampleSize(ctrl.gameValues.colors, 		total_color),
					
					//set up sequence
					seq = [],
					correct = [],
					max_colors = Math.ceil(total_candies/total_color),
					max_sizes = Math.ceil(total_candies/total_sizes),
					max_colors_array = {},
					max_sizes_array = {};

				candies.forEach(function(candy){
					var seq_obj = {
						candy:candy.name
					};

					if (ctrl.session.game_data.trial_type === "size"){
						
						do {
							var size  = _.sample(sizes).name;
							if (!max_sizes_array.hasOwnProperty(size)) {
								max_sizes_array[size] = 0;
							}
						} while(max_sizes_array[size] > max_sizes);

						seq_obj.size  = size;
						max_sizes_array[size] += 1;

						seq_obj.color = colors[0].name;

					} else {

						do {
							var color = _.sample(colors).name;

							if (!max_colors_array.hasOwnProperty(color)) {
								max_colors_array[color] = 0;
							}
						} while(max_colors_array[color] > max_colors);

						seq_obj.color  = color;
						max_colors_array[color] += 1;
						
						seq_obj.size  = "large";

					}

					seq.push(seq_obj);
				});

				if (ctrl.session.game_data.trial_type === "size") {
					
					//if we are working with size, we need all small, then all medium, then all large items in that order
					["small", "medium", "large"].forEach(function(size){
						correct = _.concat(correct, _.filter(seq, {size:size}));
					});
					

				} else {

					//if we are working with color, we need all items of color 1, then color 2, etc
					colors.forEach(function(color){
						correct = _.concat(correct, _.filter(seq, {color:color.name}));
					});

				}
				
				console.log("*************");
				console.log(correct);

				data.data.sequence = seq;				
				data.data.correct_seq = correct;				
				
				data.data.candies = candies;
				data.data.sizes = sizes;
				data.data.colors = colors;

				session.game_data.trials.push(data);
				
				showPresSeq = function(seq_idx) {
					var current_trial = Utils.getCurrentTrial(ctrl),
						time = _.random(current_level.isi.min, current_level.isi.max);

					Utils.startRT();

					screens.presentation_screen.actions.scrollBkg({time:time});

					screens.presentation_screen.actions.showCandybox({c_type:seq[seq_idx], display_interval:_.random(current_level.display_interval.min, current_level.display_interval.max), isi:time}).done(function(resp) {

						current_trial.responses.push(Utils.addResponse(ctrl, {correct:resp.correct}));
						
						if (resp.correct) {
							screens.presentation_screen.actions.scrollBkg({time:time});
						}

						Utils.changeScore(((resp.correct)?ctrl.gameValues.scoring.clicked_candy:ctrl.gameValues.scoring.missed_candy), screens)
						
						screens.presentation_screen.actions.hideCandybox({isi:time, correct:resp.correct}).done(function() {

							if (seq_idx < seq.length - 1) {
								showPresSeq(seq_idx+1);
							} else {
								screens.presentation_screen.actions.removeCandybox();
								ctrl.unloadState('trial_presentation');
							}

						});

					});
				};

				var play_id = session.playthrough.id,
					data = Utils.startTrialData(ctrl);


				console.log(data);
				
				IOHelpers.startTrial(play_id, data).done(function(trial) {
					session.trial = trial['attributes'];

					screens.hud.actions.setTrials(session.current_trial);

					screens.hud.actions.setMode({mode:ctrl.session.game_data.trial_type, colors:colors});
					
					screens.presentation_screen.actions.createCandybox();
					showPresSeq(0);	
				});
				break;


			case ('trial_response'):
				var trial_dis = session.current_trial - (session.current_round * ctrl.constants.trials_per_round) + 1,
					current_trial = Utils.getCurrentTrial(ctrl),
					data = {level:session.current_level, correct:current_trial.correct, details:JSON.stringify(current_trial), stop:moment().format('YYYY-MM-DD hh:mm:ss')};

				screens.response_screen.show().done(function(){
					screens.response_screen.actions.showMessage({text:(ctrl.session.game_data.trial_type === "size")?"Now enter the symbols displayed in order of their size and appearence.":"Enter the symbols displaied in this color order:", colors:(ctrl.session.game_data.trial_type === "color")?current_trial.data.colors:[]});
						
					screens.response_screen.events.setButtonEvents().done(function(resp){
						
						screens.response_screen.actions.hideMessage();

						screens.response_screen.events.removeButtonEvents();
						var data = {level:session.current_level, correct:null, details:JSON.stringify(current_trial), stop:moment().format('YYYY-MM-DD hh:mm:ss')};
						
						correct_sequence = current_trial.data.correct_seq;

						screens.response_screen.actions.showFeedback({correct_sequence:current_trial.data.correct_seq, response:resp.response}).done(function(result){
							data.correct = result.correct;
							current_trial.data.pres_responses = result.responses;
							Utils.endTrial(ctrl, {correct:result.correct});

							IOHelpers.endTrial(session.trial.id, data).done(function() {
								
								screens.response_screen.hide().done(function(){
									
									ctrl.unloadState('trial_response');
								
								});

							});
						
						});
					});
				
				
				});
				break;

			case('start_round'):
				//start round database call
				screens.hud.actions.setRounds(session.current_round);
				ctrl.unloadState('start_round');
				break;

			case('end_round'):
				var current_round = Utils.addRound(ctrl);

				screens.messaging.show({title:"Round " + (session.current_round + 1 + " is complete!"), text:"You correctly completely " + current_round.total_correct + " / " + current_round.trials.length + " orders!"}).done(function(){
					screens.messaging.hide().done(function(){
						ctrl.unloadState('end_round');
					});
				});
				break;

			case('change_level'):
				var new_level = session.current_level + params.level_change,
					title = (params.level_change === 1)?"Level Up!!!":"Level Down...",
					text = "Moving to level " + new_level;

				IOHelpers.setLevel(ctrl.user.id, ctrl.gameIndex, new_level);
				session.current_level = new_level;

				screens.messaging.show({title:title, text:text}).done(function(){
					screens.messaging.hide().done(function(){
						ctrl.unloadState('change_level');
					});
				});
				break;

			case("end_game"):
				var data = {stop:moment().format('YYYY-MM-DD hh:mm:ss'), completed:true, end_level:session.current_level, response_time:session.game_data.total_rt/session.game_data.trials.length, accuracy:session.game_data.total_correct/session.game_data.trials.length};

				screens.presentation_screen.hide();
				screens.hud.hide();

				IOHelpers.updatePlaythrough(ctrl.session.playthrough.id, data).done(function() {					

					screens.messaging.show({title:"Game Over", text:"Overall accuracy: " + Math.round(ctrl.session.game_data.avg_acc*100) + "%", type:"response"}).done(function(){
						screens.messaging.hide().done(function(){
							ctrl.unloadState("end_game");
						});
					});
				
				});

				break;
			
			default:
		}
	},

	unloadState:function(type, params) {
		var screens = GameScreens,
			ctrl = GameController;

		Utils.doLog("				UNLOADING " + type, "info");

		switch(type) {
			case("loading"):
				
				//add all screens to stage
				_.each(ctrl.screenTypes, function(type){
					curScreen = screens[type].getObject();

					if (!curScreen.independant) {
						ctrl.stage.addChild(curScreen.container);	
					}

					curScreen.container.alpha = 0;
				});

				screens.loading.hide();

				ctrl.getLevel().done(function(resp) {
					ctrl.session.current_level = (!ctrl.debug.resetLevel)?(Number(resp.level_id) - 1):ctrl.debug.startLevel;

					ctrl.session.game_data = {
						total_correct:0,
						total_rt:0,
						
						avg_acc:0,
						avg_rt:0,

						total_score:0,
						trials:[],
						rounds:[],

						trial_type: _.sample(Utils.getCurrentLevel(ctrl).prompt_type)
					};
					
					if (ctrl.debug.showScreen) {
						screens[ctrl.debug.showScreenType].show(false);
					} else {
						ctrl.loadState((ctrl.debug.skipToState)?ctrl.debug.skipToStateType:"splash");
					}
				});

				break;

			case("splash"):
				screens.splash.removeEvents();
				screens[type].hide().done(function(){
					ctrl.loadState("instructions");
				});
				break;

			case("instructions"):
				screens.messaging.hide().done(function(){
					ctrl.loadState("startSession");
				});
				break;

			case("startSession"):
				ctrl.loadState("start_round");
				break;

			case('trial_presentation'):	
				ctrl.loadState("trial_response");
				break;

			
			case ('trial_response'):
				var session = ctrl.session;

				session.current_trial += 1;
				ctrl.session.initial_run = false;
				
				if (session.current_trial % ctrl.constants.trials_per_round === 0) {
					ctrl.loadState('end_round');
				} else {
					ctrl.loadState('trial_presentation');
				}

				break;

			case("start_round"):
				var session = ctrl.session;	
				
				if (session.current_round < ctrl.constants.total_rounds) {				
					
					IOHelpers.addRound(session.playthrough.id).done(function(round) {
						session.round = round['attributes'];
						ctrl.loadState('trial_presentation');
					});

				} else {
					ctrl.loadState("end_game");						
				}

				break;

			case("end_round"):
				//get round data complied and calcuate levelup
				var level_change = Utils.getLevelChange(ctrl),
					session = ctrl.session,
					round_id = session.round.id;

				IOHelpers.endRound(round_id).done(function(round) {
					if (session.current_level + level_change < 0) {
						level_change = 0;
					}

					session.current_round = session.current_round + 1;
						
					if (level_change === 0) {
						ctrl.loadState("start_round");

					} else {
						ctrl.loadState('change_level', {level_change:level_change});
					}
				});

				break;

			case("change_level"):
				ctrl.loadState("start_round");
				break;
			
			case("end_game"):
				var session = ctrl.session;

				console.log(session.game_data);
				ctrl.loadState('splash');
				break;
		}

	},

	//Helpers
	loadExternalFiles:function() {
		var ctrl = GameController,
			jsonFiles = ["constants", "levels"],
			deferred = $.Deferred(),
			baseDir = "../game_data/game" + ctrl.gameIndex + "/",
			fileQueue = new createjs.LoadQueue();
		
		_.map(jsonFiles, function(fileName) {
			fileQueue.loadFile({id:fileName, src: baseDir + fileName + ".json"});
		});

		fileQueue.addEventListener("complete", function() {
			_.map(jsonFiles, function(fileName) {
				ctrl[fileName] = fileQueue.getResult(fileName);
			});

			switch(ctrl.debug.loadFrom){
				case("json"):
					console.log("loading level data from json");
					deferred.resolve();
					break;

				case("google_doc"):
					console.log("loading level data from google doc");

					if (ctrl.debug.dev) {
						//dev
						var level_url = "https://docs.google.com/spreadsheets/d/1-JrbMmGfUOluXAu25Y0Ed5OL2Jc0Wudc-QMeii2TsxI/pubhtml";
					} else {
						//production
						var level_url = 'https://docs.google.com/spreadsheets/d/1nyQ_HtPdiT_0tUfNjPLj10gzfJzNhJcJFsoP6ZeA3Q4/pubhtml';;
					}
					
					Tabletop.init({
						key:level_url,
						callback: function(data){
							console.log("google doc loaded");
							data = data[ctrl.gameName].elements;

							//load levels
							_.map(data, function(obj, idx) {
								ctrl.levels[idx] = {};
								ctrl.levels[idx].candies_per_trial = {min:Number(obj.candies_per_trial_min), max:Number(obj.candies_per_trial_max)};
								ctrl.levels[idx].size = {max:Number(obj.max_size), min:Number(obj.min_size)};
								ctrl.levels[idx].color = {max:Number(obj.max_color), min:Number(obj.min_color)};
								ctrl.levels[idx].prompt_type = obj.prompt_type.split(",");

								ctrl.levels[idx].isi = {min:obj.isi_min, max:obj.isi_max};
								ctrl.levels[idx].display_interval = {min:Number(obj.display_interval_min), max:Number(obj.display_interval_max)};
							});

							//load config
							ctrl.constants = {};

							ctrl.constants.total_rounds = Number(data[0].total_rounds);
							ctrl.constants.trials_per_round = Number(data[0].trials_per_round);
							ctrl.constants.stimulus_fade_in = Number(data[0].stimulus_fade_in);
							ctrl.constants.stimulus_fade_out = Number(data[0].stimulus_fade_out);
							
							deferred.resolve();
						}	
					})
					break;

				case("database"):
					console.log("loading level data from database");
					deferred.resolve();
					break;
			}
		});

		return(deferred.promise());
	},

	getLevel:function() {
		console.log(">>>>>>>>>>>>>>>>>>>>>>Get Level");
		var user_id = ctrl.user.id;
		return(IOHelpers.getLevel(user_id, ctrl.gameIndex));
	}
};

window.screens = GameScreens;
window.ctrl = GameController;