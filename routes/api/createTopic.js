/**
	
	home
	
	首页
*/
var ChatModel = require("../../lib/ChatModel");
var LogModel = require("../../lib/LogModel");
var RoomModel = require("../../lib/RoomModel");
var Promise = require("../../lib/Promise");
var tools = require("../../lib/tools");

module.exports = function(req, res){

	var user = req.session.user;
	var topic = String(req.body.topic);
	var des = String(req.body.des);
	var pwd = String(req.body.pwd);
	var promise;
	var output = {
		user:user ? user.getInfo() : null
	};
	//console.log("topic", topic, des, pwd);

	if(user == null){
		res.write( new WebStatus("301").toString() );
		res.end();
		return false;
	}

	if(!topic || topic.length == 0 || topic.length > 140 || des.length > 300 || pwd.length > 16){

		res.write( new WebStatus("-1").toString() );
		res.end();
		return false;
	}

	


	promise = new Promise();

	promise.then(function(){

		topic = tools.removeHtmlTag( topic );
		des = tools.removeHtmlTag( des );
		//console.log("topic", topic, des, pwd);

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