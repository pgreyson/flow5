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
/*global F5:true*/

(function () {
	if (typeof F5 === 'undefined') {
		F5 = {};
	}
	F5.pkg = 'f5';
	F5.Prototypes = {};
	F5.Flows = {};
	F5.Resources = {};
	F5.Global = {};
	F5.Services = {};
		
	F5.pendingModules = [];
	var packageStack = [];
	F5.registerModule = function (cb) {
		F5.pendingModules.push({pkg: packageStack[0], cb: cb});
	};
	
	F5.pushPkg = function (pkg) {
		packageStack.push(pkg);
	};
	
	F5.popPkg = function () {
		packageStack.pop();
	};	
	
	function add(obj, path, data) {
		var elements = path.split('.');
		while (elements.length) {
			var key = elements.shift();
			if (!obj[key]) {
				obj[key] = {};
			}
			obj = obj[key];
		}
		F5.extend(obj, data);
	}
	
	F5.addFlows = function (pkg, flows) {
		add(F5.Flows, pkg, flows);
	};

	F5.addResources = function (pkg, flows) {
		add(F5.Resources, pkg, flows);
	};
}());	
