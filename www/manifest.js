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

exports.all = {
	scripts: [
	//	'f5.js', always added by generator.js
		'utils.js',
		'domutils.js',
		'animation.js',
		'views.js',
		'flow.js',
		'flowcontroller.js',
		'3p/Iuppiter.js',
		'3p/bezier.js',
		'templates.js',
		'viewcontroller.js',
		'services.js',
		'ui.js',
		'location.js',
		'widgets/button.js',
		'widgets/statictext.js',
		'widgets/picture.js',
		'widgets/tabset.js',
		'widgets/navcontroller.js',
		'widgets/streetview.js',
		'widgets/distance.js',
		'widgets/menu.js',
		'widgets/tracker.js',
		'widgets/loader.js',
		'widgets/scroller.js'
	], 
	elements: [
		'core.css',
		'default.css'
	],
	debug: {
		scripts: [
		//	'debug/timers.js'
			'debug/flow_diags.js',
			'debug/flowcontroller_diags.js',
			'debug/json.js'
		]
	},
	desktop: {
		debug: {
			scripts: [
				'debug/webharness.js'
			],
			elements: [
				'debug.css',
				'debug/json.css',
				'debug/webharness.css',
				'debug/webharness.html'
			]
		}		
	}
};

exports.android = {
	scripts: [
		'android.js',	
		'widgets/navbar_web.js',
		'widgets/mapview_web.js'
	],
	elements: [
		'android.css'
	],
	app: {
		scripts: [
			'3p/phonegap-1.3.0.js'
		]
	},
	browser: {
		scripts: [
			'nobridge.js',
		]
	}
};

exports.ios = {
	elements: [
		'ios.css'
	],
	app: {
		scripts: [
			'bridge.js',
			'widgets/navbar_native.js',
			'widgets/mapview_native.js',
			'udp.js',
			'3p/phonegap-1.1.0.js'	
		]
	},
	browser: {
		scripts: [
			'nobridge.js',
			'widgets/navbar_web.js',
			'widgets/mapview_web.js'		
		]
	}
};