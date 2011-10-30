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
/*global define F5*/


define('templates', exports, function (exports) {
		
	function loadTemplate(id) {
		var instance = document.getElementById(id).cloneNode(true);
		
		var widgetEls = [];
		
		if (instance.hasAttribute('f5_widget')) {
			widgetEls.push(instance);
		}

		var nodes = instance.querySelectorAll('[f5_widget]');
		for (var i = 0; i < nodes.length; i += 1) {
			widgetEls.push(nodes.item(i));
		}		
		
		function widgetInstance(prototype) {
			function Instance() {}
			Instance.prototype = prototype;
			return new Instance();
		}
		
		widgetEls.forEach(function (el) {
			var widget = widgetInstance(F5.UI.Widgets[el.getAttribute('f5_widget')]);
			widget.el = el;
			el.widget = widget;
			widget.construct();
		});
		
		return instance;
	}
	
	exports.Templates = {loadTemplate: loadTemplate};
});