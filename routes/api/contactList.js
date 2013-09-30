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
var ContactModel = require("../../lib/ContactModel");
var tools = require("../../lib/tools");

module.exports = function(req, res){
	var user = req.session.user || null;
	var limit = Number(req.query.limit) || 30;
	var status = new WebStatus();
	
	res.setHeader("Content-Type" ,"application/json; charset=utf-8");

	if(user == null){
		res.write( new WebStatus("-3").toString() );
		res.end();
		return ;
	}


	ContactModel.fromFind( String(user._id), function( status ){
		res.write( status.toString() );
		//res.write( JSON.stringify(status, "", "  ") );//.toString()
		res.end();

	});

}