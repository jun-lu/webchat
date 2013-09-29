/**
	number:11
		修改用户的个人介绍
	url: "/sys/user_summary",
	method:post,
	param:
		summary: string < 300
	return:{
		code:0,//(0, -1)
		msg:"",//(可用，参数错误)
		result:null
	}
*/
var tools = require("../../lib/tools");
var WebStatus = require("../../lib/WebStatus");
var UserModel = require("../../lib/UserModel");


module.exports = function( req, res ){

	var user = req.session.user || null;
	var summary = req.body.summary;
	var status = new WebStatus();

	if( !user ){
		status.setCode("-3");
		res.write( status.toString(),"utf-8" );
		res.end();
		return ;
	}

	if( summary && summary.length < 300){

		summary = tools.removeHtmlTag( summary );
		UserModel.updateSummary(user._id, summary, function( status ){
			res.write( status.toString() );
			res.end();
			return ;
		});

	}else{
		status.setCode("-1");
		res.write( status.toString() );
		res.end();

	}
}