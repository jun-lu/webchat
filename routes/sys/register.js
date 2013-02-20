/**
	
	login
	
	登陆
*/

var crypto = require("crypto");
var User = require("../../lib/User");
var WebStatus = require("../../lib/WebStatus");
var API = require("../../lib/api");

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

			md5 = crypto.createHash('md5');
			md5.update( pwd );
			pwd = md5.digest( 'hex' ) 


			status.setResult({

				email:email,
				pwd:pwd,
				name:name
			});
		
			//检查email是否被注册
			//return ;
			API.checkEmail(email, function( status ){
				//可以注册
				if(status.code == 0){

					var user = new User(email, pwd);
					user.setName( name );
					//创建新用户
					API.createUser( user, function( status, userjson ){

						if(status.code == 0){
							//res.session.user = user;
							var user = User.factory( userjson );
							res.setHeader("Set-Cookie", ["sid="+user.toCookie()+";path=/;expires="+new Date("2030") ]);
							res.render("sys/wellcome", user);
						}else{
							res.render('sys/reg', status.toJSON() );
						}

					});

				}else{
					//应该考虑处理系统错误
					res.render('sys/reg', status.toJSON() );

				}

			});	
		}
};