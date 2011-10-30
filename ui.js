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
/*global define WebKitCSSMatrix F5*/

define('ui', exports, function (exports) {

	function eventLocation(event) {
		var x, y;
		if (navigator.userAgent.match(/(iPhone)|(Android)/i)) {
			if (event.touches[0]) {
				x = event.touches[0].screenX;
				y = event.touches[0].screenY;					
			} else {
				x = event.changedTouches[0].screenX;
				y = event.changedTouches[0].screenY;			
			}	
		}		
		else {
			x = event.clientX;
			y = event.clientY; 
		}	

		return {x: x, y: y};
	}

	function startEventName() {
		if (navigator.userAgent.match(/(iPhone)|(Android)/i)) {
			return 'touchstart';		
		}
		else {
			return 'mousedown';				
		}
	}

	function stopEventName() {
		if (navigator.userAgent.match(/(iPhone)|(Android)/i)) {
			return 'touchend';		
		}
		else {
			return 'mouseup';				
		}
	}

	function moveEventName() {
		if (navigator.userAgent.match(/(iPhone)|(Android)/i)) {
			return 'touchmove';		
		}
		else {
			return 'mousemove';		
		}
	}
	
	function addTouchListener(el, cb) {
		el.addEventListener(startEventName(), cb);
	}

	function addMoveListener(el, cb) {
		el.addEventListener(moveEventName(), cb);
	}
	
	function addStopListener(el, cb) {
		el.addEventListener(stopEventName(), cb);
	}	
	
	function addTracker(el) {
		var tracking;
		var startLocation;
		var startTransform;

		addTouchListener(el, function (e) {
			tracking = true;
			startLocation = eventLocation(e);
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

		addMoveListener(document.body, function (e) {
			var currentLocation = eventLocation(e);
			if (tracking) {
				var deltaH = currentLocation.x - startLocation.x;
				var deltaY = currentLocation.y - startLocation.y;
				el.style['-webkit-transform'] = 'translate3d(' + (deltaH + startTransform.x) +
						'px,' + (deltaY + startTransform.y) + 'px, 0px)';								
			}			
		});

		addStopListener(document.body, function (e) {
			tracking = false;
			el.style['-webkit-transition'] = '';
		});
	}
	
	function attachNavbar(container) {
		
		var navbarEl = document.createElement('div');
		navbarEl.className = 'navbar';
		container.insertBefore(navbarEl, container.firstChild);	
						
		var leftButtonEl = document.createElement('div');
		leftButtonEl.className = 'leftbutton';
		leftButtonEl.style.visibility = 'hidden';
		navbarEl.appendChild(leftButtonEl);

		var titleEl = document.createElement('div');
		titleEl.className = 'title';
		navbarEl.appendChild(titleEl);

		var rightButtonEl = document.createElement('div');
		rightButtonEl.className = 'rightbutton';
		rightButtonEl.style.visibility = 'hidden';
		navbarEl.appendChild(rightButtonEl);
		
		function configureNavbar(node) {
			// find the leaf node
			while (node.selection) {
				node = node.selection;
			}		
			
			titleEl.innerHTML = node.id;													

			var configuration = {};
			while (node && (!configuration.left || !configuration.right)) {
				var nodeConfiguration = node.view.getNavigationControllerConfiguration();
				if (nodeConfiguration) {
					if (!configuration.left) {
						configuration.left = nodeConfiguration.left;
					}
					if (!configuration.right) {
						configuration.right = nodeConfiguration.right;
					}					
				}
				
				node = node.parent;
			}

			if (configuration.left) {
				leftButtonEl.style.visibility = '';
				leftButtonEl.innerText = configuration.left.label;					
			} else {
				leftButtonEl.style.visibility = 'hidden';					
			}
			if (configuration.right) {
				rightButtonEl.style.visibility = '';
				rightButtonEl.innerText = configuration.right.label;					
			} else {
				rightButtonEl.style.visibility = 'hidden';					
			}	
			
			F5.Global.navigationControllerConfiguration = configuration;
		}				

		F5.UI.Utils.addTouchListener(leftButtonEl, function () {
			F5.Global.navigationControllerConfiguration.left.action();
		});																					

		F5.UI.Utils.addTouchListener(rightButtonEl, function () {
			F5.Global.navigationControllerConfiguration.right.action();
		});																					

		F5.Global.navigationController = {
			start: function () {
				configureNavbar(F5.Global.flow.root);
			},
			doSelection: function (node, id) {
				configureNavbar(node.children[id]);
			},
			doTransition: function (container, id, to) {
				configureNavbar(to);
			},
			startSubflow: function () {
				leftButtonEl.style.visibility = 'hidden';						
			},
			syncSet: function (node) {
				configureNavbar(node);
			},
			completeSubflow: function () {
				configureNavbar(F5.Global.flow.root);
			}
		};		
	}	
	
	function Button() {		
		this.construct = function () {
			// nothing to do yet
		};
		
		this.setAction = function (cb) {
			this.el.addEventListener(startEventName(), function (e) {
				e.preventDefault();
				cb();
			});
		};
	}	
		
	exports.UI = {
		Widgets: {
			button: new Button()
		},
		Utils: {
			attachNavbar: attachNavbar,
			addTracker: addTracker,
			startEventName: startEventName,
			stopEventName: stopEventName,
			moveEventName: moveEventName,
			addTouchListener: addTouchListener,
			addMoveListener: addMoveListener,
			addStopListener: addStopListener					
		}
	};
	
});