
/**
	number:14
		改变提醒的状态（理论上只允许标记为 2 已读）
		
	url:"/sys/notice_status"
	method:"post",
	param:{
		_id: ,//信息_id
		[status]:2,//默认2
	}
	return :{
		code:0,
		msg:"",
		result:null
	}
*/

var NoticeModel = require("../../lib/NoticeModel");
var WebStatus = require("../../lib/WebStatus");

module.exports = function( req, res ){

	var user = req.session.user || null;
	var status = Number(req.body.status);
	var _id = req.body._id;

	status = isNaN(status) ? 2 : status;


	if( !user ){

		res.write( new WebStatus("-3").toString() );
		res.end();
		return ;
	}

	if( String(_id).length != 24 || !(status == 1 || status == 2 || status == 0)){

		res.write( new WebStatus("-1").toString() );
		res.end();

		return ;
	}


	NoticeModel.updateStatus( String(_id), status, function( status ){

		res.write( status.toString() );
		res.end();

	});
}