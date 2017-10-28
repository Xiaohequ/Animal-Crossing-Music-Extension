/**
 * 
 */
chrome.app.runtime.onLaunched.addListener(function() {
	//on app launch
	//create app window
  chrome.app.window.create('assets/background.html', {
	 id: "animal-crossing-music-frame",
    'innerBounds': {
      'width': 300,
      'height': 500
    },
//    frame: "none",
    resizable: false,
  });
});