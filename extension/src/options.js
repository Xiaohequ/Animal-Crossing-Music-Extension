'use strict';

//on page loaded
$(function(){
	//restore options
	restoreOptions();
	
	//music select radio list
	$(".option").click(function(event){
		printDebug("option click");
		//save options
		saveOptions();
	});
	$("#enable-live-weather").click(function(event){
		$("#weather").show($(this).attr("checked"));
	});

	// About/Help
	$("#get-help").click(function() {
		window.open('https://chrome.google.com/webstore/detail/animal-crossing-music/fcedlaimpcfgpnfdgjbmmfibkklpioop/support');
	});
	$("#report-an-issue").click(function() {
		window.open('https://chrome.google.com/webstore/detail/animal-crossing-music/fcedlaimpcfgpnfdgjbmmfibkklpioop/support');
	});
	$("#help-us-out").click(function() {
		window.open('https://github.com/JdotCarver/Animal-Crossing-Music-Extension/');
	});
});

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
	var enableRandom				= false;

	var gameChoices = document.getElementsByName("music-choice");
	var checkedMusic = [];
	var choice;
	for(var i=0; i < gameChoices.length; i++){
		choice = gameChoices[i];
		if(choice.checked){
			if(choice.value === "-1"){ //random checkbox
				enableRandom = true;
			}else{					//game checkbox
				checkedMusic.push(choice.value);
			}
		}
	}

	chrome.storage.sync.set({
		volume             : volume,
		music              : checkedMusic[0],  //retro compatible
		games              : checkedMusic,
		random              : enableRandom,
		enableNotifications: enableNotifications,
		enableKK           : enableKK,
		alwaysKK           : alwaysKK,
		enableTownTune     : enableTownTune,
		zipCode            : zipCode,
		countryCode        : countryCode,
		enableBadgeText    : enableBadgeText,
		enableLiveWeather  : enableLiveWeather
	}, function() {});
}

function restoreOptions() {
	chrome.storage.sync.get({
		volume             : 0.5,
		games				: ['30'], //new leaf
		enableNotifications: true,
		enableKK           : true,
		alwaysKK           : false,
		enableTownTune     : true,
		zipCode            : "98052",
		countryCode        : "us",
		enableBadgeText    : true,
		enableLiveWeather  : false,
		random              : false,
	}, function(items) {
		document.getElementById('volume').value                 = items.volume;
		for(var i=0; i < items.games.length; i++){
			$("#music-" + items.games[i]).attr("checked", true);
		}
		$("#random").attr("checked", items.random);
		document.getElementById('enable-notifications').checked = items.enableNotifications;
		document.getElementById('no-kk').checked                = true;
		document.getElementById('enable-kk').checked            = items.enableKK;
		document.getElementById('always-kk').checked            = items.alwaysKK;
		document.getElementById('enable-town-tune').checked     = items.enableTownTune;
		document.getElementById('zip-code').value               = items.zipCode;
		document.getElementById('country-code').value           = items.countryCode;
		document.getElementById('enable-badge').checked         = items.enableBadgeText;
		document.getElementById('enable-live-weather').checked  = items.enableLiveWeather;
		$("#weather").show(items.enableLiveWeather);
	});
}
