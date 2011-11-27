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
/*global WebKitCSSMatrix, F5*/

(function () {
				
	function attachTracker(el) {
		var tracking;
		var startLocation;
		var startTransform;

		F5.addTouchStartListener(el, function (e) {
			tracking = true;
			startLocation = F5.eventLocation(e);
			var transformMatrix = new WebKitCSSMatrix(el.style.webkitTransform);
			startTransform = {x: transformMatrix.m41, y: transformMatrix.m42};
			el.style['-webkit-transition'] = 'opacity 1s';						
		});

/*
		document.body.addEventListener('mousewheel', function (e) {
			var transformMatrix = new WebKitCSSMatrix(el.style.webkitTransform);
			startTransform = {x: transformMatrix.m41, y: transformMatrix.m42};																				

			el.style['-webkit-transform'] = 'translate3d(' + (-e.wheelDeltaX/10 + startTransform.x) +
					'px,' + (-e.wheelDeltaY/10 + startTransform.y) + 'px, 0px)';
					
			console.log(JSON.stringify({x: e.wheelDeltaX, y: e.wheelDeltaY}));
		});
*/

		F5.addTouchMoveListener(document.body, function (e) {
			var currentLocation = F5.eventLocation(e);
			if (tracking) {
				var deltaH = currentLocation.x - startLocation.x;
				var deltaY = currentLocation.y - startLocation.y;
				el.style['-webkit-transform'] = 'translate3d(' + (deltaH + startTransform.x) +
						'px,' + (deltaY + startTransform.y) + 'px, 0px)';								
			}			
		});

		F5.addTouchStopListener(document.body, function (e) {
			tracking = false;
			el.style['-webkit-transition'] = '';
		});
	}			
	
	function StaticText() {
		this.construct = function (data) {
			var id = this.el.getAttribute('f5_id');
			this.el.innerText = data[id];
		};
	}
	
	function Picture() {
		this.construct = function (data) {
			var id = this.el.getAttribute('f5_id');

			var img = document.createElement('img');
			var src = F5.sourceFromResourceUrl(data[id]);
			if (data[id].match('data:image')) {
				img.src = src;
			} else {
				img.src = F5.imageServerHost + src;				
			}
			this.el.appendChild(img);
		};
	}
	
	F5.WidgetPrototypes.Picture = new Picture();	
	F5.WidgetPrototypes.StaticText = new StaticText();	
		
	function attachWidget(el, data) {
		var type = el.getAttribute('f5_widget');
		F5.assert(F5.WidgetPrototypes[type], 'No widget: ' + type);
		var widget = F5.objectFromPrototype(F5.WidgetPrototypes[type]);
		widget.el = el;
		el.widget = widget;
		
		var className = el.getAttribute('f5_class');
		if (className) {
			F5.addClass(el, className);
		}
		widget.construct(data);		
	}
	
	// TODO: unify all of the widgets under the same API
		
	F5.UI = {
		attachWidget: attachWidget,
		attachTracker: attachTracker
	};
}());
