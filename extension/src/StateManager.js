// Manages the current state of the extension, views can register to it
// and it will notify certain events.

'use strict';

function StateManager() {
	const defaultOptions = {
			volume: 0.5,
			music: '10',
			games: ["30"], //new leaf
			random: false, 
			enableNotifications: true,
			enableKK: true,
			alwaysKK: false,
			paused: false,
			enableTownTune: true,
			//enableAutoPause: false,
			zipCode: "98052",
			countryCode: "us",
			enableBadgeText: true,
			enableLiveWeather: false
		};

	var self = this;

	var options = {};
	var callbacks = {};

	var timeKeeper = new TimeKeeper();
	var weatherManager;
	var isKKTime;
	
	//register event listeners
	//TODO

	this.registerCallback = function(event, callback) {
		callbacks[event] = callbacks[event] || [];
		callbacks[event].push(callback);
	};

	this.getOption = function(option) {
		return options[option];
	};

	this.activate = function() {
		isKKTime = timeKeeper.getDay() == 6 && timeKeeper.getHour() >= 20;
		//init hour
		$.publish("inithour", [timeKeeper.getHour()]);
		getSavedOptions(function(items) {
			options = items;
			if(!weatherManager) {
				weatherManager = new WeatherManager(options.zipCode, options.countryCode);
				weatherManager.registerChangeCallback(function() {
					if(!isKK() && isLive()) {
						notifyListeners("gameChange", [timeKeeper.getHour(), getChoosenGame(), false, weatherManager.getWeather()]);
						notifyListeners("weatherChange", [weatherManager.getWeather()]);
					}
				});
			}
			
			//on app load, start music
			//play playlist
			//notify option has been init
			$.publish("initoptions", [options]);
			
			if (isKK()) {
				notifyListeners("kkStart");
			}
			else {
				//notifyHourMusic(false);
			}
		});
	};

	// Possible events include:
	// volume, kkStart, hourMusic, gameChange, weatherChange, pause
	function notifyListeners(event, args) {
		if (!options.paused || event === "pause") {
			var callbackArr = callbacks[event] || [];
			for(var i = 0; i < callbackArr.length; i++) {
				callbackArr[i].apply(window, args);
			}
			printDebug("Notified listeners of " + event + " with args: " + args);
		}
	}

	function isKK() {
		return options.alwaysKK || (options.enableKK && isKKTime);
	}

	function isLive() {
		return options.enableLiveWeather && (options.music.startsWith("2") || options.music.startsWith("3")); //wild world or new leaf chosen
	}

	// retrieve saved options
	function getSavedOptions(callback) {
		chrome.storage.sync.get(defaultOptions, function(items) {
			if (typeof callback === 'function') {
				callback(items);
			}
		});
	}
	
	function getCurrentWeather(){
		return isLive() ? weatherManager.getWeather() : "";
	}
	
	function getChoosenGame(){
		return options.music;
	}

	// Gets the current game based on the option, and weather if
	// we're using a live weather option.
	function getMusic() {
		if(isLive()) {
			var currentWeather = weatherManager.getWeather();
			if(currentWeather === "Rain")
				return options.music + "-raining";
			else if(currentWeather === "Snow")
				return options.music + "-snowing";
			else
				return options.music;
		}
		else {
			if (options.music === "random"){
				let games = ['animal-forrest',
										'wild-world',
										'wild-world-raining',
										'wild-world-snowing',
										'new-leaf',
										'new-leaf-raining',
										'new-leaf-snowing'];
				return games[Math.floor(Math.random() * games.length)];
			} else
				return options.music;

		}
	}

	// If we're not playing KK, let listeners know the hour has changed
	// If we enter KK time, let listeners know
	timeKeeper.registerHourlyCallback(function(day, hour) {
		var wasKK = isKK();
		isKKTime = day == 6 && hour >= 20;
		if (isKK() && !wasKK) {
			notifyListeners("kkStart");
		}
		else if (!isKK()) {
			notifyHourMusic(true);
		}
	});
	
	function notifyHourMusic(playTownTune){
		notifyListeners("hourMusic", [timeKeeper.getHour(), getChoosenGame(), playTownTune, getCurrentWeather()]);
	}

	// Update our options object if stored options changes, and notify listeners
	// of any pertinent changes.
	chrome.storage.onChanged.addListener(function(changes, namespace) {
		console.log("option change occured: ");
		console.log(changes);
		
		$.publish("optionChange", changes);
		
		//TODO optimize
		var wasKK = isKK();
		var oldMusic = getMusic();
		//define options reader
		var optionsReader = function(items) {
			options = items;
			//notify manages option changes
			if(typeof changes.zipCode !== 'undefined') {
				weatherManager.setZip(options.zipCode);
			}
			if(typeof changes.countryCode !== 'undefined') {
				weatherManager.setCountry(options.countryCode);
			}
//			if (typeof changes.volume !== 'undefined') {
//				notifyListeners("volume", [changes.volume.newValue]);
//			}
//			if (typeof changes.music !== 'undefined' && !isKK() && getMusic() != oldMusic) {
//				notifyListeners("gameChange", [timeKeeper.getHour(), getMusic()]);
//			}
			if (isKK() && !wasKK) {
				notifyListeners("kkStart");
			}
			if (!isKK() && wasKK) {
				notifyHourMusic(false);
			}
		};
		
		//read saved options
		chrome.storage.sync.get(defaultOptions, optionsReader);
	});

	// play/pause when user clicks the extension icon
	/*// extension function
	chrome.browserAction.onClicked.addListener(function() {
		chrome.storage.sync.set({ paused: !options.paused }, function() {
			getSavedOptions(function() {
				if (options.paused) {
					notifyListeners("pause");
				} else {
					self.activate();
				}
			});
		});
	});
	*/

	// Gives easy access to the notifyListeners function if
	// we're debugging.
	if(DEBUG_FLAG) {
		window.notify = notifyListeners;
		window.setTime = function(hour, playTownTune) {
			notifyHourMusic(playTownTune);
		};
	}

}
