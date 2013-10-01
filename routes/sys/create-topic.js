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

	post:null,
	get:function(req, res){
		
		var user = req.session.user;//测试时候使用管理员
		var topic = req.body.topic;
		var des = req.body.des;

		var output = {};


		var promise = new Promise();

		promise.then(function(){
			if( user == null ){

				UserModel.createAnonymousUser( function( status ){

					if(status.code == 0){
						var user = status.result;
						//output.user = status.result.getInfo();
						var cookie = new Cookie("sid", user.toCookie());
						res.setHeader("Set-Cookie", [cookie.toString()]);
						promise.ok( user )
					}else{
						status.setMsg("createAnonymousUser error");
						res.write(status.toString());
						res.end();
						//throw " createAnonymousUser error "+ status.code;
					}
				});	


			}else{

				promise.ok( user );
			}

		});
		

		promise.then(function( user ){


			output.user = user.getInfo();
			res.render("sys/create-topic", output);
			
			//res.write( JSON.stringify(output) );
			//res.end();
		});

		promise.start();
	}
	
};