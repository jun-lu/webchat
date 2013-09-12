/**

	在服务端发起一个http[s]请求。

	ServerRequest


*/


var WebStatus = require('./WebStatus');
var URL = require("url");
var http = require("http");
var https = require("https");
var tool = require("./tools");


module.exports = {

	get:function( url, data, callback ){

		var urlOptions = URL.parse( url );
		var protocol = urlOptions.protocol == "http:" ? http : https;
		data && (url += "?"+ tool.serialization( data ));

		protocol.get( url, function( res ){
			res.on("data", function( data ){
				callback && callback( new Buffer(data).toString() );
			});
		});		


	},
	post:function( url, data, callback, errorcallback ){

//		console.log("url", url);
		var urlOptions = URL.parse( url );

		/**
			{ protocol: 'http:',
			  slashes: true,
			  host: 'nodejs.org',
			  hostname: 'nodejs.org',
			  href: 'http://nodejs.org/api/url.html',
			  pathname: '/api/url.html',
			  path: '/api/url.html' 
			}
		*/

		/**
			
			var weibo_req_options = {

				hostname:"api.weibo.com",
				port: 443,
				path: '/oauth2/access_token',
				method: 'POST',
				headers:{
					"Content-Type":"application/x-www-form-urlencoded"
				}

			};
		
		*/
		var postString = tool.serialization( data );
		var requestOptions = {
			hostname:urlOptions.hostname,
			port:urlOptions.protocol == "http:" ? 80 : 443,
			path:urlOptions.path,
			method:"POST",
			headers:{
				"Content-Type":"application/x-www-form-urlencoded"
			}
		};

		var protocol = urlOptions.protocol == "http:" ? http : https;

		//console.log( requestOptions );

		var req = protocol.request(requestOptions, function(res) {

			//console.log("protocol");
		  	res.setEncoding('utf8');
		  	res.on('data', function (chunk) {
		    	callback( JSON.parse( chunk ) );
		  	});
		});

		req.on('error', function(e) {
		  	errorcallback && errorcallback(e);
		});

		req.setHeader("Content-Length", postString.length);
		req.write( postString );
		req.end();


	}
}