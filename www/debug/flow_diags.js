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
	F5.Flow.getNodeFromPath = function (path) {
		function getChildRecursive(node, components) {
			if (components.length && components[0]) {
				var child = node.children[components[0]];
				F5.assert(child, 'Bad path');
				return getChildRecursive(child, components.slice(1));
			} else {
				return node;
			}
		}
		return getChildRecursive(this.root, path.split('-').slice(1));
	};	

	F5.Flow.isSubflowActive = function (node) {
		while (!node.activeSubflow && node.parent) {
			node = node.parent;
		}
		return node.activeSubflow;
	};

	// NOTE: only works for nodes with selection
	F5.Flow.getActiveLeafNode = function () {
		var node = this.root;
		while (node.selection) {
			node = node.selection;
		}
		if (node.activeSubflow) {
			node = node.activeSubflow;
		}
		return node;
	};		
}());
