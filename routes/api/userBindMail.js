
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
var WebStatus = require("../../lib/WebStatus");
var User = require("../../lib/User");
var UserModel = require("../../lib/UserModel");


module.exports = function( req, res ){

	var user = req.session.user;
	var status = new WebStatus();

	var mail = req.body.mail;
	var pwd = req.body.pwd;

	//登录判断
	if(!user){

		status.setCode("-3");
		res.write( status.toString() );
		res.end();
		return ;
	}

	if( !User.checkMail( mail ) ){

		res.write( new WebStatus("-1").toString() );
		res.end();
		return ;

	}

	//匿名注册用户的mail全是数字
	//还需要检查用户名是否重复
	if(/^\d+$/.test( user.mail )){

		//首先检查 email是否被注册
		UserModel.emailFind( mail, function( status ){

			if(status.code == "404"){

				//修改当前用户的  email 和 密码
				UserModel.updateMailPwd( user._id , mail, pwd, function( status ){

					if(status.code == "0"){

						UserModel.find_id( user._id, function( status ){
							//console.log( status );
							var user = status.result;
							res.setHeader("Set-Cookie", ["sid="+user.toCookie()+";path=/;expires="+new Date("2030") ]);
							res.write( new WebStatus().toString() );
							res.end();
						});

					}else{

						res.write( status.toString() );
						res.end();

					}

				});


			}else{
				// email 已经被使用了。
				status.setCode("-2");
				status.setMsg("email已经被使用");
				res.write( status.toString() );
				res.end();
			}

		} );

	}else{
		//非匿名用户无法绑定
		status.setCode("403");
		res.write(status.toString());
		res.end();

	}

}
