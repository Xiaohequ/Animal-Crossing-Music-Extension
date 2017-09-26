/**
 * 
 */
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('assets/background.html', {
    'outerBounds': {
      'width': 400,
      'height': 500
    }
  });
});