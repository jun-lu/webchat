
/*
	url: "/sys/history",
	method:get,
	param:
		roomid:123456789 //正确的房间id
		size :24, // number > 0  需求返回的数量
	return:{
		code:0,//(0, -1)
		msg:"",//(可用，参数错误)
		result:[
			user,user,....
		]
	}		

*/
var WebStatus = require("../../lib/WebStatus");
var LogModel = require("../../lib/LogModel");
var UserModel = require("../../lib/UserModel");

module.exports = function( req, res ){

	var roomid = req.query.roomid;
	var size = req.query.size || 20;
	//var pageNumber = req.query.pageNumber || 1;

	var status = new WebStatus();

	if( roomid && size > 0 ){
		
		LogModel.getHistory( roomid, size, function( status ){

			if(status.code == "0" && status.result.length){

				UserModel.getMultiple( status.result, function( status ){

					res.write( status.toString() );
					res.end();

				})		

			}else{
				res.write( status.toString() );
				res.end();
			}

		});
		return ;
	}

	status.setCode("-1");
	res.write( status.toString() );
	res.end();

}