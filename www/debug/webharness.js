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
/*global define, F5, localStorage, JSONFormatter*/

(function () {		
	F5.addF5ReadyListener(function () {
		var appframeEl = document.getElementById('appframe');

		var viewerframeEl = F5.Templates.loadTemplate('viewerframe');
		document.body.appendChild(viewerframeEl);

		var viewerbuttonEl = F5.Templates.loadTemplate('viewerbutton');
		document.body.appendChild(viewerbuttonEl);

		var viewerEl = viewerframeEl.querySelector('[f5_id=viewer]'),
			svgframeEl = viewerframeEl.querySelector('[f5_id=svgframe]'),
			jsonframeEl = viewerframeEl.querySelector('[f5_id=jsonframe]'),
			jsonbuttonEl = viewerframeEl.querySelector('[f5_id=jsonbutton]'),
			framesbuttonEl = viewerframeEl.querySelector('[f5_id=framesbutton]'),
			resetbuttonEl = viewerframeEl.querySelector('[f5_id=resetbutton]'),
			backbuttonEl = viewerframeEl.querySelector('[f5_id=backbutton]');

		F5.UI.attachTracker(svgframeEl);

		var sequenceNumber = 0;
		function update() {	
			F5.setStyles(backbuttonEl, {
				'background-color': F5.Global.flowController.hasBack() ? 'lightblue' : 'grey',
				'border': '2px solid ' + (F5.Global.flowController.hasBack() ? 'white' : 'black'),
			});				

			sequenceNumber += 1;						
			F5.post('dot2svg', F5.Global.flow.diags.toDOT(), function (response, headers) {

				if (parseInt(headers['sequence-number'], 10) !== sequenceNumber) {
					return;
				}

				function makeClick(el) {
					el.onclick = function () {	
						try {
							var parts = el.id.replace('svg-', '').split(':');
							var nodePath = parts[0].split('_')[0];
							if (parts[1]) {
								var method = parts[1].split('_')[0];

								if (method) {
									var components = nodePath.split('-').splice(1);
									var id = parts[1].split('_')[1];	

									F5.Global.flowController[method](F5.Global.flow.diags.getNodeFromPath(nodePath), id, function () {

									});										
								}									
							}
						} catch (e) {
							console.log('Exception: ' + e.message);
						}													

					};
				}

				svgframeEl.innerHTML = response;

				var svg = svgframeEl.querySelector('svg');

				var transform = svg.querySelector('g').getAttribute('transform');
				transform = transform.replace('scale(1 1)', 'scale(0.4 0.4)');
				svg.querySelector('g').setAttribute('transform', transform);

				// Make the main poly the same color as background
				// OPTION: would be nice to do this on the DOT side
				document.getElementById('graph1').querySelector('polygon').setAttribute('fill', 'darkslategray');
				document.getElementById('graph1').querySelector('polygon').setAttribute('stroke', '');

				// the clickable elements have id with / prefix
				F5.forEach(document.querySelectorAll('[id^="svg-"]'), function (el) {
					makeClick(el);
				});

				// determine the offset of the current node
				var activeLeafNode = F5.Global.flow.diags.getActiveLeafNode();

				var svgElementBBox = document.getElementById('svg-' + activeLeafNode.path).getBBox();
				var svgRootBBox = svg.getBBox();

				var offset = {x: svgElementBBox.x - svgRootBBox.width * 0.4, 
								y: svgRootBBox.height + svgElementBBox.y + svgRootBBox.height * 0.4};

				svgframeEl.style['-webkit-transform'] = 
								'translate3d(' + -offset.x * 0.4 + 'px,' + -offset.y * 0.4 + 'px, 0px)';
			}, function (error) {
				console.log('error');
			}, {'sequence-number': sequenceNumber});
		}	

		F5.Global.flowController.addFlowObserver({
			start: function () {
				update();
			},
			startSubflow: function () {
				update();
			},
			syncSet: function (node) {
				update();
			},
			completeSubflow: function () {
				update();
			},
			asyncOperationComplete: function () {
				update();
			}
		});
		update();

		// make the back button
		F5.addTapListener(backbuttonEl, function () {
			try {
				F5.Global.flowController.doBack();								
			} catch (e) {
				console.log('Exception: ' + e.message);
			}
		});				

		var jsonDiv;

		// TODO: show hide and update the jsonDiv rather than adding/removing
		F5.addTapListener(jsonbuttonEl, function () {
			if (jsonDiv) {
				jsonframeEl.removeChild(jsonDiv);
				jsonDiv = null;
				jsonframeEl.style.display = '';
			} else {
				try {					
					var jsonFormatter = new JSONFormatter();
					jsonDiv = document.createElement('div');
					F5.addClass(jsonDiv, 'json');
					jsonDiv.innerHTML = jsonFormatter.valueToHTML(JSON.parse(F5.Global.flow.diags.toJSON()));

					jsonframeEl.appendChild(jsonDiv);
					jsonframeEl.style.display = 'block';
					jsonFormatter.attachListeners();																
				} catch (e) {
					console.log('Exception: ' + e.message);
				}	
			}
			F5.setStyles(jsonbuttonEl, {
				'background-color': jsonDiv ? 'lightblue' : 'grey',
				'border': '2px solid ' + (jsonDiv ? 'white' : 'black')								
			});							
		});	

		F5.addTapListener(framesbuttonEl, function () {
			var selected = true;
			if (F5.hasClass(appframeEl, 'f5frames')) {
				F5.removeClass(appframeEl, 'f5frames');
				selected = false;				
			} else {
				F5.addClass(appframeEl, 'f5frames');
			}
			F5.setStyles(framesbuttonEl, {
				'background-color': selected ? 'lightblue' : 'grey',
				'border': '2px solid ' + (selected ? 'white' : 'black')								
			});										
		});		

		F5.addTapListener(resetbuttonEl, function () {
			var showViewer = localStorage.showViewer;
			localStorage.clear();
			localStorage.showViewer = showViewer;

			location.reload();
		});		

		if (!localStorage.showViewer) {
			localStorage.showViewer = true;
		}
		function updateViewerButton() {
			var showViewer  = JSON.parse(localStorage.showViewer);
			F5.setStyles(viewerbuttonEl, {
				'background-color': showViewer ? 'lightblue' : 'grey',
				'border': '2px solid ' + (showViewer ? 'white' : 'black')								
			});																
		}
		F5.addTapListener(viewerbuttonEl, function () {
			if (viewerframeEl.style.display === 'none') {
				viewerframeEl.style.display = '';
				localStorage.showViewer = true;
			} else {
				localStorage.showViewer = false;
				viewerframeEl.style.display = 'none';				
			}
			updateViewerButton();
		});	
		updateViewerButton();

		if (localStorage.showViewer && JSON.parse(localStorage.showViewer)) {
			viewerframeEl.style.display = '';
		} else {
			viewerframeEl.style.display = 'none';
		}		
	});	
}());	
