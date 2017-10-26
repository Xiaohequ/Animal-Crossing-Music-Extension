'use strict';

function saveOptions() {
	var volume              = document.getElementById('volume').value;
	var enableNotifications = document.getElementById('enable-notifications').checked;
	// 2 separate KK variables to preserve compatibility with old versions
	var alwaysKK            = document.getElementById('always-kk').checked;
	var enableKK            = alwaysKK || document.getElementById('enable-kk').checked;
	var enableTownTune      = document.getElementById('enable-town-tune').checked;
	var zipCode             = document.getElementById('zip-code').value;
	var countryCode         = document.getElementById('country-code').value;
	var enableBadgeText     = document.getElementById('enable-badge').checked;
	var enableLiveWeather   = document.getElementById('enable-live-weather').checked;

	var gameChoices = document.getElementsByName("music-choice");
	var checkedMusic = [];
	var choice;
	for(var i=0; i < gameChoices.length; i++){
		choice = gameChoices[i];
		if(choice.checked){
			checkedMusic.push(choice.value);
		}
	}

	chrome.storage.sync.set({
		volume             : volume,
		music              : checkedMusic[0],
		games              : checkedMusic,
		enableNotifications: enableNotifications,
		enableKK           : enableKK,
		alwaysKK           : alwaysKK,
		enableTownTune     : enableTownTune,
		zipCode            : zipCode,
		countryCode        : countryCode,
		enableBadgeText    : enableBadgeText,
		enableLiveWeather  : enableLiveWeather
	}, function() { });
}

function restoreOptions() {
	chrome.storage.sync.get({
		volume             : 0.5,
		music              : '30', //new leaf
		enableNotifications: true,
		enableKK           : true,
		alwaysKK           : false,
		enableTownTune     : true,
		zipCode            : "98052",
		countryCode        : "us",
		enableBadgeText    : true,
		enableLiveWeather  : false
	}, function(items) {
		document.getElementById('volume').value                 = items.volume;
		if(items.music === "-1"){
			document.getElementById("random").checked = true;
		}else{
			document.getElementById("music-" + items.music).checked = true;
		}
		document.getElementById('enable-notifications').checked = items.enableNotifications;
		document.getElementById('no-kk').checked                = true;
		document.getElementById('enable-kk').checked            = items.enableKK;
		document.getElementById('always-kk').checked            = items.alwaysKK;
		document.getElementById('enable-town-tune').checked     = items.enableTownTune;
		document.getElementById('zip-code').value               = items.zipCode;
		document.getElementById('country-code').value           = items.countryCode;
		document.getElementById('enable-badge').checked         = items.enableBadgeText;
		document.getElementById('enable-live-weather').checked  = items.enableLiveWeather;
		hideWeather();
	});
}

// Hide the weather location options based on if the option is enabled
function hideWeather() {
	if(document.getElementById('enable-live-weather').checked) {
		document.getElementById('weather').style.visibility = "visible";
	}
	else {
		document.getElementById('weather').style.visibility = "hidden";
	}
	saveOptions();
}

document.addEventListener('DOMContentLoaded', restoreOptions);

//music select radio list
var gameChoices = document.getElementsByName("music-choice");
for(var i=0; i < gameChoices.length; i++){
	gameChoices[i].onclick = saveOptions;
}
document.getElementById('volume').onchange              = saveOptions;
document.getElementById('no-kk').onclick                = saveOptions;
document.getElementById('enable-kk').onclick            = saveOptions;
document.getElementById('always-kk').onclick            = saveOptions;
document.getElementById('enable-badge').onclick         = saveOptions;
document.getElementById('enable-notifications').onclick = saveOptions;
document.getElementById('enable-town-tune').onclick     = saveOptions;
document.getElementById('enable-live-weather').onclick  = hideWeather;
document.getElementById('update-location').onclick      = saveOptions;

// About/Help
document.getElementById('get-help').onclick = function() {
	window.open('https://chrome.google.com/webstore/detail/animal-crossing-music/fcedlaimpcfgpnfdgjbmmfibkklpioop/support');
};
document.getElementById('report-an-issue').onclick = function() {
	window.open('https://chrome.google.com/webstore/detail/animal-crossing-music/fcedlaimpcfgpnfdgjbmmfibkklpioop/support');
};
document.getElementById('help-us-out').onclick = function() {
	window.open('https://github.com/JdotCarver/Animal-Crossing-Music-Extension/');
};
