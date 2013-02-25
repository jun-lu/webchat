/**
	
	login
	
	登陆
*/

var crypto = require("crypto");
var UserModel = require("../../lib/UserModel");
var WebStatus = require("../../lib/WebStatus");

module.exports = {
	get:function(req, res){

		res.render('sys/reg',  new WebStatus().toJSON() );

	},
	post:function(req, res){

		var md5 = null;
		var expEmail = /./;
		var email = req.body.email;
		var name = req.body.name;
		var pwd = req.body.pwd;
		var pwd2 = req.body.pwd2;

		var status = new WebStatus();

		if( !expEmail.test( email ) ){

			status.setCode( "-3" );
			status.setMsg( "email 格式错误" );

			res.render('sys/reg', status.toJSON() );
			return ;
		}

		if( pwd != pwd2 ){

			status.setCode( "-4" );
			status.setMsg( "两次密码不配" );

			res.render('sys/reg', status.toJSON() );
			return ;
		}

		UserModel.emailFind( email,  function( status ){

			if( status.code == "404" ){

				UserModel.create( email, pwd, name, function( status ){

					if(status.code == "0"){
						var user = status.result;
						res.setHeader("Set-Cookie", ["sid="+user.toCookie()+";path=/;expires="+new Date("2030") ]);
						res.render("sys/wellcome", user);
					}else{
						res.render('sys/reg', status.toJSON() );	
					}

				});

			}else{
				status.setCode( "-5" );
				status.setMsg("email已经被使用");
				res.render('sys/reg', status.toJSON() );

			}

		});
	}
};