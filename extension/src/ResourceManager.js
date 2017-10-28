/**
 * 
 */

function ResourceManager(){
	const weatherRefs = {
		"0" : "normal",
		"1" : "raining",
		"2" : "snowing"
	};
	const games = {
			1: "animal-forrest",
			2: "wild-world",
			3: "new-leaf",
	};
	const kkSongFolder = "kk-songs";
	const audiosRepositoryUrl = "https://s3.eu-west-2.amazonaws.com/animal-crossing-music/";
	
	printDebug("Resouce manager start");
	var mthis = this;
	mthis.currentDowload = {game: null, hour: null, weather: null};
	mthis.downloadCompleteNotifer = null;
	mthis.downloadFaildNotifer = null;
	//download manager
	var queue = new createjs.LoadQueue();
	queue.on("complete", onDownloadCompleteListener, mthis);
	queue.on("error", onDownloadFailListener);
	//audio cache
	var audioCache = {};

	 // ************* *******************

	 this.getResource = function(game, hour, weather){
		 //handle random game generation
		 game = _getFinalGame(game, weather);
		 printDebug("getResource( g: " + game + " h: " + hour + " w: " + weather + " )");
		 return new Promise(function(resolve, reject){
			 //get audio file of game & name
			 var audioSrc;
			 //-search in file cache
			 if(audioCache.hasOwnProperty(game) && audioCache[game].hasOwnProperty(hour)){
				 //return audio src
				 resolve(getAudioCache(game, hour, weather)); 
			 }else{
				 //-if not found then download
				 mthis.currentDowload = {game: game, hour: hour, weather: weather};
				//handle download event
				 mthis.downloadCompleteNotifer = resolve;
				 mthis.downloadFaildNotifer = reject;
	
				 //start download
				 var urlStr = _getResource(game, hour);
				 printDebug("download: " + urlStr);
				 queue.loadFile({id:"sound", src: urlStr});
			 }
		 });
	 }
	 
	function onDownloadCompleteListener(){
		 printDebug("download complete for: " + mthis.currentDowload.game + "--" + formatHour(mthis.currentDowload.hour));
		 //-download complete: store file in cache
		 var audioSrc = queue.getResult("sound").src;
		 //store in cache
		 pushAudioCache(mthis.currentDowload.game, mthis.currentDowload.hour, mthis.currentDowload.weather, audioSrc);
		 //ready for playback: return back audio src
		 if(typeof mthis.downloadCompleteNotifer === 'function')
			 mthis.downloadCompleteNotifer(audioSrc);
	}
	
	function onDownloadFailListener(){
		 console.error(e);
		 if(typeof mthis.downloadFaildNotifer === 'function')
			 mthis.downloadFaildNotifer(e);
	}
	
	 
	 function _getFinalGame(game, weather){
		 var gameRef = game.charAt(0);
		 var gameWeatherThemeRef = game.charAt(1);
		 
		 if(game === "-1"){ //random
			 //genarate random game & weather
			 //game bewteen 1-3
			 gameRef = getRandomNumber(1, 3);
			 //weather bewteen 0-2
			 gameWeatherThemeRef = getRandomNumber(0, 2);
		 }
		 if(weather){ //if weather live enable
			 gameWeatherThemeRef = getWeatherRef(weather)
		 }		 
		 return gameRef + "" + gameWeatherThemeRef; //convert to string
	 }
	 
	 function _getResource(game, hour){
		 var gameRef = game.charAt(0);
		 var gameWeatherThemeRef = game.charAt(1);
		 //setup game folder name
		 var gameFolderName = getGameFolderName(gameRef);
		 //setup wheater folder name
		 var weatherFolderName = weatherRefs[gameWeatherThemeRef]; //weather ref locate in second charater of game name: 10, 11, 20...
		 //setup song name
		 var songFileName = formatHour(hour) + ".ogg";
		 //return final url
		 return audiosRepositoryUrl + gameFolderName + "/" + weatherFolderName + "/" + songFileName;
	 }

	 function getGameFolderName(gameIndex){
		 if(gameIndex && gameIndex > 0){
			 return games[gameIndex];
		 }
		 return games["1"];
	 }
	 
	 function getWeatherRef(weatherStr){
		 if(weatherStr === "Rain"){
			 return "1";
		 }else if(weatherStr === "Snow"){
			 return "2";
		 }else{
			 return "0";
		 }
	 }
	 
	 function getAudioCache(game, hour, weather){
		 return audioCache[game][hour];
	 }
	 
	 function pushAudioCache(game, hour, weather, src){
		 printDebug("cache: " + game + " - " + hour);
//		 audioCache[game][name] = src;
	 }
}