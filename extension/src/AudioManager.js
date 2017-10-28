// Handles playing hourly music, KK, and the town tune.

'use strict';

function AudioManager(addEventListener, isTownTune) {
	var mThis = this;
	const audioFolder = "../assets/audio";

	mThis.gamelist = [];
	mThis.currentGame = null;
	mThis.currentHour = null;
	mThis.randomGame = false;
	var audio = document.createElement('audio');
	//add ended listener
	audio.addEventListener("ended", playNextSong);
	var killLoopTimeout;
	var killFadeInterval;
	var townTuneManager = new TownTuneManager();
	const resourceManager = new ResourceManager();
	
	//add event listener
	addEventListener("hourMusic", playHourlyMusic);
	addEventListener("kkStart", playKKMusic);
	addEventListener("gameChange", playHourlyMusic);
	addEventListener("pause", function() {
		clearLoop();
		fadeOutAudio(300);
	});
	$.subscribe("optionChange", function(changes){
		printDebug("audio manager: on option change: ");
		//volume change
		if(changes.volume){
			audio.volume = changes.volume.newValue;
		}
		//games audio change
		if(changes.games){
			//change audio
			//add new song to the gamelist or delete old song
			updateGamelist(changes.games.newValue);
		}
		//random
		if(changes.random){
			mThis.randomGame = changes.random.newValue;
		}
	});
	$.subscribe("inithour", function(hour){
		mThis.currentHour = hour;
	});
	$.subscribe("initoptions", function(options){
		printDebug("audio manager: init options");
		//init volume
		audio.volume = options.volume;
		//init randomGame
		mThis.randomGame = options.random;
		//init gamelist
		updateGamelist(options.games);
	});
	
	function updateGamelist(newPlaylist){
		if(newPlaylist){
			mThis.gamelist = newPlaylist;
			//reset audio if current playing audio removed from gamelist
			if(mThis.gamelist.length > 0 && mThis.gamelist.indexOf(mThis.currentGame) === -1){ //current audio not in playlist any more
				//change audio to first audio in the play list
				fadeOutAudio(500, playNextSong);
			}//else do nothing
		}
	}
	
	// isHourChange is true if it's an actual hour change,
	// false if we're activating music in the middle of an hour
	function playHourlyMusic(hour, game, isHourChange, weather) {
		clearLoop();
		audio.loop = true;
		audio.removeEventListener("ended", playKKSong);
		//handle hour change , play hour tune 
		const fadeOutLength = isHourChange ? 3000 : 500;
		fadeOutAudio(fadeOutLength, function() {
			if (isHourChange && isTownTune()) {
				townTuneManager.playTune(function() {
					playHourSong(game, hour, false, weather);
				});
			} else {
				playHourSong(game, hour, false, weather);
			}
		});
	}

	// Plays a song for an hour, setting up loop times if
	// any exist
	function playHourSong(game, hour, skipIntro, weather) {
		audio.loop = false;
		var loopTime = (loopTimes[game] || {})[hour];
		// set up loop points if loopTime is set up for this
		// game and hour
		if(loopTime) {
			var delayToLoop = loopTime.end;
			if(skipIntro) {
				audio.currentTime = loopTime.start;
				delayToLoop -= loopTime.start;
			}
			audio.onplay = function() {
				var loopTimeout = setTimeout(function() {
					printDebug("looping");
					playHourSong(game, hour, true, weather);
				}, delayToLoop * 1000);
				killLoopTimeout = function() {
					clearTimeout(loopTimeout);
					audio.onplay = function() {};
					loopTimeout = null;
				};
			}
		}
		playAudio(game, hour, weather);
	}
	
	function playNextSong(){
		//play next song on the play list
		var currentPlayListIndex = mThis.gamelist.indexOf(mThis.currentGame);
		if(mThis.randomGame){
			//check play list has more than one song
			if(mThis.gamelist.length > 1){
				//play random other than current song
				//generate random index
				var randomIndex = getRandomNumber(0, mThis.gamelist.length-1);
				currentPlayListIndex = randomIndex === currentPlayListIndex ? randomIndex + 1 : randomIndex;
			} //else play current song again
		}else{
			currentPlayListIndex++;
		}
		//looping play list
		if(currentPlayListIndex < 0 || currentPlayListIndex > mThis.gamelist.length - 1) currentPlayListIndex = 0;
		
		//get next song	
		var nextSong = mThis.gamelist[currentPlayListIndex];

		printDebug("play next song: " + nextSong);
		//play next song
		playAudio(nextSong, mThis.currentHour);
	}
	
	
	function playAudio(game, hour, weather){
		mThis.currentGame = game;
		mThis.currentHour = hour;
		resourceManager.getResource(game, hour, weather).then(function(audioSrc){
			//setup audio
			audio.src = audioSrc;
			//play audio
			audio.play();
		});
	}


	function playKKMusic() {
		clearLoop();
		audio.loop = false;
		audio.addEventListener("ended", playKKSong);
		fadeOutAudio(500, playKKSong);
	}

	function playKKSong() {
		var randomSong = Math.floor((Math.random() * 36) + 1).toString();
		audio.src = audioFolder + '/kk/' + randomSong + '.ogg';
		audio.play();
	}

	// clears the loop point timeout and the fadeout
	// interval if one exists
	function clearLoop() {
		if(typeof(killLoopTimeout) === 'function') {
			killLoopTimeout();
		}
		if(typeof(killFadeInterval) === 'function') {
			killFadeInterval();
		}
	}

	// Fade out audio and call callback when finished.
	function fadeOutAudio(time, callback) {
		if (audio.paused) {
			if (callback) callback();
		} else {
			var oldVolume = audio.volume;
			var step = audio.volume / (time / 100.0);
			var fadeInterval = setInterval(function() {
				if (audio.volume > step) {
					audio.volume -= step;
				} else {
					clearInterval(fadeInterval);
					audio.pause();
					audio.volume = oldVolume;
					if (callback) callback();
				}
			}, 100);
			killFadeInterval = function() {
				clearInterval(fadeInterval);
				audio.volume = oldVolume;
				killFadeInterval = null;
			}
		}
	}
}
