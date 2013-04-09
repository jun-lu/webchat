/**
	
	login
	
	登陆
*/
var config = require("../../config");
var User = require("../../lib/User");
var WebStatus = require("../../lib/WebStatus");
var UserModel = require("../../lib/UserModel");

module.exports = {

	
		get:function( req, res ){
			var user = req.session.user || null;
			var referer = req.query.referer || "/";
			res.setHeader("Set-Cookie", ["sid=0|0|0;path=/;domain=vchat.co;expires="+new Date("2000")]);
			//status.user = user ? user.getInfo(): user;
			res.render('sys/login', new WebStatus().toJSON( {
				referer:referer,
				user:user?user.getInfo():user
			} ) );
		},
		// 登录
		post:function(req, res ){

			var user = req.session.user || null;
			var expEmail = /./;
			var email = req.body.email;
			var pwd = req.body.pwd;
			var referer = req.body.referer;

			var status = new WebStatus();
				status.user = user ? user.getInfo() : user;

            //console.log("start", status );
			if( !User.checkMail( email ) ){

				status.setCode( "-3" );
				status.setMsg( "email 格式错误" );

				res.render('sys/login', status.toJSON({
					referer:referer,
					user:user?user.getInfo() : user	
				}));
				return ;
			};

			// 查询数据库
			UserModel.emailPwdFind( email, pwd, function( status ){

				status.user = user;
               // console.log( status );
				if( status.code == "0" ){
					var newUser = status.result;
					res.setHeader("Set-Cookie", ["sid="+newUser.toCookie()+";path=/;domain="+config.domain+";expires="+new Date("2030") ]);
					res.redirect( referer );

				}else{

					status.setMsg("用户名密码错误");
					res.render("sys/login", status.toJSON( {
						referer:referer,
						user:user?user.getInfo() : user	
					}));
				}

			});
			
		}
};