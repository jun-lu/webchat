/**
	
	login
	
	登录
*/
var path = require("path");
var fs = require("fs");//compile
var ejs = require("ejs");//compile
var Promise = require("../../lib/Promise");
var tools = require("../../lib/tools");
var User = require("../../lib/User");
var UserModel = require("../../lib/UserModel");
var WebStatus = require("../../lib/WebStatus");
var Cookie = require("../../lib/Cookie");
var SystemMail = require("../../lib/SystemMail");
var mail_tmpl_fn = ejs.compile( fs.readFileSync(path.resolve("views/tmpl/mail")+"/reg.html", {encoding:"utf-8"}) );


module.exports = {
	get:function(req, res){

		var user = req.session.user;
		var status = new WebStatus().toJSON();
		status.user = user ? user.getInfo() : user;

		res.render('sys/reg',  status );

	},
	post:function(req, res){

		var user = req.session ? req.session.user : null;
		var email = tools.trim(req.body.email);
		var name = tools.trim(req.body.name);
		var pwd = tools.trim(req.body.pwd);
		var output = {
			user:user,
		};
		var promise = new Promise();
		var status = new WebStatus();
			//status.user = user;

		if( !User.checkMail( email ) ){

			status.setCode( "-1" );
			status.setMsg( "Enter the correct email" );

			res.render('sys/reg', status.toJSON(output) );
			return ;
		}

		if( pwd.length < 6 ){
			status.setCode( "-1" );
			status.setMsg( "Password length at least 6" );
			res.render('sys/reg', status.toJSON(output) );
			return ;
		}



		promise.then(function(){

			UserModel.emailFind( email,  function( status ){

				if( status.code == "404" ){

					promise.ok();

				}else{
					status.setCode( "-2" );
					status.setMsg("E-mail has been used");
					status.user = user;
					
					res.render('sys/reg', status.toJSON(output) );

				}

			});


		});

		promise.then(function(){

			UserModel.create( email, pwd, name, function( status ){

				if(status.code == "0"){
					var user = status.result;
					var cookie = new Cookie("sid", user.toCookie());
					res.setHeader("Set-Cookie", [cookie.toString()]);
					res.redirect("user/home");

					promise.ok( user );
				}else{
					status.user = user;
					res.render('sys/reg', status.toJSON(output) );	
				}

			});

		});

		//发送e-mail
		promise.then(function( user ){

			SystemMail.send(
				SystemMail.mail,
				user.mail,
				user.name+" 欢迎加入vchat.co",
				"欢迎加入vchat.co",
				mail_tmpl_fn( user ),
				function(){}
			);

		});


		promise.start();
	}
};