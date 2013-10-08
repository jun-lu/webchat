/**
	
	chat
	
	对话页面
*/

var tools = require("../../lib/tools");
var UserModel = require("../../lib/UserModel");
var RoomModel = require('../../lib/RoomModel');
var ChatModel = require('../../lib/ChatModel');
var Promise = require('../../lib/Promise');
var LogModel = require('../../lib/LogModel');
var WebStatus = require('../../lib/WebStatus');
var Room_PUBLIC_KYES = require('../../lib/Room').PUBLIC_KEYS;

module.exports = {

		get:function(req, res){

			var user = req.session.user || null;
			var id = req.params.key;
			var status = new WebStatus();

			var output = {
				user:user ? user.getInfo() : user,
				recently:[], //最近动态 
				accessUser:null, //被访问者信息
				tool:tools
			}

			//512081d4ff08ee5e51000001
			if(id.length != 24){

				status.setCode("-1");
				res.status(404).render("404", status.toJSON());

				return false;	
			};

			var promise = new Promise();
			//查询被访问者信息
			promise.add(function() {

				UserModel.find_id(id, function( status ){

					if(status.code == "0"){
						output.accessUser = status.result.getPublicInfo( 110 );
						promise.ok( status.result );	
					}else{
						status.addMsg("没有找到用户");
						res.status(404).render("404", status.toJSON() );
					}

				});
			});

			promise.then(function () {
				LogModel.inquire({"$or":[{id:user._id, location:"into_room"},{id:user._id, location:"create_room"}]}, 200, function( status ) {
					console.log("status", status);
					if( status.code == 0 ){

						//console.log()
						var list = tools.unique( status.result, function( a ) {	
							return a.info.id;
						});

						for(var i=0; i< list.length; i++){
							list[i].info = tools.cloneObject(list[i].info, Room_PUBLIC_KYES);
							output.recently.push( list[i] );
						}

					}
					promise.ok();	
				});
			});

			promise.then(function() {
				//res.write( JSON.stringify( output, "" , "   ") );
				//res.end();
				res.render("user/personal", output);
			});


			promise.start();
		},

		
		post:function( req, res ){

		}


};