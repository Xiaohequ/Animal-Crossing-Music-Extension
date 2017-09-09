// Handles Chrome notifications

'use strict';

function NotificationManager(addEventListener, isEnabled) {
	const clockPngPath = "../assets/img/clock.png";

	function popMusicNotification(hour) {
		chrome.notifications.create('animal-crossing-music', {
			type: 'basic',
			title: 'Animal Crossing Music',
			message: 'It is now ' + formatHour(hour) + 'm!',
			iconUrl: clockPngPath
		});
	}
	
	function popWeatherNotification(weather) {
		var weatherString;
		switch(weather) {
			case "Rain":
				weatherString = "raining";
				break;
			case "Snow":
				weatherString = "snowing";
				break;
			default:
				weatherString = "clear";
		}
		
		chrome.notifications.create('animal-crossing-music', {
			type: 'basic',
			title: 'Animal Crossing Music',
			message: 'It is now ' + weatherString + '!',
			iconUrl: clockPngPath
		});
	}

	function popKKNotification() {
		chrome.notifications.create('animal-crossing-music', {
			type: 'basic',
			title: 'Animal Crossing Music',
			message: 'K.K. Slider has started to play!',
			iconUrl: clockPngPath
		});

	}

	addEventListener("hourMusic", function(hour) {
		if (isEnabled()) {
			popMusicNotification(hour);
		}
	});
	
	addEventListener("weatherChange", function(weather) {
		if (isEnabled()) {
			popWeatherNotification(weather);
		}
	});

	addEventListener("kkStart", function() {
		if (isEnabled()) {
			popKKNotification();
		}
	});

}