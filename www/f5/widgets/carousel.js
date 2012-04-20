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
/*global F5, HTMLDivElement*/

(function () {
	
	function Carousel() {
		
		this.construct = function (data) {		
			Carousel.prototype.construct.call(this);														
			F5.addClass(this.el, 'f5carousel');				
			this.horizontal = true;	
			
			var screen = document.getElementById('f5screen');
			var height = screen.offsetHeight;
			var width = screen.offsetWidth;
			var that = this;
			
			this.data = data;						
		};	
		
		function getChildren(carousel) {
			var children = [];
			F5.forEach(carousel.el.childNodes, function (el) {
				if (el.constructor === HTMLDivElement) {
					children.push(el);
				}
			});
			return children;
		}		
				
		this.refresh = function () {
			var that = this;
							
			// TODO: move to a FF-specific package
			// workaround for FF box behavior
			if (navigator.userAgent.match('Firefox')) {
				var data = this.data[this.el.getAttribute('f5id')];				
				if (data && data.width) {
					if (data.width.match('px')) {
						F5.forEach(getChildren(this), function (child) {
							child.style.width = data.width;
						});				
					} else if (data.width.match('%')) {
						var node = document.getElementById(data.node);
						F5.forEach(getChildren(this), function (child) {
							var widthValue = node.offsetWidth * data.width.replace('%', '')/100 + 'px';
							child.style.width = widthValue;
						});					
					}							
				}
				
				if (!this.detents) {
					window.addEventListener('resize', function () {
						that.refresh();
					});									
				}			
			}
						
			// calculate the widths of the child divs to set detents
			this.detents = [];
			var width = 0;
						
			F5.forEach(getChildren(this), function (child) {
				that.detents.push(-width);										
				width += child.offsetWidth;	
				F5.addClass(child, 'f5carouselitem');	
			});
			
			Carousel.prototype.refresh.call(this);																			
		};
		
		this.widgetWillBecomeActive = function () {
			if (!this.detents) {
				this.refresh();
				var that = this;
			}
		};
		
		this.getDetent = function () {
			// find the first detent that's been scrolled past
			var index;
			for (index = 0; index < this.detents.length; index += 1) {
				if (this.staticOffset >= this.detents[index]) {
					break;
				}
			}
			return index;									
		};
		
		this.scrollToDetent = function (i) {
			if (i >= 0 && i < this.detents.length) {
				this.scrollTo(this.detents[i]);				
			}
		};
		
		this.constrainDrag = function(offset, delta) {				
			return offset + delta;	
		};

		// snap to nearest detent
		this.snapTo = function () {
			var index = this.getDetent();
			
			var offset;
			// if scrolled all the way to the end, snap to the last div
			if (index === 0) {
				offset = this.detents[0];
			} else if (index === this.detents.length) {
				offset = this.detents[this.detents.length - 1];
			} else {
				// otherwise snap to whichever div is closest
				var midPoint = this.detents[index - 1] + (this.detents[index] - this.detents[index - 1])/2;
				if (this.staticOffset <= midPoint) {
					offset = this.detents[index];					
				} else {
					offset = this.detents[index - 1];										
				}
			}
			
			if (offset !== this.staticOffset) {
				return {offset: offset, duration: 0.25, bezier: this.curves.softSnap};				
			}
		};
		
		this.flickTo = function (velocity) {
			var index = this.getDetent();

			var offset;
			if (Math.abs(velocity) > this.flickVelocityThreshold) {
				if (velocity > 0 && index > 0) {
					offset = this.detents[index - 1];
				} else if (velocity < 0 && index < this.detents.length){
					offset = this.detents[index];
				}					
			}
			if (typeof offset !== 'undefined') {
				return {offset: offset, duration: 0.25, bezier: this.curves.softSnap};
			}					
		};		
	}
	Carousel.prototype = F5.Prototypes.Widgets.Scroller;
	
	F5.Prototypes.Widgets.Carousel = new Carousel();	
}());