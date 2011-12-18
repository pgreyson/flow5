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

var WEBROOT = process.cwd() + '/www';

// nodelibs
var http = require('http'),
	fs = require('fs'),
	cli = require('cli'),
	path = require('path'),
	paperboy = require('paperboy'),
	exec = require('child_process').exec,	 
	spawn = require('child_process').spawn,	
	url = require('url'),
	sys = require('sys');
	
// flow5 libs
var generator = require('./generator.js');	

cli.setUsage("node devserv.js [OPTIONS]");

cli.parse({
	port: ['p', 'port', 'number'],
});

function compress(html, res) {
		
	var options = ['-jar', process.cwd() + '/devserv/htmlcompressor-1.5.2.jar', '--compress-css', '--compress-js'];
	var child = spawn('java', options);
	
	child.stdout.on('data', function (data) {
//		console.log(data.toString());
		res.write(data);
	});
	child.on('exit', function (code) {
		res.end();
	});		
	child.stderr.on('data', function (data) {
		sys.puts(data);
	});	

	res.writeHead(200, {'Content-Type': 'text/html'});
	
	child.stdin.write(html);
	child.stdin.end();		
}


function dot2svg(req, res) {	
	/*global Iuppiter*/
//	require('3p/Iuppiter.js');	
		
	var child = spawn('dot', ['-Tsvg']);		

//	req.buffer = '';
	
	req.on('data', function (chunk) {
//		req.buffer += chunk;
		child.stdin.write(chunk);
	});	
	req.on('end', function () {
//		child.stdin.write(Iuppiter.decompress(Iuppiter.Base64.decode(Iuppiter.toByteArray(req.buffer))));
		child.stdin.end();
	});
	
	child.stdout.on('data', function (data) {
		res.write(data);
	});		
	child.on('exit', function (code) {
		res.end();
	});		
	child.stderr.on('data', function (data) {
		sys.puts(data);
	});	
	
	res.writeHead(200, {'Content-Type': 'image/svg+xml', 'sequence-number': req.headers['sequence-number']});		
}

function showRequest(req, printHeaders) {
	sys.puts('------------------------------------');
	sys.puts(req.url);
	if (printHeaders) {
		var name;
		for (name in req.headers) {
			if (req.headers.hasOwnProperty(name)) {
				sys.puts(name + ' : ' + req.headers[name]);				
			}
		}			
	}
}

// http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
cli.main(function (args, options) {

	options.port = options.port || 8008;

	http.createServer(function (req, res) {
//		showRequest(req, true);
		
		// prevent directory climbing through passed parameters
		var parsed = url.parse(req.url.replace('..', ''), true);
		
		var app = parsed.query.app;
		
		var name, service;
				
		switch (req.method) {
		case 'POST':
			if (req.url.indexOf('dot2svg') !== -1) {
				dot2svg(req, res);	
			} else if (req.url.indexOf('service?') !== -1) {
				try {
					// prevent directory climbing
					service = require('../services/' + app + '/' + parsed.query.name + '.js');
					
					req.buffer = '';
					req.on('data', function (chunk) {
						req.buffer += chunk;
					});	
					req.on('end', function () {
						try {
							service.exec(parsed.query, req.buffer, function (results) {
								res.writeHead(200, {'Content-Type': 'application/json'});						
								res.write(results);						
								res.end();
							});							
						} catch (e2) {
							console.log(e2);
							res.writeHead(500);
							res.end();											
						}
					});										
				} catch (e1) {
					console.log(e1);
					res.end();				
				}
			} else {
				res.writeHead(404);
				res.end();				
			}
			break;		
		case 'GET':
			var isDebug = (parsed.query.debug === 'true');
			var isNative = (parsed.query['native'] === 'true');
			var doInline = (parsed.query['inline'] === 'true');
			
			var agent = req.headers['user-agent'];
			var isMobile = agent.match(/iPhone/) || agent.match(/iPad/) || agent.match(/Android/);
			
			if (req.url.indexOf('generate?') !== -1) {
				try {
					var html = generator.generateHtml(app, isDebug, doInline, isMobile, isNative);
					if (isDebug && !isMobile) {
						res.writeHead(200, {'Content-Type': 'text/html'});
						res.write(html);
						res.end();					
					} else {
						compress(html, res);					
					}					
				} catch (e2) {
					console.log(e2);
					res.end();					
				}
			} else if (req.url.match('cache.manifest')) {
//				res.writeHead(404);
				res.writeHead(200, {'Content-Type': 'text/cache-manifest'});
				try {
					res.write(generator.generateCacheManifest(app, isDebug, isMobile, isNative));					
				} catch (e) {
					console.log(e);
				}
				res.end();				
			} else if (req.url.indexOf('service?') !== -1) {
				try {
					// prevent directory climbing
					service = require(process.cwd() + '/www/services/' + app + '/' + parsed.query.name + '.js');

					service.exec(parsed.query, function (results) {
						res.writeHead(200, {'Content-Type': 'application/json'});						
						res.write(results);						
						res.end();
					});
				} catch (e3) {
					console.log(e3);
					res.writeHead(500);					
					res.end();
				}
			} else {
				paperboy
					.deliver(WEBROOT, req, res)
					.error(function () {
						sys.puts('Error delivering: ' + req.url);
					})
					.otherwise(function () {
						res.writeHead(404, {'Content-Type': 'text/plain'});
						res.end();
					});				
			}
			break;
		case 'OPTIONS':
			// allow everything
			var responseHeaders = {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': req.headers['access-control-request-method'],
				'Access-Control-Allow-Headers': req.headers['access-control-request-headers']
			};
			console.log(responseHeaders);
			
			res.writeHead(200, 'OK', responseHeaders);
			res.end();
			break;
		default:
			res.writeHead(405);
			res.end();
			break;
		}
	}).listen(options.port);
	
	console.log('HTTP server listening on port ' + options.port);
});