/**
	
	login
	
	登陆
*/
var Log = require("../../lib/Log");
var User =require("../../lib/User");
var Room = require("../../lib/Room");
var LogModel = require("../../lib/LogModel");
var WebStatus = require("../../lib/WebStatus");
var API = require("../../lib/api");

function staticHTML(a){return a.replace(/<|>/g,function(a){return a=="<"?"&lt;":"&gt;"})}


module.exports = {

	get:null,
	post:function(req, res){
	
		var masterid = null;
		var user = req.session.user  ? req.session.user._id : null;//测试时候使用管理员
		var topic = staticHTML(req.body.topic);
		var des = staticHTML(req.body.des);


		if( user == null ){

			API.createAnonymousUser( function(status, userjson){

				if(status.code == 0){
					user = User.factory( userjson );
					res.setHeader("Set-Cookie", ["sid="+user.toCookie()+";path=/;expires="+new Date("2030") ]);
					masterid = user._id;
					create();
				}else{
					throw " createAnonymousUser error "+ status.code;
				}
			});

		}else{

			masterid = user._id;
			create();
		}
		
		function create(){		

			if( topic ){

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
	}
	
};