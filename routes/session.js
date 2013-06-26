/**
	
	system

	处理 session
*/

var UserModel = require("../lib/UserModel");

var cookie = require("express/node_modules/cookie");

module.exports = {

	// 实现 session
	httpSession:function(req, res, next){

		req.session = {
			getInfo:function(){
				return null;
			}
		};
		//console.log( "UserModel", UserModel );
		if( req.cookies && req.cookies.sid ){

			var a = req.cookies.sid.split("|");

			var hexMail = a[0];
			var hexPwd = a[1];
			var hexRandom = a[2];
			

			UserModel.hexFind(hexMail, hexPwd, hexRandom, function( status ){

				//console.log("hexFind", status );
				if(status.code == "0"){
					//req.cookiesSelecter = cookiesSelecter;
					req.session.user = status.result;
					
				}
				next();
			});
			
		}else{
			
			next();

		}  
	  
	},

	// socket session 处理
	socketSession:function (data, accept) {

	    if (data.headers.cookie) {

	        data.cookies = cookie.parse(data.headers.cookie);

	        if(data.cookies && data.cookies.sid){

				var a = data.cookies.sid.split("|");
				var hexMail = a[0];
				var hexPwd = a[1];
				var hexRandom = a[2];


				UserModel.hexFind(hexMail, hexPwd, hexRandom, function( status ){

					if(status.code == "0"){
						data.sessionUser = status.result.getInfo();
					}
					// accept the incoming connection
					accept(null, true);
				}); 

	        }else{
	        	// accept the incoming connection
	        	accept(null, true);
	        }
	    } else {
	       // if there isn't, turn down the connection with a message
	       // and leave the function.
	       return accept('No cookie transmitted.', false);
	    }
	    
	    

	},
}