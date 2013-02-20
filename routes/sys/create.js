/**
	
	login
	
	登陆
*/
var Log = require("../../lib/Log");
var Room = require("../../lib/Room");
var LogModel = require("../../lib/LogModel");
var WebStatus = require("../../lib/WebStatus");
var API = require("../../lib/api");

module.exports = {

	get:null,
	post:function(req, res){
	
		//创建房间的人的ID
		//console.log("create", req.body.topic, req.body.des);
		var masterid = req.session.user._id;//测试时候使用管理员
		if(req.body.topic){

			API.createRoom( req.body.topic, req.body.des, masterid , function(status, roomjson){
				
				var room = Room.factory( roomjson );
				var logmodel = new LogModel();

				logmodel.insert( new Log( masterid, "create_room",  room.getInfo() ).toJSON() );


				if(status.code == 0){
					res.redirect('/'+room.id);
				}else{
					res.redirect('/');
				}

			});
			
		}else{
			res.redirect('/');
		}
	}
	
};