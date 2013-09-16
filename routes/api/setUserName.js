/**
	number:2
	修改自己的昵称
	
	url: "/sys/set_user_name"
	method: post
	param:
		name: string < 50
	return :{
		code:0, //(0, -1),
		msg:"" //(正确,参数错误),
		result:null
	}
*/

var WebStatus = require("../../lib/WebStatus");
var UserModel = require("../../lib/UserModel");
var tools = require("../../lib/tools");

module.exports = function(req, res){
	var user = req.session.user || null;
	var name = req.body.name;
	var status = new WebStatus();
	
	res.setHeader("Content-Type" ,"application/json; charset=utf-8");

	if(user == null){
		res.write( new WebStatus("-3").toString() );
		res.end();
		return ;
	}

	if( name && user){
		//如果用户原来的昵称是空（刚进入的匿名用户）
		//把头像修改成默认的小怪兽，以区别为写名字的用户
		if( !user || !user.name ){
			UserModel.updateGravatarDefault( user._id, "monsterid", function(){});
		}
		
		name = tools.removeHtmlTag( name );
		UserModel.updateName( user._id, name, function( status ){

			// 通知其他用户某用户名字修改
			

			res.write( status.toString() , "utf-8");
			res.end();
			
		});


	}else{

		status.setCode("-1");
		res.write( status.toString(), "utf-8" );
		res.end();
	}

}