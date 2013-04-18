/**
	
	login
	
	登陆
*/
var tools = require("../../lib/tools");
var WebStatus = require("../../lib/WebStatus");
var LogModel = require("../../lib/LogModel");
var RoomModel = require("../../lib/RoomModel");
var UserModel = require("../../lib/UserModel");
var ChatModel = require("../../lib/ChatModel");



module.exports = {

	get:null,
	post:function(req, res){
	
		var user = req.session.user  ? req.session.user : null;//测试时候使用管理员
		var topic = req.body.topic;
		var des = req.body.des;

		var masterid = null;

		/**
		
			如果用户未登陆
			创建匿名用户，并设置cookie

		*/

		if( user == null ){

			UserModel.createAnonymousUser( function( status ){

				if(status.code == 0){
					user = status.result;
					res.setHeader("Set-Cookie", ["sid="+user.toCookie()+";path=/;expires="+new Date("2030") ]);
					masterid = user._id;
					create();
				}else{
					status.setMsg("createAnonymousUser error");
					res.write(status.toString());
					res.end();
					//throw " createAnonymousUser error "+ status.code;
				}
			});

		}else{

			masterid = user._id;
			create();
		}
		
		function create(){		

			if( topic ){
				topic = tools.removalHtmlTag( topic );
				des = tools.removalHtmlTag( des );
				RoomModel.create( topic, des, masterid , user.name, function( status ){
					
					if( status.code == "0" ){

						var room = status.result;
						ChatModel.create( room.id, "The very first message!", user, null);
						res.redirect('/'+room.id);
						//记录用户日志
						LogModel.create( masterid, "create_room", room.getInfo() );
					}else{

						res.redirect('/');

					}
					
				});
				
			}else{
				res.redirect('/');
			}
		}
	}
	
};