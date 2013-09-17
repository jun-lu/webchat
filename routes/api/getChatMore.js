
/**
	number:19
	action: 根据时间获取房间对话
	logic：小于 time 的最近 size 条信息,可以使用未来时间戳获取最新的10条
	
	
	url: "/sys/getmore"
	method:get
	param:
		roomid:"1361182575505" //房间id
		time:"时间戳"/1000 
		[size]:10 //默认10条
	return:{
		code:0,
		msg:"正确执行",
		result:[Chat,Chat,Chat,.......]
	}
	
*/


var ChatModel = require("../../lib/ChatModel");


module.exports = function(req, res){

	// 
	var roomid = req.query.roomid;
	var time = parseInt(req.query.time, 10);
	var limit = req.query.limit || 10;
	//var chatModel = new ChatModel();

	ChatModel.findMoreChats(roomid, time, function( status ){

		if(status.code == 0){

			status.result.reverse();
		}

		res.write( status.toString(), "utf-8" );
		res.end();


	});
}