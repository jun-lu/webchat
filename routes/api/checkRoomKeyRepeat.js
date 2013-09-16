/**
	number:9,
		检查房间快捷访问key是否被注册
		
	url: "/sys/check_room_key",
	method:get,
	param:
		key : string < 100 // 可以是任意字符
	return:{
		code:0,//(0, -2)
		msg:"",//(可用，已经被使用)
		result:null
	}
*/
var config = require('../../config');
var WebStatus = require('../../lib/WebStatus');
var RoomModel = require('../../lib/RoomModel');

module.exports = function( req, res ){
	
	var sysWord = config.sysWord;
	var status = new WebStatus();
	var key = req.query.key;
	if(key.length >0 && key.length < 100){

		if(sysWord.indexOf( key ) != -1){

			res.write( new WebStatus("-2").toString() );
			res.end();
			return ;
		}

		RoomModel.nameFind( key, function( status ){

			if(status.code == "404"){
				status.setCode("0");
			}else{
				status.setCode( status.code == "0" ? "-2" : status.code);
			}

			res.write( status.toString() );
			res.end();				

		});

		return ;
	}

	status.setCode("-1");
	res.write( status.toString() );
	res.end();
}