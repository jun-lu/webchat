
/**
	number:7
		检测 mail 是否已经注册
	
	url:"/sys/checkmail",
	method:get
	param:
		mail: //一个正确的email
	return:{
		code:"0" //0, -2
		msg:"正确"//未注册，已经注册
		result:null
	}
	
*/

var User = require("../../lib/User");
var WebStatus = require('../../lib/WebStatus');
var UserModel = require('../../lib/UserModel');

module.exports = function( req, res ){

	var mail  = req.query.mail;

	if( !User.checkMail( mail ) ){

		res.write( new WebStatus("-1").toString() );
		res.end();
		return ;

	}

	UserModel.emailFind( mail, function( status ){

		if(status.code == "404"){

			res.write( new WebStatus().toString() );
			res.end();
		}else{

			res.write( new WebStatus("-2").toString() );
			res.end();
		}

	} );

}