
/**
	number:4
	修改房间信息
		name 不可和别的房间重复
		
	url: "/sys/room_update"
	method:post
	param:
		name: string < 50
		topic: string < 500,
		des: string < 2000,
		[password]: string < 30
	return:{
		code:0, //(0, -1, 403),
		msg:"", //(正确, 参数错误, 超出访问权限(没有权限修改)),
		result:null
	}
	
*/

var config = require('../../config');
var tools = require("../../lib/tools");
var WebStatus = require("../../lib/WebStatus");
var RoomModel = require("../../lib/RoomModel");
var UserModel = require("../../lib/UserModel");

module.exports = function(req, res){

	var user = req.session.user;
	var name = tools.revertHtmlTag( req.body.name || "" ) ;
	var topic = tools.revertHtmlTag(req.body.topic);
	var des = tools.revertHtmlTag(req.body.des);
	var id = req.body.id;
	var password = tools.trim(req.body.password) || null;
	var room = null;

	name = name.toLowerCase();

	if(user == null){
		res.write( new WebStatus("301").toString() );
		res.end();
		return ;
	}

	//验证当前用户是否有修改权限
	RoomModel.idFind( id , function( status ){

		if(status.code == 0){
			room = status.result;

			//验证成功进入第2步
			if(room.masterId == user._id){
				if(name){
					step2()
				}else{
					step3();
				};
				return ;
			}

			status.setCode( "403" );

		}

		res.write( status.toString(), "utf-8" );
		res.end();
		

	});

	//验证 name 是否会重复
	function step2(){

		
		if(config.sysWord.indexOf(name) != -1){
			var status = new WebStatus();
			status.setCode("-2");
			status.setMsg("快捷访问地址 name 重复");
			res.write( status.toString() );
			res.end();
			return ;

		}

		RoomModel.nameFind( name, function( status ){

			if(status.code == "404"){
				step3();
			}else{
				var room = status.result;
				if( room.id == id){
					step3();	
				}else{
					status.setCode("-2");
					status.setMsg("快捷访问地址 name 重复");
					res.write( status.toString() );
					res.end();
				}
			}				

		});

	}


	//第2步修改信息
	function step3(){

		
		var status = new WebStatus();

		//请把验证写得更详细，比如限制最长字符长度与最短字符长度
		if(topic.length){

			RoomModel.updateInfo(id, name, topic, des, password, function( status ){

				if(password != null){
					UserModel.addRoomPassword(user._id, room.id, password, function( status ){

						//通知其他用户房间信息被修改
						res.write( status.toString(), "utf-8" );
						res.end();

					})
				}else{

					//通知其他用户房间信息被修改
					res.write( status.toString(), "utf-8" );
					res.end();
				}	
				

				//socketServer.roomUpdate( status.result );


			})
			
		}else{

			status.setCode("-1");
			res.write( status.toString(), "utf-8" );
			res.end();
		}

	}

};

