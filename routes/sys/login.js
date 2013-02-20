/**
	
	login
	
	登陆
*/

var User = require("../../lib/User");
var UserModel = require("../../lib/UserModel");
var WebStatus = require("../../lib/WebStatus");
var API = require("../../lib/api");

module.exports = {

	
		get:function( req, res ){
			//var user = req.session ? req.session.user : null;
			var status = new WebStatus().toJSON();
			//status.user = user;
			res.render('sys/login', status );
		},
		// 登录
		post:function(req, res ){

			var expEmail = /./;
			var email = req.body.email;
			var pwd = req.body.pwd;

			var status = new WebStatus();

			if( !expEmail.test( email ) ){

				status.setCode( "-3" );
				status.setMsg( "email 格式错误" );

				res.render('sys/login', status.toJSON() );
				return ;
			};

			//console.log("login form", email, pwd);
			API.loginUser(email, pwd, function( status, userjson ){

			//console.log( "login", user );
				if(status.code == 0){
					//req.session.user = user;
					var user = User.factory( userjson );
					res.setHeader("Set-Cookie", ["sid="+user.toCookie()+";path=/;expires="+new Date("2030") ]);
					res.redirect("/");
					// 登陆成功
				}else{
					res.render("sys/login", status.toJSON() );
					//失败
				}

			});
		}
};