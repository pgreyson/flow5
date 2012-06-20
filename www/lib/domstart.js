/***********************************************************************************************************************

	Copyright (c) 2011 Paul Greyson

	Permission is hereby granted, free of charge, to any person 
	obtaining a copy of this software and associated documentation 
	files (the "Software"), to deal in the Software without 
	restriction, including without limitation the rights to use, 
	copy, modify, merge, publish, distribute, sublicense, and/or 
	sell copies of the Software, and to permit persons to whom the 
	Software is furnished to do so, subject to the following 
	conditions:

	The above copyright notice and this permission notice shall be 
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
	OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
	HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
	WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
	FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR 
	OTHER DEALINGS IN THE SOFTWARE.

***********************************************************************************************************************/

/*global F5*/

(function () {	
					
	// TODO: this is a bit strange. pass in the newly created F5 Client below
(function (F5) {
		
	
	if (F5.isDebug()) {
		F5.forEach(localStorage, function (id, value) {
//			console.log(id + ': ' + value);			
		});
	}
		
	// TODO: specify a mock image server location
	if (F5.isMobile()) {
		F5.addClass(document.body, 'f5mobile');
		F5.imageServerHost = 'http://www.flow5.com/';
	} else {
		F5.imageServerHost = '';
	}
		
	// prevent scrolling
	document.body.addEventListener('touchmove', function (e) {
		e.preventDefault();
	});
	
	// prevent the webview from doing click stuff
	document.body.addEventListener('click', function (e) {
		e.preventDefault();
	});	
	
	if (F5.isMobile()) {
		window.onscroll = function () {
			if (document.body.scrollTop) {
				document.body.scrollTop = 0;				
			}
		};		
	}

	function hideAddressBar() {
		setTimeout(function () {
			window.scrollTo(0, 0);
		}, 100);
	}
	
	function setupScreenGeometry(isMobile, isNative) {
//		if (F5.isDebug()) {
//			F5.addClass(document.body, 'f5debug');
//		}

		var width, height, style;
		// in mobile browser, to get the full height of the device, have to size content so that it overflows
		// the window by the same amount as the top toolbar. then scrolling to 0 will move the toolbar up
		if (isMobile && !isNative && navigator.userAgent.match(/iphone/i)) {
			if (window.innerWidth > window.innerHeight) {
				width = window.innerHeight;
				height = window.innerWidth;
			} else {
				width = window.innerWidth;
				height = window.innerHeight;
			}
			var statusbar;
			if (screen.width > screen.height) {
				statusbar = screen.width - screen.availWidth;
			} else {
				statusbar = screen.height - screen.availHeight;
			}

			// on iOS the window can be scrolled so that the location bar is clipped
			// TODO: would love to be able to determine these sizes programtically but so far no luck
			var portraitToolbar = 0;
			var landscapeToolbar = 0;

			// NOTE: this handles the ios webapp case. android still needs wo
			if (window.innerHeight !== screen.availHeight) {
				portraitToolbar = 44;
				landscapeToolbar = 30;			
			}

			style = document.createElement('style');			
			style.innerHTML = '@media screen and (orientation: portrait)\n\
								{\n\
									.f5mobile #f5screen {\n\
										width:' + screen.width + 'px;\n\
										height:' + (screen.height - (statusbar + portraitToolbar)) + 'px;\n\
									}\n\
								}\n\
								@media screen and (orientation: landscape)\n\
								{\n\
									.f5mobile #f5screen {\n\
										width:' + screen.height + 'px;\n\
										height:' + (screen.width - (statusbar + landscapeToolbar)) + 'px;\n\
									}\n\
								}';
			document.body.appendChild(style);						

			document.addEventListener('orientationchange', function () {
				setTimeout(function () {
					window.scrollTo(0, 0);
				}, 0);			
			});		
		} else if (F5.query.geometry) {
			// TODO: consolidate with server.js
			switch (F5.query.geometry) {
			case 'iphone-portrait':
				width = 320;
				height = 460;
				break;
			case 'iphone-landscape':
				width = 480;
				height = 300;
				break;
			case 'ipad-portrait':
				height = 1004;
				width = 768;
				break;
			case 'ipad-landscape':
				height = 748;
				width = 1024;
				break;
			default:			
				var size = F5.query.geometry.split('x');
				width = size[0];
				height = size[1];
				break;
			}
			width += 'px';
			height += 'px';
			style = document.createElement('style');	
			if (F5.isMobile()) {
				style.innerHTML = '.f5mobile #f5screen {width: ' + width + '; height: ' + height+ ';}';				
			} else {
				style.innerHTML = '#f5screen {width: ' + width + '; height: ' + height+ ';}';								
			}
			document.body.appendChild(style);
		}	
	}	

	window.addEventListener('load', hideAddressBar, false);
	window.addEventListener('touchstart', hideAddressBar, false);
		
	// TODO: use the device block of manifest to avoid the PhoneGap reference
	var startEvent, listener;
	if (F5.isNative()) {
		startEvent = 'deviceready';
		listener = document;
	} else {
		startEvent = 'load';
		listener = window;
	}
	
	/*global shouldRotateToOrientation: true*/
	// TODO: this is a phonegap thing. . .
	shouldRotateToOrientation = function () {
		// let the plist specify
	};

	listener.addEventListener(startEvent, function startHandler(e) {	
		function startUp() {			
			
			// also do this after importing a package
			F5.scopePackages();
			F5.parseResources(F5.appPkg);
			if (F5.isDebug()) {
				F5.parseSchemas(F5.appPkg);				
			}			
									
			// create the essential divs
			var appframeEl = document.createElement('div');
			appframeEl.id = 'f5appframe';
			
			// NOTE: by adding the application package class to the appframe, system objects like
			// dialogs etc. can be styled by the application css packages by applying styling
			// #f5screen (which is one level below appframe)
			F5.addClass(appframeEl, F5.packageClass());
			
			var screenframeEl = document.createElement('div');
			screenframeEl.id = 'f5screen';		
			appframeEl.appendChild(screenframeEl);
			document.body.appendChild(appframeEl);

			setupScreenGeometry(F5.isMobile(), F5.isNative());	
										
			try {
				F5.Global.flowController.start(function () {
					// TODO: extract
					/*global PhoneGap*/
					console.log('started');
					var splash = document.getElementById('f5splash');
					if (splash) {
						// TODO: why is the delay required?
						setTimeout(function () {
							splash.style.display = 'none';							
						}, 1000);
					}
					setTimeout(function () {
						if (typeof PhoneGap !== 'undefined') {
							// TODO: unify
							console.log('hiding splash: ' + F5.platform());
							if (F5.platform() === 'android') {
								setTimeout(function () {
								    PhoneGap.exec(F5.noop, F5.noop, "App", "hideSplashScreen", [false]);
								}, 500);
							} else {
								PhoneGap.exec(
									function (result) { // success
									console.log(result);
								}, function (result) { // failure
									console.log(result);
								}, "com.phonegap.splashscreen", "hide", []);									
							}							
						}						
					}, 1000); 
					// NOTE: the delay shouldn't be necessary, but on older devices	
					// sometimes the webview doesn't reflow completely before the
					// splashscreen is hidden otherwise																		
				});
			} catch (exception) {
				console.log(exception.message);
				document.body.className = 'errorframe';
				document.body.innerHTML = exception.message;
			}
		}
		// increase to delay to allow attaching to webview from remote debugger
		function start() {
			setTimeout(startUp, 0);
		}
	
		function updateReady() {
			console.log('updateready');
			window.location.reload();
		}
				
		window.applicationCache.addEventListener('updateready', function (e) {
			updateReady();
		}, false);
		if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
			updateReady();
		}

		if (window.applicationCache.status === window.applicationCache.IDLE || 
			window.applicationCache.status === window.applicationCache.UNCACHED) {
			start();			
		} else {
			window.applicationCache.addEventListener('noupdate', function (e) {
				console.log('noupdate');
				start();
			}, false);

			window.applicationCache.addEventListener('cached', function (e) {
				console.log('cached');
				start();
			}, false);

			window.applicationCache.addEventListener('error', function (e) {
				console.log('error');
				start();
			}, false);			
		}				
	}, false);	
	
}(F5.Clients.f5));
					
}());


/*
	// Fired after the first cache of the manifest.
	appCache.addEventListener('cached', handleCacheEvent, false);

	// Checking for an update. Always the first event fired in the sequence.
	appCache.addEventListener('checking', handleCacheEvent, false);

	// An update was found. The browser is fetching resources.
	appCache.addEventListener('downloading', handleCacheEvent, false);

	// The manifest returns 404 or 410, the download failed,
	// or the manifest changed while the download was in progress.
	appCache.addEventListener('error', handleCacheError, false);

	// Fired after the first download of the manifest.
	appCache.addEventListener('noupdate', handleCacheEvent, false);

	// Fired if the manifest file returns a 404 or 410.
	// This results in the application cache being deleted.
	appCache.addEventListener('obsolete', handleCacheEvent, false);

	// Fired for each resource listed in the manifest as it is being fetched.
	appCache.addEventListener('progress', handleCacheEvent, false);

	// Fired when the manifest resources have been newly redownloaded.
	appCache.addEventListener('updateready', handleCacheEvent, false);

*/