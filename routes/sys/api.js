/**
	
	login
	
	登陆
*/

var fs = require("fs");
var WebStatus = require("../../lib/WebStatus");
var ChatModel = require("../../lib/ChatModel");
var UserModel = require("../../lib/UserModel");
var RoomModel = require("../../lib/RoomModel");
var socketServer = require("../../lib/socketServer");

module.exports = {

	//修改当前用户的昵称
	setUserName:function( req, res ){

		var user = req.session.user;
		var name = req.body.name;
		var status = new WebStatus();
		
		res.setHeader("Content-Type" ,"application/json; charset=utf-8");

		if( name ){
			
			UserModel.updateName( user._id, name, function( status ){

				// 通知其他用户某用户名字修改
				socketServer.updateUser( status.result );

				res.write( status.toString() , "utf-8");
				res.end();

			});

		}else{

			status.setCode("-1");
			res.write( status.toString(), "utf-8" );
			res.end();
		}

	},
	getTmpl:function(req, res){
		//console.log(req);
		var file = req.query.path;
		//console.log("tmpl", "tmpl/"+file, __dirname);
		if(file){
			//var fs = require('fs');
            fs.readFile(__dirname+"/../../views/tmpl/"+file, "utf-8", function(err, data){
            	res.setHeader("Content-Type" ,"text/ejs; charset=utf-8");
	            res.end(data);
				//res.sendFile( "tmpl/"+file );
            });
		}else{
			res.write( file + "not defined");
			res.end();
		}
	},

	//修改房间信息
	updateRoom:function(req, res){

		var user = req.session.user;
		var name = req.body.name;
		var topic = req.body.topic;
		var des = req.body.des;
		var id = req.body.id;


		//验证当前用户是否有修改权限
		RoomModel.idFind( id , function( status ){

			if(status.code == 0){
				var room = status.result;

				//验证成功进入第2步
				if(room.masterId == user._id){
					update();
					return ;
				}

				status.setCode( "403" );

			}

			res.write( status.toString(), "utf-8" );
			res.end();
			

		});



		//第2步修改信息
		function update(){

			
			var status = new WebStatus();

			//请把验证写得更详细，比如限制最长字符长度与最短字符长度
			if(topic && des){

				RoomModel.update(id, name, topic, des, function( status ){

					//通知其他用户房间信息被修改
					socketServer.updateRoom( status.result );

					res.write( status.toString(), "utf-8" );
					res.end();

				})
				
			}else{

				status.setCode("-1");
				res.write( status.toString(), "utf-8" );
				res.end();
			}

		}

	},

	// 获取时间轴上更多对话信息

	getMore:function(req, res){

		// 下拉数据
		var roomid = req.query.roomid;
		var time = parseInt(req.query.time, 10);
		var limit = req.query.limit || 10;
		var chatModel = new ChatModel();

		ChatModel.findMoreChats(roomid, time, function( status ){

			res.write( status.toString(), "utf-8" );
			res.end();


		});
	}
};