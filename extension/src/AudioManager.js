// Handles playing hourly music, KK, and the town tune.

'use strict';

function AudioManager(addEventListener, isTownTune) {
	var mThis = this;
	const audioFolder = "../assets/audio";

	mThis.playList = [];
	mThis.currentAudio = null;
	mThis.currentHour = null;
	var audio = document.createElement('audio');
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
	addEventListener("volume", function(newVol) {
		audio.volume = newVol;
	});
	$.subscribe("optionChange", function(changes){
		console.log("audio manager: on option change: ");
		//volume change
		if(changes.volume){
			audio.volume = changes.volume.newValue;
		}
		//games audio change
		if(changes.games){
			//change audio
			console.log(changes.games);
			console.log(mThis);
			//add new song to the playlist
			var newSong = arrayDifference(changes.games.oldValue, changes.games.newValue);
			mThis.playList.push(newSong[0]);
			//reset audio if current playing audio removed from playList
			if(mThis.playList.length > 0 && mThis.playList.indexOf(mThis.currentAudio) === -1){ //current audio not in playlist any more
				//change audio to first audio in the play list
				playHourSong(mThis.playList[0], mThis.currentHour);
			}//else do nothing
		}
	});
	

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
		//add ended listener
		audio.addEventListener("ended", playNextSong);
	}
	
	function playNextSong(){
		//play next song on the play list
		var currentPlayListIndex = mThis.playList.indexOf(mThis.currentAudio);
		currentPlayListIndex++;
		//looping play list
		if(currentPlayListIndex > mThis.playList.length - 1) currentPlayListIndex = 0;
		//get next song	
		var nextSong = mThis.playList[currentPlayListIndex];

		console.log("play next song: " + nextSong);
		//play next song
		playAudio(nextSong, mThis.currentHour);
	}
	
	
	function playAudio(game, hour, weather){
		mThis.currentAudio = game;
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
