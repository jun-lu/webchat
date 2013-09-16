/**
	number:8
		修改用户头像,头像必须为 gravatar 网站提供的
	url: "/sys/set_avatar",
	method:post,
	param:
		gravatarDefault : ("mm", "identicon", "monsterid", "wavatar", "retro", "blank") // 必须是这其中之一
	return:{
		code:0,(0, 403)
		msg:"",
		result:null
	}

*/

var UserModel = require("../../lib/UserModel");

module.exports = function( req, res ){

	var user = req.session.user;
	var status = new WebStatus();

	var gravatarDefault = req.body.gravatarDefault;


	//登录判断
	if(!user){

		status.setCode("-3");
		res.write( status.toString() );
		res.end();
		return ;
	}

	UserModel.updateGravatarDefault(user._id, gravatarDefault, function( status ){

		res.write( status.toString() );
		res.end();

	});
	
}