
/**
	number:3
		匿名用户绑定email
		只有匿名用户有权限调用这个接口
	
	url: "/sys/bindmail"
	method: post
	param:
		mail: string //合法的email地址
		pwd: string > 5
	return :{
		code:0, //(0, -1, 403),
		msg:"" //(正确, 参数错误, 超出访问权限(已经绑定过了)),
		result:null
	}

*/
var path = require("path");
var fs = require("fs");//compile
var ejs = require("ejs");//compile
var Cookie = require("../../lib/Cookie");
var Promise = require("../../lib/Promise");
var WebStatus = require("../../lib/WebStatus");
var tools = require("../../lib/tools");
var User = require("../../lib/User");
var UserModel = require("../../lib/UserModel");
var SystemMail = require("../../lib/SystemMail");
var mail_tmpl_fn = ejs.compile( fs.readFileSync(path.resolve("views/tmpl/mail")+"/reg.html", {encoding:"utf-8"}) );

module.exports = function( req, res ){

	var user = req.session.user;
	var status = new WebStatus();
	var promise = new Promise();
	var mail = tools.trim(req.body.mail);
	var pwd = tools.trim(req.body.pwd);

	//登录判断
	if(!user){

		status.setCode("-3");
		res.write( status.toString() );
		res.end();
		return ;
	}

	if( pwd.length == 0 ){

		res.write( new WebStatus("-1").setMsg("pwd is undefined").toString() );
		res.end();

		return ;
	}

	if( !User.checkMail( mail ) ){

		res.write( new WebStatus("-1").toString() );
		res.end();
		return ;

	}

	if( User.checkMail( user.mail ) ){

		status.setCode("403");
		status.setMsg("已经绑定过e-mail"+ user.mail);
		res.write(status.toString());
		res.end();
		return ;
	}


	promise.then(function(){
		//email是否被注册
		UserModel.emailFind( mail, function( status ){

			if(status.code == "404"){

				promise.ok();


			}else{
				// email 已经被使用了。
				status.setCode("-2");
				status.setMsg("email已经被使用");
				res.write( status.toString() );
				res.end();
			}

		} );


	});

	promise.then(function(){

		//修改当前用户的  email 和 密码
		UserModel.updateMailPwd( user._id , mail, pwd, function( status ){

			if(status.code == "0"){

				promise.ok();				

			}else{

				res.write( status.toString() );
				res.end();

			}

		});

	});
	//重新设置 cookie
	promise.then(function(){

		UserModel.find_id( user._id, function( status ){
			//console.log( status );
			var user = status.result;
			var cookie = new Cookie("sid", user.toCookie());
			res.setHeader("Set-Cookie", [cookie.toString()]);
			res.write( new WebStatus().toString() );
			res.end();

			promise.ok( user );
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
