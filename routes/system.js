/**
	
	system

	处理 session
*/

var API = require("../lib/api");
var socketServer = require('../lib/socketServer');
var cookie = require("express/node_modules/cookie");

module.exports = {

	// 实现 session
	session:function(req, res, next){

		var cookieSelect = null;
		req.session = {};
		if( req.cookies && req.cookies.sid ){

			var a = req.cookies.sid.split("|");

			cookiesSelecter = {
				hexMail:a[0],
				hexPwd:a[1],
				hexRandom:a[2]
			};

			req.cookiesSelecter = cookiesSelecter;

			API.cookieLogin(cookiesSelecter, function( status ){
				req.session.user = status.result;
				next();
			});	

		}else{

			req.cookiesSelecter = null;
			next();

		}  
	  
	},

	// socket session 处理
	authorization:function (data, accept) {

	    if (data.headers.cookie) {
	        // if there is, parse the cookie
	        //这里获取sid, 请重新像更好的办法
	        //console.log( parseJSONCookie(data.headers.cookie) );
	        data.cookies = cookie.parse(data.headers.cookie);
	        // note that you will need to use the same key to grad the
	        // session id, as you specified in the Express setup.
	        if(data.cookies && data.cookies.sid){
	          var a = data.cookies.sid.split("|");

	          var cookiesSelecter = {
	            hexMail:a[0],
	            hexPwd:a[1],
	            hexRandom:a[2]
	          };

	          API.cookieLogin(cookiesSelecter, function( status ){
	          //console.log("socket cookiesSelecter",  status.code );
	            data.sessionUser = status.result.getInfo();
	          }); 

	          //data.sessionID = data.cookie;
	        }
	    } else {
	       // if there isn't, turn down the connection with a message
	       // and leave the function.
	       return accept('No cookie transmitted.', false);
	    }
	    // accept the incoming connection
	    accept(null, true);

	},
}