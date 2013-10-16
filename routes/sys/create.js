/**
	
	login
	
	登录
*/
var tools = require("../../lib/tools");
var config = require("../../config");
var WebStatus = require("../../lib/WebStatus");
var LogModel = require("../../lib/LogModel");
var RoomModel = require("../../lib/RoomModel");
var UserModel = require("../../lib/UserModel");
var ChatModel = require("../../lib/ChatModel");
var Promise = require("../../lib/Promise");
var Cookie = require("../../lib/Cookie");

module.exports = {

	get:null,
	post:function(req, res){
		
		var user = req.session.user;//测试时候使用管理员
		var topic = req.body.topic;
		var des = req.body.des;

		var output = {
			user:user ? user.getInfo() : null
		};



		var promise = new Promise();

		promise.then(function(){

			if( output.user ){
				promise.ok();
			}else{

				//创建匿名用户
				UserModel.createAnonymousUser( function( status ){

					if(status.code == 0){
						var user = status.result;
						output.user = status.result.getInfo();
						var cookie = new Cookie("sid", user.toCookie());
						res.setHeader("Set-Cookie", [cookie.toString()]);
						promise.ok();
					}else{
						status.setMsg("createAnonymousUser error");
						res.write(status.toString());
						res.end();
						//throw " createAnonymousUser error "+ status.code;
					}
				});	
			}

		});
		//var masterid = null;

		/**
		
			如果用户未登录
			创建匿名用户，并设置cookie

		*/

		promise.then(function(){

			if( topic ){
				topic = tools.removeHtmlTag( topic );
				des = tools.removeHtmlTag( des );
				RoomModel.create( topic, des, String(output.user._id) , null, function( status ){
					
					promise.ok( status );
					
					
				});
			}else{
				promise.ok( new WebStatus("-1") );
			}

		});

		promise.then(function( status ){

			if( status.code == "0" ){

				var room = status.result;
				ChatModel.create( room.id, "Your first message!", "*", output.user._id, null);
				res.redirect('/'+room.id);
				LogModel.create( String(output.user._id), "create_room", room.getInfo(), function(){} );
			}else{

				res.redirect('/');

			}

		});

		promise.start();
	}
	
};