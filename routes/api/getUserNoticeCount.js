/**
	number:12
		获取当前登录用户未读信息条数
		
	url:"/sys/notice_count"
	method:"get"
	param:null,
	return :{
		code:0,(0, 301),
		msg:""//(可用, 未登录)
		result: 3//(未读信息条数)
	}
*/
var WebStatus = require("../../lib/WebStatus");
var NoticeModel = require("../../lib/NoticeModel");


module.exports = function( req, res ){
	var user = req.session.user || null;
	var status = Number(req.query.status) || 0;

	if( !user ){

		res.write( new WebStatus("-3").toString() );
		res.end();
		return ;
	}

	NoticeModel.countStatus( String(user._id), [0], function( status ){

		res.write( status.toString() );
		res.end();

	});

}