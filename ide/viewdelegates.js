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
/*global F5, IDE, JSONFormatter*/

(function () {	
	
	function postMessage(node, type, message) {
		F5.Global.flow.root.children.app.view.delegate.postMessage({
			type: type,
			id: node.path,
			message: message
		});
	}
	
	window.addEventListener('message', function (e) {
		var node = F5.Global.flow.diags.getNodeFromPath(e.data.id);
		if (node && node.view) {
			node.view.delegate.receiveMessage(e.data.message);			
		}
	});
	
	
	
	
	function Root() {
		this.initialize = function () {
			
		};
		
		// TODO: currently only nav messages go to root
		this.receiveMessage = function (message) {
			postMessage(this.node.children.dev.children.model, 'eval', 
				'(function () {return {"json": F5.Global.flow.diags.toJSON(),\
				  "activeLeafNodeId": F5.Global.flow.diags.getActiveLeafNode().id};}())');
		};
		
		this.load = function (data) {			
			this.node.children.app.view.delegate.load(data);
		};
		
		this.send = function (message) {
					
		};
	}			
	
	function App() {
		this.initialize = function () {
			this.frame = F5.getElementById(this.el, 'frame');
		};
		
		this.load = function (data) {
			var geometry = data.geometry.split('x');
			this.frame.style.width = geometry[0];
			this.frame.style.height = geometry[1];
			
			this.frame.widget.open(data.url);
			
			IDE.cache.url = data.url;
			IDE.cache.geometry = data.geometry;
		};
		
		this.postMessage = function (message) {
			this.frame.widget.postMessage(message);
		};
		
		this.viewWillBecomeActive = function () {
			if (IDE.cache.geometry && IDE.cache.url) {
				this.load(IDE.cache);								
			}
		};
	}
	
	function Dev() {
		this.initialize = function () {

		};
	}

	function Config() {
		this.initialize = function () {
			var form = F5.getElementById(this.el, 'form');
			
			form.widget.setOnSubmit(function () {
				F5.Global.flow.root.view.delegate.load(form.widget.getFormData());
			});			
		};
	}
	
	
	function Model() {
		
		this.initialize = function () {
			this.json = F5.getElementById(this.el, 'json');
		};	
		
		this.receiveMessage = function (message) {
			this.json.innerHTML = '';
			
			var jsonFormatter = new JSONFormatter();
			var json = jsonFormatter.valueToHTML(JSON.parse(message.json));
							
			this.json.innerHTML = json;						
			jsonFormatter.attachListeners();																	
			
			F5.forEach(this.json.querySelectorAll('.collapser'), function (collapser) {
				jsonFormatter.collapse(collapser);
			});
			
			var activeNode = json;
			while (activeNode.selection) {
				activeNode = activeNode.selection;
			}
						
			var activeId = 'json-' + message.activeLeafNodeId;
			var activeDiv = document.getElementById(activeId);
			while (activeDiv.parentElement !== this.json) {
				var collapser = activeDiv.parentElement.firstChild;
				if (F5.hasClass(collapser, 'collapser')) {
					jsonFormatter.collapse(collapser);						
				}
				activeDiv = activeDiv.parentElement;
			}
		};		
	}
	
	
	
	F5.Prototypes.ViewDelegates.root = new Root();
	F5.Prototypes.ViewDelegates.app = new App();
	F5.Prototypes.ViewDelegates.dev = new Dev();
	F5.Prototypes.ViewDelegates.config = new Config();
	F5.Prototypes.ViewDelegates.model = new Model();
		

}());	


/*
		
		var sequenceNumber = 0;
		function update() {	
			updateJson();
			
			sequenceNumber += 1;						
			F5.upload('POST', 'dot2svg', F5.Global.flow.diags.toDOT(), function (response, status, headers) {

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

		backbuttonEl.widget.setAction(function () {
			try {
				F5.Global.flowController.doBack();								
			} catch (e) {
				console.log('Exception: ' + e.message);
			}
		});				
		
		if (F5.platform() === 'android') {
			menubuttonEl.widget.setAction(function () {
	            var e = document.createEvent('Events'); 
	            e.initEvent('menubutton');
	            document.dispatchEvent(e);
			});			
		} else {
			menubuttonEl.style.display = 'none';
		}

		// TODO: show hide and update the jsonDiv rather than adding/removing
		jsonbuttonEl.widget.setAction(function () {
			if (jsonframeEl.style.display === 'none') {
				jsonframeEl.style.display = '';
				updateJson();
			} else {
				jsonframeEl.style.display = 'none';
			}
		});	

		framesbuttonEl.widget.setAction(function () {
			var selected = true;
			if (F5.hasClass(appframeEl, 'f5frames')) {
				F5.removeClass(appframeEl, 'f5frames');
				selected = false;				
			} else {
				F5.addClass(appframeEl, 'f5frames');
			}
		});		

		resetbuttonEl.widget.setAction(function () {
			var showViewer = localStorage.showViewer;		
			localStorage.clear();
			localStorage.showViewer = showViewer;

			location.reload();
		});		
		
		viewerbuttonEl.widget.setState(localStorage.showViewer === 'true');
		viewerbuttonEl.widget.setAction(function () {
			if (F5.hasClass(document.body, 'f5viewer')) {
				localStorage.showViewer = false;
				F5.removeClass(document.body, 'f5viewer');
			} else {
				F5.addClass(document.body, 'f5viewer');
				localStorage.showViewer = true;				
			}
		});	

		if (localStorage.showViewer && JSON.parse(localStorage.showViewer)) {
			F5.addClass(document.body, 'f5viewer');
		}	
		
		cb();	
	});
*/
