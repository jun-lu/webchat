
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
var RoomModel = require("../../lib/RoomModel");
var Room_PUBLIC_KEYS = require("../../lib/Room").PUBLIC_KEYS;

module.exports = function( req, res ){

	var key = String(req.query.key);
	var status = new WebStatus();
	var reg = null;
	if( key.length == 0 ){
		res.write( new WebStatus("-1").setMsg("key is not defined") );
		res.end();
		return false;
	}

	reg = new RegExp( key, "gi");
	console.log( reg );
	RoomModel.opendb(function( collection, db ){
		collection.find( {status:1, "$or":[{topic:reg},{des:reg}]}, Room_PUBLIC_KEYS).limit(10).toArray(function(err, result){

			
			var webstatus = null;

			if( err ){
				webstatus =new WebStatus("601");
			}else{
				webstatus = new WebStatus().setResult(result || []);
			}

			res.write( webstatus.toString() );
			res.end();
			
		});
	});

}