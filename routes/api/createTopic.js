/**
	
	home
	
	首页
*/
var Cookie = require("../../lib/Cookie");
var ChatModel = require("../../lib/ChatModel");
var LogModel = require("../../lib/LogModel");
var RoomModel = require("../../lib/RoomModel");
var UserModel = require("../../lib/UserModel");
var Promise = require("../../lib/Promise");
var tools = require("../../lib/tools");
var WebStatus = require("../../lib/WebStatus");

module.exports = function(req, res){

	var user = req.session.user;
	var topic = tools.removeHtmlTag( String(req.body.topic) );
	var des = tools.removeHtmlTag( String(req.body.des) );
	var pwd = tools.removeHtmlTag( String(req.body.pwd) ) || null;
	var promise;
	var output = {
		user:user ? user.getInfo() : null
	};
	//console.log("topic", topic, des, pwd);
	/**
	if(user == null){
		res.write( new WebStatus("-3").toString() );
		res.end();
		return false;
	}

	if(!topic || topic.length == 0 || topic.length > 140 || des.length > 300 || pwd.length > 16){

		res.write( new WebStatus("-1").toString() );
		res.end();
		return false;
	}
	*/
	


	promise = new Promise();

	promise.then(function(){

		if(user == null){

			UserModel.create(String(parseInt(Date.now() + "" +Math.random()*1000)), String(Date.now()), "未设置昵称的小伙伴", function( status ){

				if( status.code == 0 ){
					//console.log("toCookie", status );
					var user = status.result;
					var cookie = new Cookie("sid", user.toCookie());
					cookie.setExpires(new Date("2030"));
					res.setHeader("Set-Cookie", [cookie.toString()]);
					output.user = user.getInfo();

					promise.ok();
				}else{

					res.write( status.toString() );
					res.end();
				}

			});
		}else{

			promise.ok();
		}

	});

	promise.then(function(){

		//topic = tools.removeHtmlTag( topic );
		//des = tools.removeHtmlTag( des );

		RoomModel.create( topic, des, String(output.user._id) , pwd, function( status ){
			
			promise.ok( status );
			
			res.write( status.toString() );
			res.end();

			
			
			
		});

	});

	promise.then(function( status ){

		if( status.code == "0" ){

			var room = status.result;
			UserModel.addRoomPassword( String(output.user._id), room.id, pwd, function(){});
			ChatModel.create( room.id, "Your first message!", "*", output.user._id, null);
			LogModel.create( String(output.user._id), "create_room", room.getInfo(), function(){} );
		}

	});

	promise.start();
}