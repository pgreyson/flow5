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

define('flow', exports, function (exports) {
		
	function Flow() {

		var that = this;
				
		// TODO: better error checking. in diags??
		that.injectGraph = function (graphSpec) {
																
			// returns the spec if object or finds a matching template
			function resolveSpec(node, spec) {
				function resolveSpecUp(node, name) {
					if (node.spec.templates && node.spec.templates[name]) {
						return node.spec.templates[name];
					} else if (node.parent) {
						return resolveSpecUp(node.parent, name);
					} else {
						F5.assert(false, 'Could not find template: ' + name);
					}
				}
				
				if (typeof spec === 'object') {
					return spec;
				} else {
					return resolveSpecUp(node, spec);
				}
			}
			
			function findNodeUp(node, name) {
				if (node.children && node.children[name]) {
					return node.children[name];
				} else if (node.parent) {
					return findNodeUp(node.parent, name);
				} else {
					F5.assert(false, 'Could not find name: ' + name);
				}
			}
									
			function injectNodeRecursive(id, nodeSpec, parent) {										
				var node = {id: id, 
							type: nodeSpec.type ? nodeSpec.type : 'flow', 
							parent: parent,
							spec: nodeSpec, 
							active: false};
								
				if (nodeSpec.children) {
					node.children = {};
					F5.assert(nodeSpec.activeChild, 'Parent node must declare active child: ' + id);
					nodeSpec.children.forEach(function (id, childSpec) {
						var child = injectNodeRecursive(id, resolveSpec(node, childSpec), node);
						if (id === nodeSpec.activeChild) {
							node.activeChild = child;
							child.active = true;
						}
					});					
				}			
				
				if (nodeSpec.subflows) {
					node.subflows = {};					
					nodeSpec.subflows.forEach(function (id, subflow) {
						subflow.node = node;
						node.subflows[id] = subflow;
					});					
				}
												
				if (node.parent) {
					parent.children[id] = node;
				}
								
				return node;
			}	
						
			function resolveTransitionsRecursive(node) {								
				
				if (node.spec.transitions) {
					F5.assert(node.type === 'flow', 'A node with transitions must be of type flow');
					node.transitions = {};
					node.spec.transitions.forEach(function (id) {
						node.transitions[id] = findNodeUp(node, id);
						// break cycles
						if (!node.transitions[id].transitions) {
							resolveTransitionsRecursive(node.transitions[id]);							
						}
					});
				}
								
				// recurse
				if (node.children) {
					node.children.forEach(function (id, child) {
						resolveTransitionsRecursive(child);
					});
				}				
			}
												
			// inject nodes
			that.root = injectNodeRecursive('root', graphSpec);
			
			// resolve transitions
			resolveTransitionsRecursive(that.root);								
						
			// remove the cached specs
			function removeSpecsRecursive(obj) {
				delete obj.spec;
				// break cycles
				obj._mark = true;
				obj.forEach(function (id, child) {
					if (child && typeof child === 'object' && !child._mark) {
						removeSpecsRecursive(child);
					}
				});
				delete obj._mark;
			}
			removeSpecsRecursive(that.root);
			
			function addPathsRecursive(node) {
				function getPath(node) {
					var path = [];
					while (node) {
						path.push(node.id);
						node = node.parent;
					}
					return path.reverse().join('-');
				}			
				
				node.path = getPath(node);
				if (node.children) {
					node.children.forEach(function (id, child) {
						addPathsRecursive(child);
					});
				}	
				
				function addSubflowPathsRecursive(subflow, path) {
					if (subflow && subflow.choices) {
						subflow.path = path + '_' + subflow.method;
						subflow.active = false;
						subflow.type = 'subflow';
						subflow.choices.forEach(function (id, child) {
							addSubflowPathsRecursive(child, subflow.path);
						});					
					}
				}
				if (node.subflows) {
					node.subflows.forEach(function (id, subflow) {
						addSubflowPathsRecursive(subflow, node.path);
					});
				}			
			}			
			addPathsRecursive(this.root);			

			that.root.active = true;						
		};				
	}
		
	exports.Flow = Flow;
});