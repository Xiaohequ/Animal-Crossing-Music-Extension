// Globally accessible helper functions

'use strict';

var DEBUG_FLAG = true;

// format text for the badge and for the song URL
function formatHour(time) {
	if (time === -1) {
		return '';
	}
	if (time === 0) {
		return '12am';
	}
	if (time === 12) {
		return '12pm';
	}
	if (time < 13) {
		return time + 'am';
	}
	return (time - 12) + 'pm';
}

function audioPlaying() {
	chrome.tabs.query({
		audible: true
	}, function(tabs) {
		return tabs.length;
	});
}

function getRandomNumber(start, end){
	return Math.floor(Math.random() * end) + start;
}

function printDebug(message) {
	if (DEBUG_FLAG) console.log(message);
}

function arrayDifference(a1, a2) {
	  var result = [];
	  for (var i = 0; i < a1.length; i++) {
	    if (a2.indexOf(a1[i]) === -1) {
	      result.push(a1[i]);
	    }
	  }
	  for (i = 0; i < a2.length; i++) {
	    if (a1.indexOf(a2[i]) === -1) {
	      result.push(a2[i]);
	    }
	  }
	  return result;
}