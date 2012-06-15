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

var http = require('http');

exports.GET = function (query, cb) {
	
	var path = '/f5/generate?' +
				'pkg=f5.ide' + 
				'&debug=true' +
				'&platform=ios' + 
				'&native=false' + 
				'&inline=false' + 
				'&compress=false' +
				'&mobile=false';
				
	if (query.app) {
		path += '&app=' + query.app;
	}

	http.get({host: 'localhost', port: 8008, path: path}, function(res) {
		res.setEncoding('utf8');

		var html = '';

		res.on('data', function(chunk){
			html += chunk;
		});

		res.on('end', function(){
			cb(null, html, {'Content-Type': 'text/html'});
		});	
	});	
};