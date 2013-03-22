/**
	
	login
	
	登陆
*/
var User = require("../../lib/User");
var WebStatus = require("../../lib/WebStatus");
var UserModel = require("../../lib/UserModel");

module.exports = {

	
		get:function( req, res ){
			var user = req.session.user || null;
			var status = new WebStatus().toJSON();

			status.user = user;
			res.render('sys/login', status );
		},
		// 登录
		post:function(req, res ){

			var user = req.session.user || null;
			var expEmail = /./;
			var email = req.body.email;
			var pwd = req.body.pwd;

			var status = new WebStatus();
				status.user = user;

            //console.log("start", status );
			if( !User.checkMail( email ) ){

				status.setCode( "-3" );
				status.setMsg( "email 格式错误" );

				res.render('sys/login', status.toJSON() );
				return ;
			};

			// 查询数据库
			UserModel.emailPwdFind( email, pwd, function( status ){

				status.user = user;
                console.log( status );
				if( status.code == "0" ){
					var newUser = status.result;
					res.setHeader("Set-Cookie", ["sid="+newUser.toCookie()+";path=/;expires="+new Date("2030") ]);
					res.redirect("/");

				}else{

					res.render("sys/login", status.toJSON( {"user":user} ) );
				}

			});
			
		}
};