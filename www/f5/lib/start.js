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

	F5.Global.flow = new F5.Flow(F5.valueFromId(F5.Flows, F5.query.pkg));		
	F5.Global.flowController = new F5.FlowController(F5.Global.flow);	
	F5.Global.viewController = new F5.ViewController(F5.Global.flow);
				
	// TODO: not so happy with this
	var clients = {};
	
	function Client(pkg) {
		this.pkg = pkg;
		
		// setup a prototype root for the package
		var prototypeRoot = F5.Prototypes;
		var resourcesRoot = F5.Resources;
		pkg.split('.').forEach(function (component) {
			prototypeRoot[component] = prototypeRoot[component] || {};
			prototypeRoot = prototypeRoot[component];

			resourcesRoot[component] = resourcesRoot[component] || {};
			resourcesRoot = resourcesRoot[component];
		});
		
		this.Prototypes = prototypeRoot;
		this.Prototypes.Widgets = {};
		this.Prototypes.FlowDelegates = {};
		this.Prototypes.ViewDelegates = {};
		
		this.Resources = resourcesRoot;
	}
	
	// bootstrap
	Client.prototype = F5;

	clients.f5 = new Client('f5');
	
	// all clients get the f5 root namespace
	// TODO: probably want to limit this to the needed set of interfaces
	Client.prototype = clients.f5;
	
	F5.pendingModules.forEach(function (module) {
		clients[module.pkg] = clients[module.pkg] || new Client(module.pkg);
		module.cb(clients[module.pkg]);
	});
	delete F5.pendingModules;
	
	
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
		}, 0);
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
									
			// create the essential divs
			var appframeEl = document.createElement('div');
			appframeEl.id = 'f5appframe';
			var screenframeEl = document.createElement('div');
			screenframeEl.id = 'f5screen';		
			appframeEl.appendChild(screenframeEl);
			document.body.appendChild(appframeEl);

			F5.setupScreenGeometry(F5.isMobile(), F5.isNative());	
										
			try {
				F5.Global.flowController.start(function () {
					// TODO: extract
					/*global PhoneGap*/
					console.log('started');
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
	
}(clients.f5));
					
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