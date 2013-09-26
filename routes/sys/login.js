/**
	
	login
	
	登录
*/
var config = require("../../config");
var User = require("../../lib/User");
var WebStatus = require("../../lib/WebStatus");
var UserModel = require("../../lib/UserModel");
var Cookie = require("../../lib/Cookie");

module.exports = {

	
		get:function( req, res ){
			var user = req.session.user;
			var referer = req.query.referer || "/";
			var output = {
				user:user,
				referer:referer,
				status:new WebStatus().toJSON()
			}
			res.render('sys/login', output);
		},
		// 登录
		post:function(req, res ){

			var user = req.session.user;
			//var expEmail = /./;
			var email = req.body.email;
			var pwd = req.body.pwd;
			var referer = req.body.referer || "/";
			var output = {
				referer:referer,
				user:user,
				mail:email,
				status:new WebStatus()
			};

			//var status = new WebStatus();
			//status.user = user ? user.getInfo() : user;

            //console.log("start", status );
			if( !User.checkMail( email ) ){

				output.status.setCode( "-3" );
				output.status.setMsg( "email 格式错误" );

				res.render('sys/login', output);

				return ;
			};

			// 查询数据库
			UserModel.emailPwdFind( email, pwd, function( status ){

				//status.user = user;
               	//console.log( "status", status );
				if( status.code == "0" ){
					var user = status.result;
					var cookie = new Cookie("sid", user.toCookie());
					cookie.setExpires(new Date("2030"));
					res.setHeader("Set-Cookie", [cookie.toString()]);
					res.redirect( referer );
					res.end();
				}else{

					status.setMsg("用户名密码错误");
					output.status = status;
					res.render("sys/login", output);
				}

			});
			
		}
};