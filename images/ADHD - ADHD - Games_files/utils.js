var GameControllerHelpers = {
	//helper functions
	getRandomCharacter:function() {
		return(String.fromCharCode(_.random(65,90)));
	},

	getRandomWord:function(length) {
		var word = "",
			that = GameControllerHelpers;

		_.map(_.range(length), function(){
			word += that.getRandomCharacter();
		});

		return(word);
	},

	setLetterSequence:function(currentLevel, wordList) {
		var that = GameController,
			session = that.session,
			currentIndex = 0,
			sequenceAdd = session.letter_sequence.length,
			letter_sequence = "",
			target_words = [],
			startIndices = [];

		//first we will be looping through our total session word length:
		for (var i = 0; i < that.constants.words_per_trial; i++) {
			//for each loop, add in some combination of random letters based on letters between correct

			var destractorWordLen = _.random(currentLevel.letters_bwt_correct.min, currentLevel.letters_bwt_correct.max),
				destractorWord = GameControllerHelpers.getRandomWord(destractorWordLen);

			//add in a random word
			letter_sequence += destractorWord;
			
			//record the start and end index of that word
			var newWord = wordList[currentLevel.word_length][_.random(wordList[currentLevel.word_length].length-1)];
			letter_sequence += newWord;

			target_words.push({word:newWord, start:sequenceAdd + letter_sequence.length- newWord.length, end:sequenceAdd + letter_sequence.length-1})
			startIndices.push(letter_sequence.length - newWord.length);
		}
		
		console.log(letter_sequence);

		//then go through each index
		for (i = 0; i < letter_sequence.length; i++) {
			//that is not a start of a word
			if (startIndices.indexOf(i) === -1) {
				var partial = letter_sequence.substr(i, currentLevel.word_length);

				//see if it matches a word within our word list
				var matchWordIndex = wordList[currentLevel.word_length].indexOf(partial.toLowerCase());

				if (matchWordIndex > -1) {
					
					//if it does, find the first upper case (dummy) character
					for(var changeIndex = i; letter_sequence.charAt(changeIndex) === letter_sequence.charAt(changeIndex).toLowerCase() && changeIndex < currentLevel.word_length; changeIndex++);
					letter_sequence = letter_sequence.substring(0, changeIndex) + GameControllerHelpers.getRandomCharacter() + letter_sequence.substring(changeIndex+1);

					//reset counter to check if word is still being created
					i = ((i<3)?0:i-3);
				}
			}
		}

		return({sequence:letter_sequence.toUpperCase().split(""), target_words:target_words});
	},

	incrementTargetWord:function() {
		var session = GameController.session;
		
		session.current_word_start = new Date();
		session.current_letter = session.current_word.end;
		session.current_word_index += 1;
		session.current_word = session.target_words[session.current_word_index];
	},

	saveWord:function(correct) {
		var session = GameController.session,
			user_data = session.user_data;

		user_data.trials[session.current_trial].words.push(user_data.words.length);

		user_data.words.push({
			start: session.current_word_start,
			stop: new Date(),
			text: session.current_word.word,
			index: session.current_word.start,
			correct:correct
		});
	},

	saveResponse:function(correct) {
		var session = GameController.session,
			user_data = session.user_data;

		user_data.trials[session.current_trial].responses.push(user_data.responses.length);

		user_data.responses.push({
			word_index: session.current_word_index,
			timestamp: moment().format(),
			correct:correct
		});

	},

	setLevel:function(level) {
		var that = GameController,
			session = that.session;

		if (level >= 0 && level < that.levels.length) {
			session.current_level_index = level;
			session.currentLevel = that.levels[session.current_level_index];
		}

	},


	setTrialData:function() {
		var session = GameController.session,
			user_data = session.user_data;
		
		user_data.trials.push({
			start: new Date(),
			end: null,
			words:[],
			responses:[]
		});

	},

	setTrialSequence:function() {
		var that = GameController,
			session = that.session;

		if (session.firstpass) {
			session.target_words = [];
			session.letter_sequence = [];
		}

		letterSequenceInfo = GameControllerHelpers.setLetterSequence(session.currentLevel, that.wordList);
		
		session.target_words = session.target_words.concat(letterSequenceInfo.target_words);
		session.letter_sequence = session.letter_sequence.concat(letterSequenceInfo.sequence);

		session.current_word = session.target_words[session.current_word_index];
	},

	getCorrectTrialWords:function(trial_number) {
		var user_data = GameController.session.user_data;
		var	session = GameController.session,
			currentWords = _.map(user_data.trials[session.current_trial].words, function(indx) {
				return(user_data.words[indx]);
			});

		if (!GameController.debug.allCorrectTrial) {
			currentWords = _.filter(currentWords, function(word){
				return(word.correct)
			});	
		}
		
		return(currentWords);
	},

	isWordEnd:function() {
		var session = GameController.session;
		return(session.current_letter >= session.current_word.end);
	},

	isTrialEnd:function() {
		var session = GameController.session;
		
		return( (session.current_letter >= session.letter_sequence.length-1) && GameControllerHelpers.isWordEnd() );
	},

	isCorrectTrialWord:function(word) {
		var correctWords = session.user_data.trials[session.current_trial].correctWords,
			correctIndex = _.findIndex(correctWords, {text:word});

		return(correctIndex);
	},

	isSessionEnd:function() {
		var session = GameController.session;
		return(session.current_letter >= session.letter_sequence.length-1 && session.current_trial >= session.total_trials-1);
	},

	endSession:function() {
		var session = GameController.session,
			that = GameController;

		session.complete = true;
		that.loadEndScreen();
	},

	logWord:function() {
		var doLog = Utils.doLog,
			session = GameController.session;

		doLog("current letter stats");
		doLog("next word: " + session.current_word.word);
		doLog("next word index: " + session.current_word_index);
		doLog("next word end: " + session.current_word.end);
		doLog("current letter index: " + (session.current_letter+1) + "/" + session.letter_sequence.length);
		doLog("************");

		doLog(session.letter_sequence[session.current_letter]);
		doLog(session.letter_sequence.join("").substr(session.current_letter));
	
	},

	saveTrialData:function() {
		var session = GameController.session,
			trials = session.user_data.trials,
			words = session.user_data.words,
			trialData = [];

		_.map(trials, function(round, roundIdx) {
			_.map(round.words, function(wordIdx) {
				trialData.push({
					start:words[wordIdx].start,
					stop:words[wordIdx].stop,
					round:roundIdx,
					level:round.level,
					correct: words[wordIdx].correct
				});
			});
		});

		// syncTrials(JSON.stringify(trialData));
	},

	startRT:function(){
		var user_data = GameController.session.user_data;
		user_data.startTime = moment();
	},

	endRT:function(){
		var user_data = GameController.session.user_data;
		user_data.endTime = moment();
		user_data.rt = user_data.endTime.diff(user_data.startTime, "ms");

		user_data.total_rt += user_data.rt;

		return(user_data.rt);
	}
};

var GameTwoControllerHelpers = {
	generateSequence:function() {
		var current_level = ctrl.levels[ctrl.session.current_level],
			trial_task = ctrl.session.task,
			cat, size, color, display_colors, sym_index,
			answers = {},
			seq = [];
		
		switch(trial_task) {
			case("color"):
				var color_idx = _.range(ctrl.session.colors.length),

				cat_index = _.random(3);
				num_items = current_level.query_items_color;
				item_shuffled = _.shuffle(_.range(ctrl.gameValues.symbols[cat_index].items.length));
				display_colors = current_level.display_colors;
				size = "mid";

				_.map(_.range(num_items), function(sym_index) {
					_.map(_.range(display_colors), function(color_idx) {
						var num_displays = _.random(current_level.displays_per_item.min, current_level.displays_per_item.max);

						_.map(_.range(num_displays), function() {
							var item = {
								cat:cat_index,
								cat_name:ctrl.gameValues.symbols[cat_index].name,
								task: trial_task,
								color:color_idx,
								color_obj:ctrl.session.colors[color_idx],
								size:size,
								sym_index: item_shuffled[sym_index],
								sym_name: ctrl.gameValues.symbols[cat_index].items[item_shuffled[sym_index]],
								position:Utils.getRandomKey(ctrl.gameValues.positions),

								display_time: _.random(current_level.display_interval.min, current_level.display_interval.max),
								isi:_.random(current_level.isi.min, current_level.isi.max),
							};

							seq.push(item);							
						});
					});
				});
				
				ctrl.session.item_shuffled = item_shuffled;

				break;
			case("size"):
				var size_shuffled = _.shuffle(_.range(ctrl.gameValues.sizes.length));
					
				cat_index = _.random(3);
				num_items = current_level.query_items_size;
				display_sizes = current_level.display_sizes;
				item = _.random(ctrl.gameValues.symbols[cat_index].items.length-1);
				color = _.random(ctrl.gameValues.colors.length-1);
				item_shuffled = _.shuffle(_.range(ctrl.gameValues.symbols[cat_index].items.length));

				_.map(_.range(num_items), function(sym_index) {
					_.map(_.range(display_sizes), function(size_idx) {
						var num_displays = _.random(current_level.displays_per_item.min, current_level.displays_per_item.max);

						_.map(_.range(num_displays), function() {
							seq.push({
								cat:cat_index,
								cat_name:ctrl.gameValues.symbols[cat_index].name,
								task: trial_task,
								color:color,
								color_obj:ctrl.session.colors[color],
								size: ctrl.gameValues.sizes[size_shuffled[size_idx]].size,
								sym_index: item_shuffled[sym_index],
								sym_name: ctrl.gameValues.symbols[cat_index].items[item_shuffled[sym_index]],
								position:Utils.getRandomKey(ctrl.gameValues.positions),

								display_time: _.random(current_level.display_interval.min, current_level.display_interval.max),
								isi:_.random(current_level.isi.min, current_level.isi.max),
							});
						});
					});
				});
				
				ctrl.session.item_shuffled = item_shuffled;
				ctrl.session.size_shuffled = size_shuffled;
				
				break;

			case("cat"):
				size = "mid";
				display_cats = current_level.query_cats_cat;
				num_items = current_level.display_items;
				color = _.random(ctrl.gameValues.colors.length-1);
				item_shuffled = _.shuffle(_.range(ctrl.gameValues.symbols[0].items.length)),
				cat_shuffled = _.shuffle(_.range(ctrl.gameValues.symbols.length)),


				_.map(_.range(num_items), function(sym_index) {
					_.map(_.range(display_cats), function(cat_index) {
						var num_displays = _.random(current_level.displays_per_item.min, current_level.displays_per_item.max);
							
						_.map(_.range(num_displays), function() {
				
							seq.push({
								cat:cat_shuffled[cat_index],
								cat_name:ctrl.gameValues.symbols[cat_shuffled[cat_index]].name,
								task: trial_task,
								color:color,
								color_obj:ctrl.session.colors[color],
								size: size,
								sym_index: item_shuffled[sym_index],
								sym_name: ctrl.gameValues.symbols[cat_shuffled[cat_index]].items[item_shuffled[sym_index]],
								position:Utils.getRandomKey(ctrl.gameValues.positions),

								display_time: _.random(current_level.display_interval.min, current_level.display_interval.max),
								isi:_.random(current_level.isi.min, current_level.isi.max),
							});
						});
					});
				});

				ctrl.session.item_shuffled = item_shuffled;
				ctrl.session.cat_shuffled = cat_shuffled;
				break;
		}

		seq = _.shuffle(seq);

		console.log("********Current Sequence********");
		console.log(seq);
		console.log("********************************");
		
		return(seq);
	},

	setTrialData:function(seq) {
		var session = ctrl.session,
			trials = session.game_data.trials;

		trials.push({
			sequence:seq,
			answers:GameTwoControllerHelpers.getAnswers(seq),
			responses:[],
			query_responses:[],
			hits:0,
			misses:0,
			correct:true,
			rt:0,
			start:moment().format('YYYY-MM-DD hh:mm:ss'),
			end:moment().format('YYYY-MM-DD hh:mm:ss'),
			accurary:false,
			database_data:{}
		});
	},

	getAnswers:function(seq) {
		var session = ctrl.session,
			current_level = ctrl.levels[session.current_level],
			task = seq[0].task,
			answer = {};

		answer.results = [];

		switch(task){
			case("color"):
				answer.colors = [];
				answer.items = [];

				//need all possible items that can be selected
				_.map(_.range(current_level.query_items_color), function(sym_index) {
					answer.items.push({name:ctrl.gameValues.symbols[seq[0].cat].items[session.item_shuffled[sym_index]], index:session.item_shuffled[sym_index]});
				});

				//need all possible colors that can be picked
				_.map(_.range(current_level.display_colors), function(color_idx) {
					answer.colors.push({name:ctrl.session.colors[color_idx].name, index:color_idx});
				});

				
				//need the cat those items are grabbed from
				answer.cat = {index:seq[0].cat, name:seq[0].cat_name}
				answer.correct = {};

				//for each item, what is the last color that is displaied
				_.forEachRight(seq, function(display_item, idx){
					if (answer.correct[display_item.sym_index] === undefined) {
						answer.correct[display_item.sym_index] = {color:display_item.color, name:display_item.color_obj.name};
					}
				});

				break;
			case("size"):
				answer.sizes = [];
				answer.items = [];
				
				//need all possible sizes that can be picked
				_.map(_.range(current_level.display_sizes), function(size_idx) {
					answer.sizes.push({name:ctrl.gameValues.sizes[session.size_shuffled[size_idx]].size, index:session.size_shuffled[size_idx]});
				});

				//need all possible items that can be selected
				_.map(_.range(current_level.query_items_size), function(sym_index) {
					answer.items.push({name:ctrl.gameValues.symbols[seq[0].cat].items[session.item_shuffled[sym_index]], index:session.item_shuffled[sym_index]});
				});
				
				//need the cat those items are grabbed from
				answer.cat = {index:seq[0].cat, name:seq[0].cat_name}
				answer.correct = {};
								
				//for each item, what is the last color that is displaied
				_.forEachRight(seq, function(display_item, idx){
					if (answer.correct[display_item.sym_index] === undefined) {
						answer.correct[display_item.sym_index] = {size:display_item.size};
					}
				});
				break;
			case("cat"):
				answer.cats = [];
				answer.items = [];
				answer.correct = {};

				//need all possible cats that can be picked
				_.map(_.range(current_level.query_cats_cat), function(cat_idx) {
					answer.cats.push({name:ctrl.gameValues.symbols[ctrl.session.cat_shuffled[cat_idx]].name, index:cat_shuffled[cat_idx]});
				});

				//need all possible items that can be selected from each cat
				_.map(_.range(current_level.display_items), function(item_idx) {
					answer.items.push({index:ctrl.session.item_shuffled[item_idx]});
				});

				//for each cat, what is the last item that is displaied
				_.forEachRight(seq, function(display_item, idx){
					if (answer.correct[display_item.cat] === undefined) {
						answer.correct[display_item.cat] = {item:display_item.sym_index, name:display_item.sym_name};
					}
				});
				break;
		}

		return(answer);
	},

	startTrialData:function() {
		var session = ctrl.session,
			current_trial = ctrl.session.game_data.trials[ctrl.session.current_trial],
			trials = session.game_data.trials,
			round_id = session.round.id;

		data = {
			start:moment().format('YYYY-MM-DD hh:mm:ss'),
			stop:moment().format('YYYY-MM-DD hh:mm:ss'),
			round_id:round_id,
			level:session.current_level, 
			correct:0, 
			response_time:0
		}

		current_trial.database_data = data;
		
		return(data);
	},

	addResponse:function(hit) {
		var session = ctrl.session,
			current_trial = session.game_data.trials[ctrl.session.current_trial];
		
		current_trial.responses.push({
			rt:Utils.endRT(),
			hit:hit,
			trial_idx: session.current_trial
		});

		if (hit) {
			current_trial.hits ++;
		} else {
			current_trial.misses ++;
		}
		
	}	
}

var GameThreeControllerHelpers = {
	generateSequence:function(){
		var current_level = ctrl.levels[ctrl.session.current_level],
			total_colors = current_level.display_colors,
			color_idx = _.range(ctrl.session.colors.length),
			seq_colors = [],
			seq = [];


		_.map(_.range(total_colors), function(i) {
			var amount_of_color = _.random(current_level.dots_per_color.min, current_level.dots_per_color.max),
				color_seq_values = _.fill(Array(amount_of_color), color_idx[i]);

			seq_colors = seq_colors.concat(color_seq_values);
		});

		var current_cord = {};

		seq_colors = _.shuffle(seq_colors);
		
		_.each(seq_colors, function(colorId) {
			
			do {
				current_cord.x = _.random(0, ctrl.gameValues.boardDim.width-1);
				current_cord.y = _.random(0, ctrl.gameValues.boardDim.height-1);
			} while (_.findIndex(seq.reverse().slice(0, 23), current_cord) !== -1);
			
			seq.push({id:colorId, color:ctrl.session.colors[colorId].val, name:ctrl.session.colors[colorId].name,  x:current_cord.x, y:current_cord.y});	
		});
		
		return(seq);
	},

	getColorIndexArray:function() {
		var session = ctrl.session,
			current_trial_seq = session.game_data.trials[session.current_trial].sequence,
			current_level = ctrl.levels[session.current_level],
			query_amount = current_level.query_color_amount,
			query_color_amount = current_level.query_color_amount,
			query_colors = {};

		//make a index array for our query_colors
		_.map(_.range(current_level.query_colors), function(c) {
			query_colors[c] = {count:0, color:ctrl.session.colors[c], locations:[]}
		});

		_.eachRight(current_trial_seq, function(s, idx) {
			if (s.id < current_level.query_colors) {
				with(query_colors[s.id]) {
					if (count < query_color_amount) {
						locations.push({x:s.x, y:s.y});	
					}
					count += 1;
				}
				
			}
		});

		return(query_colors);
	},

	isCorrectSequence:function(query_index, seq, grid_pos) {

		var cur_seq_position = {x:seq[query_index].x, y:seq[query_index].y};
		
	
		if (cur_seq_position.x === grid_pos.x && cur_seq_position.y === grid_pos.y) {
			return(true);
		} else {
			return(false);	
		}
	},

	isCorrectColor:function(grid_color, grid_pos, query_color_index_array) {
		if (grid_color === null || grid_color >= current_level.query_colors) {
			correct_color = false;
		} else {

			var found_location = _.find(query_color_index_array[grid_color].locations, function(o){
				return(o.x === grid_pos.x && o.y === grid_pos.y);
			});

			if (found_location) {
				correct_color = true;
			} else {
				correct_color = false;
			}
		}

		return(correct_color);
	},

	recordTrial:function(correct_color, correct_sequence, seq, grid_pos, query_index) {
		var session = ctrl.session,
			current_trial = session.game_data.trials[session.current_trial],
			score = ((correct_color)?ctrl.gameValues.score_per_correct:-ctrl.gameValues.score_minus_incorrect) * ((correct_sequence)?ctrl.gameValues.score_per_correct:1);

		current_trial.results.responses.push({
			correct_color:correct_color,
			correct_sequence:correct_sequence,
			correct_location: seq[query_index],
			score: score,
			resp: Utils.endRT(),
			user_location: grid_pos
		});

		current_trial.results.overall_correct = (!correct_color)?false:current_trial.results.overall_correct;
		current_trial.results.correct_sequence += (correct_sequence)?1:0;
		current_trial.results.correct_color += (correct_color)?1:0;
		current_trial.results.overall_rt = Utils.endRT();

		session.game_data.total_sequence_bonus += (correct_sequence)?1:0;
		session.game_data.total_location_correct += (correct_color)?1:0;

		session.game_data.total_score += score;

		if (session.game_data.total_score < 0) {
			session.game_data.total_score = 0;
		}
	}
}

var GameFourControllerHelpers = {
	setTrialData:function() {
		var session = ctrl.session,
			trials = session.game_data.trials;

		trials.push({
			responses:[],
			query_responses:[],
			passwords:[],
			hits:0,
			misses:0,
			correct:true,
			rt:0,
			database_data:{}
		});
	},

	startTrialData:function() {
		var session = ctrl.session,
			current_trial = ctrl.session.game_data.trials[ctrl.session.current_trial],
			trials = session.game_data.trials,
			round_id = session.round.id;

		data = {
			start:moment().format('YYYY-MM-DD hh:mm:ss'),
			stop:moment().format('YYYY-MM-DD hh:mm:ss'),
			round_id:round_id, 
			level:session.current_level, 
			correct:0, 
			response_time:0
		}

		// current_trial.database_data = data;
		
		return(data);
	},

	addResponse:function(correct, question, password) {
		var session = ctrl.session,
			current_trial = session.game_data.trials[ctrl.session.current_trial];
		
		if (correct) {
			current_trial.passwords.push({word:password, resp_id:current_trial.responses.length});	
		}

		current_trial.responses.push({
			rt:Utils.endRT(),
			correct:correct,
			question:question,
			trial_idx: session.current_trial
		});
	},

	addQueryResponse:function(correct, value, order, click_order) {
		var session = ctrl.session,
			current_trial = session.game_data.trials[ctrl.session.current_trial];

		current_trial.query_responses.push({
			rt:Utils.endRT(),
			correct:correct,
			word:value,
			in_order: order === click_order,
			order: order,
			click_order: click_order
		});
	}
}

var GameFiveControllerHelpers = {
	getCorrectArmy:function(armies) {
		var correct_army = 0;
		armies.forEach(function(a, idx){
			if (a.correct) {
				correct_army = idx
			}
		});

		return( armies[ correct_army ] );
	},

	isCorrectLocation:function(user_coords, armies, click_idx) {
		//not done...need to search for correct one and then see if the index is the same.
		var found = false,
			in_order = false,
			correct_army;

		armies.forEach(function(a, idx){
			
			if (user_coords.x === a.coords.x && user_coords.y === a.coords.y) {
				found = true;
				correct_army = a;

				if (idx === click_idx) {
					in_order = true;
				}
			}
		});

		return({correct:found, order_bonus:in_order, correct_army:correct_army});
	}
};

var Game7Utils = {
	isNumber:function(digit) {
		return(ctrl.gameValues.number_list.indexOf(digit) > -1);
	}
}

var Utils = {
	showlogs:true,
	error_messages:{
		"SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry":"Username Already Exists"
	},

	default:function(object, param, def) {
		return(object.hasOwnProperty(param)?object[param]: def)
	},

	getCurrentTrial:function(ctrl){
		return(ctrl.session.game_data.trials[ ctrl.session.current_trial ]);
	},

	getCurrentLevel:function(ctrl){
		return(ctrl.levels[ctrl.session.current_level]);
	},

	startTrialData:function(ctrl) {
		var session = ctrl.session,
			current_trial = ctrl.session.game_data.trials[ctrl.session.current_trial],
			trials = session.game_data.trials,
			round_id = session.round.id;

		data = {
			start:moment().format('YYYY-MM-DD hh:mm:ss'),
			stop:moment().format('YYYY-MM-DD hh:mm:ss'),
			round_id:round_id, 
			level:session.current_level, 
			correct:0, 
			response_time:0
		}
		
		return(data);
	},

	addTrialData:function(ctrl, params){
		var session = ctrl.session;

		data = {
			start: 			moment().format('YYYY-MM-DD hh:mm:ss'),
			stop: 			moment().format('YYYY-MM-DD hh:mm:ss'),
			round_id: 		session.round.id, 
			level: 			session.current_level, 
			correct: 		false,
			responses: 		[],
			data: 			params
		}
		
		return(data);
	},

	endTrial:function(ctrl, params){
		var session = ctrl.session,
			current_trial = session.game_data.trials[session.current_trial];
			
		current_trial.stop = moment().format('YYYY-MM-DD hh:mm:ss');
		current_trial.correct = params.correct;

		session.game_data.total_correct += (params.correct)?1:0;
		session.game_data.avg_acc = session.game_data.total_correct/session.game_data.trials.length;
		
		session.game_data.total_rt += moment(current_trial.stop).diff(current_trial.start, "ms");
		session.game_data.avg_rt = session.game_data.total_rt/session.game_data.trials.length;
		
	},

	addResponse:function(ctrl, params) {
		var session = ctrl.session,
			current_trial = Utils.getCurrentTrial(ctrl);

		data = {
			correct: params.correct,
			response_time:Utils.endRT(),
			data:params.data
		}
		
		return(data);
	},

	doLog:function(message, logType) {
		logType = (logType)?logType:"log";

		if (Utils.showlogs) {
			console[logType](message);
		}
	},

	changeScore:function(score_change, screens) {
		var session = ctrl.session,
			new_score = session.total_score + score_change;	
		
		new_score = (!new_score || new_score < 0)?0:new_score;
		session.total_score = (!session.total_score || session.total_score<0)?0:session.total_score;

		var def = screens.hud.actions.setScore(session.total_score, new_score);
		session.total_score = new_score;

		return(def.promise());
	},

	lerp:function(x, x1, x2, y1, y2) {
		return(y1 + (y2 - y1)*( (x-x1) / (x2-x1) ) );
	},

	getRandomKey:function(obj){
		var keys = _.keys(obj);

		return( keys[ _.random(keys.length-1) ]);
	},

	getRandomDigitSequence:function(seq, length){
		length = length || 10;
		seq = seq || ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

		return(_.shuffle(seq).slice(0, length));
	},

	centerGraphic:function(obj, objBounds, conBounds) {
		if (!conBounds) {
			conBounds = {};
			
			conBounds.width = 860;
			conBounds.height = 550;
		}

		if ("width" in objBounds)
			obj.x = conBounds.width/2 - objBounds.width/2;

		if ("height" in objBounds)
			obj.y = conBounds.height/2 - objBounds.height/2;
	},

	startRT:function(){
		window.start_time = moment();
	},

	endRT:function(){
		return(moment().diff(window.start_time, "ms"));
	},

	addRound:function(ctrl){
		var session = ctrl.session,
			total_correct = 0,
			trial_range = _.range(session.current_round*ctrl.constants.trials_per_round, (session.current_round+1)*ctrl.constants.trials_per_round);

		_.map(trial_range, function(i){
			
			if (session.game_data.trials[i].correct) {
				total_correct ++;
			}
		});

		session.game_data.rounds.push({
			trials:trial_range,
			total_correct:total_correct,
			accuracy: total_correct/ctrl.constants.trials_per_round
		});

		return(session.game_data.rounds[session.game_data.rounds.length-1]);
	},

	getLevelChange:function(ctrl){
		var session = ctrl.session,
			current_round = ctrl.session.game_data.rounds[ctrl.session.current_round],
			level_change = 0;

		if (current_round.accuracy >= 0.666 && session.current_level < 15) {
			level_change = 1;
		} else if (current_round.accuracy <= 0.333  && session.current_level > 0) {
			level_change = -1;
		}

		return(level_change);
	},

	isGameEnd:function(ctrl){
		var session = ctrl.session,
			constants = ctrl.constants;

		return((session.current_round + 1 === constants.total_rounds));
	},

	isRoundEnd:function(ctrl){
		var session = ctrl.session,
			constants = ctrl.constants;

		return ((session.current_trial + 1) % constants.trials_per_round === 0);
	},

	splitText:function(textArr, format, color, spacing, align) {
		var container = new createjs.Container(),
			textItems = [],
			width = 0,
			spacing = spacing | 10,
			baseline = "center",
			align = align | "center",
			x = 0;
		
		textArr.forEach(function(text, idx){
			if (_.isObject(format)) {
				fmt = format.hasOwnProperty(idx)?format[idx]:format["default"];
			} else {
				fmt = format;
			}

			var text = new createjs.Text(text, fmt, color);
			
			text.x = x;
			text.textBaseline = baseline;
			text.textAlign = "left";

			width += text.getMeasuredWidth() + spacing;

			x += text.getMeasuredWidth() + spacing;
			container.addChild(text);
			textItems.push(text);
		});

		var alignReg = {"left":0, "right":width, "center":width/2}
		container.regX = alignReg[align];

		return({container:container, textItems:textItems});
	},

	animSeq:function(items, queue, animp) {
		
		items.forEach(function(t, idx){
			pause = 0;

			if (_.isObject(animp.pause) && idx > 0){
				pause = (animp.pause.hasOwnProperty(idx-1))?animp.pause[idx-1]:animp.pause.default;
			} else {
				pause = animp.pause;
			}

			if (_.isObject(animp.display)){
				display = (animp.display.hasOwnProperty(idx))?animp.display[idx]:animp.display.default;
			} else {
				display = animp.display;
			};
			
			
			animp.to.delay = pause;
			queue.fromTo(t, display, animp.from, animp.to);
		});
	}
}

var IOHelpers = {
	sendRequest:function(request, params){
		var def = $.Deferred();
		var requestObj = {
			url: request.url,
			type: request.verb,
			dataType: 'json'
		};
		
		if (!_.isEmpty(params)) {
			requestObj.data = 'data=' + JSON.stringify(params);
		}

		$.ajax(requestObj).done(function(data) {
			console.log("retrieved " + request.verb + ":" + request.url + ".");

			if (!data.hasOwnProperty('success')){
				var newObj = {
					'success':1,
					'data':data
				};

				data = newObj;
			}

			if (data['success'] === 1) {
				def.resolve(data['data']);
			} else {
				console.log(data);

				// var error_message = GameControllerHelpers.error_messages[data['message'].substr(0, 69)];
				// error_message = (error_message)?error_message:data['message'];
				
				console.log("Error:");
				console.log(data['message']);
				// alert(GameControllerHelpers.error_messages[data['message'].substr(0, 69)]);
			}
			
		});

		return(def);
	},

	//admin stuff
	getSites:function (params) {
		console.log('Querying Sites...');
		var queryDef = IOHelpers.sendRequest({url:"/sites", verb:"get"}, params);

		return(queryDef);
	},

	getSite:function (id) {
		console.log('Querying Site ' + id + '...');
		var queryDef = IOHelpers.sendRequest({url:"/sites/" + id, verb:"get"});

		return(queryDef);
	},

	getGroups:function (params) {
		console.log('Querying Groups...');
		var queryDef = IOHelpers.sendRequest({url:"/groups", verb:"get"}, params);

		return(queryDef);
	},

	getGroup:function (id) {
		console.log('Querying Group ' + id + '...');
		var queryDef = IOHelpers.sendRequest({url:"/groups/" + id, verb:"get"});

		return(queryDef);
	},

	getUsers:function (params) {
		console.log('Querying Users...');
		var queryDef = IOHelpers.sendRequest({url:"/users", verb:"get"}, params);

		return(queryDef);
	},

	searchUsers:function (params) {
		console.log('Querying Users...');
		var queryDef = IOHelpers.sendRequest({url:"/users/search", verb:"get"}, params);

		return(queryDef);
	},

	getUser:function (id) {
		console.log('Querying User ' + id + '...');
		var queryDef = IOHelpers.sendRequest({url:"/users/" + id, verb:"get"});

		return(queryDef);
	},

	getPlays:function(params) {
		console.log('Querying Plays...');
		var queryDef = IOHelpers.sendRequest({url:"/plays", verb:"get"}, params);

		return(queryDef);
	},


	getPlay:function(play_id) {
		console.log('Querying Play...');
		var queryDef = IOHelpers.sendRequest({url:"/plays/" + play_id, verb:"get"});

		return(queryDef);
	},

	getTrials:function(play_id, params) {
		console.log('Querying Trials...');

		var queryDef = IOHelpers.sendRequest({url:'/plays/' + play_id + '/trials', verb:"get"}, params);

		return(queryDef);
	},

	getRoundtrials:function(play_id) {
		console.log('Querying Round Trials...');
		
		var queryDef = IOHelpers.sendRequest({url:'/plays/' + play_id + '/roundtrials', verb:"get"});

		return(queryDef);
	},

	createGroup:function(params) {
		console.log('Creating Group...');

		var createDef = IOHelpers.sendRequest({url:"/groups", verb:'post'}, params);

		return(createDef);
	},

	createSite:function(params) {
		console.log('Creating Site...');

		var createDef = IOHelpers.sendRequest({url:"/sites", verb:'post'}, params);

		return(createDef);
	},

	createUser:function(params) {
		console.log('Creating User...');

		var createDef = IOHelpers.sendRequest({url:"/users", verb:'post'}, params);

		return(createDef);
	},

	editGroup:function(id, params) {
		console.log('Editing Group ' + id + '...');

		var createDef = IOHelpers.sendRequest({url:"/groups/" + id + '/edit', verb:'post'}, params);

		return(createDef);
	},

	editSite:function(id, params) {
		console.log('Editing Site ' + id + '...');

		var createDef = IOHelpers.sendRequest({url:"/sites/" + id + '/edit', verb:'post'}, params);

		return(createDef);
	},

	editUser:function(id, params) {
		console.log('Editing User ' + id + '...');

		var createDef = IOHelpers.sendRequest({url:"/users/" + id + '/edit', verb:'post'}, params);

		return(createDef);
	},

	deleteGroup:function(group_id, params) {
		console.log('Deleting Group...');

		var createDef = IOHelpers.sendRequest({url:"/groups/" + group_id + '/delete', verb:'post'}, params);

		return(createDef);
	},

	deleteSite:function(site_id, params) {
		console.log('Deleting Site...');

		var createDef = IOHelpers.sendRequest({url:"/sites/" + site_id + '/delete', verb:'post'}, params);

		return(createDef);
	},

	deleteUser:function(user_id, params) {
		console.log('Deleting User...');
		// console.log(params);
		var createDef = IOHelpers.sendRequest({url:"/users/" + user_id + '/delete', verb:'post'}, params);

		return(createDef);
	},


	deactivateUser:function(user_id, params) {
		console.log('Deactivating User...');

		var createDef = IOHelpers.sendRequest({url:"/users/" + user_id + "/toggleActivate", verb:"post"}, params);

		return(createDef);
	},

	deactivateGroup:function(group_id, params) {
		console.log('Deactivating Group...');

		var createDef = IOHelpers.sendRequest({url:"/groups/" + group_id + "/toggleActivate", verb:"post"}, params);

		return(createDef);
	},

	toggleMissionsGroup:function(group_id, params) {
		console.log('Toggle Missions on Group...');

		var createDef = IOHelpers.sendRequest({url:"/groups/" + group_id + "/toggleMissions", verb:"post"}, params);

		return(createDef.promise());
	},
	
	deactivateSite:function(site_id, params) {
		console.log('Deactivating Site...');

		var createDef = IOHelpers.sendRequest({url:"/sites/" + site_id + "/toggleActivate", verb:"post"}, params);

		return(createDef);
	},
	
	getUserGroups:function(id) {
		console.log("Retrieving User groups");

		var def = IOHelpers.sendRequest({url:"/users/" + id + "/groups", verb:"get"});

		return(def);
	},

	getUserSites:function(id) {
		console.log("Retrieving User sites");

		var def = IOHelpers.sendRequest({url:"/users/" + id + "/sites", verb:"get"});

		return(def);
	},

	getGroupGames:function(id) {
		console.log("Retrieving Group games");

		var def = IOHelpers.sendRequest({url:"/groups/" + id + "/games", verb:"get"});

		return(def);
	},

	getGroupUsers:function(id) {
		console.log("Retrieving Group Users");
		var def = IOHelpers.sendRequest({url:"/groups/" + id + "/users", verb:"get"});
		return(def);
	},

	getSiteUsers:function(id) {
		console.log("Retrieving Site users");
		var def = IOHelpers.sendRequest({url:"/sites/" + id + "/users", verb:"get"});
		return(def);
	},

	getGames:function() {
		console.log("Retrieving Games");

		var def = IOHelpers.sendRequest({url:"/games", verb:"get"});

		return(def);
	},

	addUserToGroup:function(group_id, user_id, return_user) {
		console.log("Add User to Group");

		var def = IOHelpers.sendRequest({url:"/groups/" + group_id + "/users/" + user_id, verb:"post"}, {return_user:return_user});

		return(def);
	},

	removeUserFromGroup:function(group_id, user_id, return_user) {
		console.log("Remove User from Group");

		var def = IOHelpers.sendRequest({url:"/groups/" + group_id + "/users/" + user_id + '/delete', verb:"post"}, {return_user:return_user});

		return(def);
	},

	addUserToSite:function(site_id, user_id, return_user){
		console.log("Add User to Site");

		var def = IOHelpers.sendRequest({url:"/sites/" + site_id + "/users/" + user_id, verb:"post"}, {return_user:return_user});

		return(def);
	},

	removeUserFromSite:function(site_id, user_id, return_user){
		console.log("Remove User from Site");

		var def = IOHelpers.sendRequest({url:"/sites/" + site_id + "/users/" + user_id + '/delete', verb:"post"}, {return_user:return_user});

		return(def);
	},

	addGameToGroup:function(group_id, game_id){
		console.log("Add Game to Group");

		var def = IOHelpers.sendRequest({url:"/groups/" + group_id + "/games/" + game_id, verb:"post"});

		return(def);
	},

	removeGameFromGroup:function(group_id, game_id){
		console.log("Remove Game from Group");

		var def = IOHelpers.sendRequest({url:"/groups/" + group_id + "/games/" + game_id + '/delete', verb:"post"});
		return(def);
	},

	getPlayCSV:function(params){
		console.log('Getting Play CSV...');

		var createDef = IOHelpers.sendRequest({url:"/plays/csv", verb:"get"}, params);
		return(createDef);
	},

	getTrialCSV:function(params){
		console.log('Getting Trial CSV...');

		var queryDef = IOHelpers.sendRequest({url:"/trials/csv", verb:"get"}, params);

		return(queryDef);
	},

	getRoundCSV:function(params){
		console.log('Getting Round CSV...');

		var createDef = IOHelpers.sendRequest({url:"/roundtrials/csv", verb:"get"}, params);
		return(createDef);
	},

	getUserCSV:function(params){
		console.log('Getting User CSV...');

		var createDef = IOHelpers.sendRequest({url:"/users/csv", verb:"get"}, params);
		return(createDef);
	},

	getLoggedInUser:function(){
		console.log('Getting LoggedIn User data...');

		var createDef = IOHelpers.sendRequest({url:"/users/logged", verb:"get"});
		return(createDef);
	},

	//game syncing
	syncGame:function(data) {
		// console.log('SYNCING GAME...');

		// $.ajax({
		// 	url: "/game/" + game.id + "/syncGame",
		// 	type: "post",
		// 	data: 'data=' + data,
		// 	dataType: 'json'
		// }).done(function(data) {
		// 	console.log("SYNCED.");
		// });
	},

	startPlaythrough:function(params) {
		var def = IOHelpers.sendRequest({url:"/plays", verb:"post"}, params);

		return(def);
	},

	updatePlaythrough:function(play_id, params) {
		var def = IOHelpers.sendRequest({url:"/plays/" + play_id + "/edit", verb:"post"}, params);

		return(def);
	},

	startTrial:function(play_id, params) {
		var def = IOHelpers.sendRequest({url:"/plays/" + play_id + "/trials", verb:"post"}, params);

		return(def);
	},

	endTrial:function(trial_id, params) {
		var def = IOHelpers.sendRequest({url:"/trials/" + trial_id + "/edit", verb:"post"}, params);

		return(def);
	},

	addRound:function(play_id) {
		var def = IOHelpers.sendRequest({url:"/plays/" + play_id + "/rounds", verb:"post"});

		return(def);
	},


	endRound:function(round_id) {
		var def = IOHelpers.sendRequest({url:"/rounds/" + round_id + "/edit", verb:"post"});

		return(def);
	},

	addRoundTrial:function(round_id, params) {
		var def = IOHelpers.sendRequest({url:"/rounds/" + round_id + "/roundtrials", verb:"post"}, params);

		return(def);
	},


	endRoundTrial:function(roundtrial_id, params) {
		var def = IOHelpers.sendRequest({url:"/roundtrials/" + roundtrial_id + "/edit", verb:"post"}, params);

		return(def);
	},

	getLevels:function(user_id) {
		var def = IOHelpers.sendRequest({url:"/users/" + user_id + "/levels", verb:"get"});
		return(def);
	},

	getLevel:function(user_id, game_id) {
		var def = IOHelpers.sendRequest({url:"/users/" + user_id + "/games/" + game_id + "/level", verb:"get"});
		return(def);
	},

	setLevel:function(user_id, game_id, level) {
		if (level < 1)
			level = 1;
		
		var def = IOHelpers.sendRequest({url:"/users/" + user_id + "/games/" + game_id + "/level", verb:"post"}, {level:level});
		return(def);
	}
}