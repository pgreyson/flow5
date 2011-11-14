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
		
	F5.post = function(url, body, success, error, headers) {
		var xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		
		if (headers) {
			headers.forEach(function (id, value) {
				xhr.setRequestHeader(id, value);
			});
		}
		
		xhr.onreadystatechange = function (e) {
			switch (xhr.readyState) {
			case xhr.UNSENT:
//				console.log('XMLHttpRequest.UNSENT');
				break;
			case xhr.OPENED:
//				console.log('XMLHttpRequest.OPENED');				
				break;
			case xhr.HEADERS_RECEIVED:
//				console.log('XMLHttpRequest.HEADERS_RECEIVED');					
				break;
			case xhr.LOADING:
//				console.log('XMLHttpRequest.LOADING');					
				break;
			case xhr.DONE:	
				if (xhr.status === 200) {
					if (success) {
						var responseHeaders = {};
						if (headers) {
							headers.forEach(function (id, value) {
								responseHeaders[id] =  xhr.getResponseHeader(id);
							});													
						}
						
						success(xhr.responseText, responseHeaders);
					}
				} else {
					if (error) {
						error(xhr.responseText);
					}
				}
//				console.log('XMLHttpRequest.LOADING');
				break;				
			}								
		};
		
		// WORKAROUND: it seems that xhr.send can cause pending events to fire with reentrancy
		// TODO: build test case. need something that takes a long time right after send, and then
		// some queued events
		setTimeout(function () {
			/*global Iuppiter*/
//			var compressed = Iuppiter.Base64.encode(Iuppiter.compress(body));
//			xhr.send(compressed);
			xhr.send(body);
		}, 0);		
	};
	
	
	// TODO: need a better name
	// this function takes the user data and combines it with data from the images
	// and string files to create a structure which contains all the data that is going
	// to be used by a widget or view tempalte
	F5.getNodeData = function (node, userData) {
		// if arg2 is provided, copy out its fields
		var data = {};
		function assign(id, value) {
			if (!data[id]) {
				data[id] = value;				
			} else {
				// TODO: this allows strings and images to be combined
				if (typeof value === 'object') {
					F5.assert(typeof data[id] === 'object', 'mismatched data schema');
					value.forEach(function (valueid, value) {
						data[id][valueid] = value;
					});
				} else {
					console.log('Data field name shadowed');					
				}
			}
		}
		if (userData && typeof userData === 'object') {
			userData.forEach(assign);
		}
		
		// then add all of the strings resources associated with this node and ancestors
		while (node) {
			var strings = F5.Strings[node.id];
			if (strings) {
				strings.forEach(assign);				
			}
			var images = F5.Images[node.id];
			if (images) {
				images.forEach(assign);
			}
			node = node.parent;
		}
		
		return data;
	};	
	
	F5.assert = function(condition, message) {
		// TODO: disable in release builds?
		if (!condition) {
			throw new Error(message);
		}
	};
	
	F5.objectFromPrototype = function(prototype) {
		function Instance() {}
		Instance.prototype = prototype;
		return new Instance();
	};
	
	F5.callback = function (cb, arg) {
		try {
			cb(arg);
		} catch (e) {
			console.log(e.message);
		}
	};
	
}());




