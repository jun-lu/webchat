/**
	number:13
		获取前 number 条用户非已读信息
		
	url:"/sys/notice_list"
	method:"get",
	param:{
		[time]:new Date().getTime()+1 //未来时间戳获取最新的 number -- 默认未来时间戳
		[number]:5 //   --默认 5
	}
	return :{
		code:0,
		msg:"",
		result:[Notice, Noitce, ...]
	}
*/

var WebStatus = require("../../lib/WebStatus");
var Promise = require("../../lib/Promise");
var NoticeModel = require("../../lib/NoticeModel");


module.exports = function( req, res ){

	var user = req.session.user || null;
	var time = Number(req.query.time) || Date.now()/1000;
	var number = Number(req.query.number) || 5;

	var output = {};

	if( !user ){

		res.write( new WebStatus("-3").toString() );
		res.end();
		return ;
	}

	var promise = new Promise();

	promise.add(function(){
		NoticeModel.countStatus( String(user._id), [0,1], function( status ){

			output.count = status.result;
			promise.ok();
		});
	});

	promise.add(function(){
		NoticeModel.findUnread( String(user._id), time, number, function( status ){

			output.list = status.result;
			promise.ok();
			//标示为已经知晓状态
			if( status.code == "0" && status.result && status.result.length > 0 ){
				var ids = [];
				for(var i=0; i< status.result.length ; i++){
					ids.push( status.result[i]._id.toString() );
				};
				//console.log("ids", ids );
				NoticeModel.updateMoreStatus( ids, 1);
			}

		});
	});

	promise.then(function(){
		var status = new WebStatus();
		status.setResult( output );
		res.write( status.toString() );
		res.end();
	});

	promise.start();
}