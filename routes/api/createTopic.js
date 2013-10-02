/**
	
	home
	
	首页
*/
var ChatModel = require("../../lib/ChatModel");
var LogModel = require("../../lib/LogModel");
var RoomModel = require("../../lib/RoomModel");
var tool = require("../../lib/tools");

module.exports = function(req, res){

	var user = req.session.user;//测试时候使用管理员
	var topic = String(req.body.topic);
	var des = String(req.body.des);
	var pwd = String(req.body.pwd);
	

	if(user == null){
		res.write( new WebStatus("301").toString() );
		res.end();
		return ;
	}


	var output = {
		user:user ? user.getInfo() : null
	};


	var promise = new Promise();

	promise.then(function(){

		topic = tools.removeHtmlTag( topic );
		des = tools.removeHtmlTag( des );
		RoomModel.create( topic, des, String(output.user._id) , output.user.name, function( status ){
			
			res.write( status.toString() );
			res.end();

			promise.ok( status );
			
			
		});

	});

	promise.then(function( status ){

		if( status.code == "0" ){

			var room = status.result;
			ChatModel.create( room.id, "Your first message!", "*", output.user._id, null);
			LogModel.create( String(output.user._id), "create_room", room.getInfo(), function(){} );
		}

	});

	promise.start();
}