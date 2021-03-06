/***********************************************************************************************************************

	Copyright (c) 2012 Paul Greyson

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

// TODO: move to a separate package
F5.registerModule(function (F5) {		
	// TODO: make the apis available configurable from client
		
	function loadGoogleApi() {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = 'http://maps.googleapis.com/maps/api/js?libraries=geometry,geocode&sensor=true&callback=F5.noop';
		document.body.appendChild(script);
		
		F5.distanceInMeters = function (loc1, loc2) {
			/*global google*/
			var latLng1 = new google.maps.LatLng(loc1.lat, loc1.lng);
			var latLng2 = new google.maps.LatLng(loc2.lat, loc2.lng);
			return google.maps.geometry.spherical.computeDistanceBetween(latLng1, latLng2);		
		};			
	}
	
	F5.Global.flowController.addWaitTask(function (cb) {
		function onlineCb(online) {			
			if (online) {
				F5.connection.removeStatusChangeCallback(onlineCb);
				loadGoogleApi();
			}
		}		
		
		// if network is connected, load maps. otherwise set a flag to load when network comes online
		if (F5.connection.online()) {
			loadGoogleApi();
		} else {
			F5.connection.addStatusChangeCallback(onlineCb);
		}		
		
		cb();
	});			
});