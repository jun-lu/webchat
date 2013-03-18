/**
	
	login
	
	登陆
*/

var fs = require("fs");
var tools = require("../../lib/tools");
var User = require("../../lib/User");
var WebStatus = require("../../lib/WebStatus");
var LogModel = require("../../lib/LogModel");
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
		var file = req.query.path;
		if(file){
            fs.readFile(__dirname+"/../../views/tmpl/"+file, "utf-8", function(err, data){
            	res.setHeader("Content-Type" ,"text/ejs; charset=utf-8");
	            res.end(data);
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
					step2();
					return ;
				}

				status.setCode( "403" );

			}

			res.write( status.toString(), "utf-8" );
			res.end();
			

		});

		//验证 name 是否会重复
		function step2(){

			RoomModel.nameFind( name, function( status ){

				console.log(" name ", status, id);
				if(status.code == "404"){
					//status.setCode("0");
					step3();
				}else{
					var room = status.result;
					if( room._id == id){
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
			if(topic && des){

				RoomModel.update(id, name, topic, des, function( status ){

					//通知其他用户房间信息被修改
					res.write( status.toString(), "utf-8" );
					res.end();

					socketServer.roomUpdate( status.result );


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
	},

	bindMail:function( req, res ){

		var user = req.session.user;
		var status = new WebStatus();

		var mail = req.body.mail;
		var pwd = req.body.pwd;

		//登陆判断
		if(!user){

			status.setCode("-3");
			res.write( status.toString() );
			res.end();
			return ;
		}

		if( !User.checkMail( mail ) ){

			res.write( new WebStatus("-1").toString() );
			res.end();
			return ;

		}

		//匿名注册用户的mail全是数字
		//还需要检查用户名是否重复
		if(/^\d+$/.test( user.mail )){

			//首先检查 email是否被注册
			UserModel.emailFind( mail, function( status ){

				if(status.code == "404"){

					//修改当前用户的  email 和 密码
					UserModel.updateMailPwd( user._id , mail, pwd, function( status ){

						if(status.code == "0"){

							UserModel.find_id( user._id, function( status ){
								//console.log( status );
								var user = status.result;
								res.setHeader("Set-Cookie", ["sid="+user.toCookie()+";path=/;expires="+new Date("2030") ]);
								res.write( new WebStatus().toString() );
								res.end();
							});

						}else{

							res.write( status.toString() );
							res.end();

						}

					});


				}else{
					// email 已经被使用了。
					status.setCode("-2");
					res.write( status.toString() );
					res.end();
				}

			} );

		}else{
			//非匿名用户无法绑定
			status.setCode("403");
			res.write(status.toString());
			res.end();

		}

	},
	/**
		#获取我的活动记录
		param:none
		method:get
		return:{
			code:0,
			msg:"",
			result:{
				intos:[],
				creates[]
			}
		}
	*/
	//方法有潜在bug，只能分析最近的N条数据。并不一定能够正确而找到用户创建过的记录
	ichats:function( req, res ){

		var user = req.session.user;

		LogModel.getLog( user._id, 10000, function( status ){

			if(status.code == "0"){

				var logs = status.result;
				//进入过
				var intos = [];
				//创建过
				var creates = [];

				for(var i=0; i< logs.length; i++){

					if(logs[i].location == "into_room"){

						intos.push( logs[i].info );
					}

					if(logs[i].location == "create_room"){

						creates.push( logs[i].info );
					}
				}

				status.setResult({
					intos:tools.unique(intos, function(item){  return item.id; }),
					creates:creates
				});
			}

			res.write( status.toString() );
			res.end();

		});

	},

	/**
		#检查一个email是否被注册

		method:post,
		return:{
			code:"0" //0, -2
			msg:"正确"//未注册，已经注册
			result:null
		}
	
	*/
	checkMailIsReg:function(req, res){

		var mail  = req.query.mail;

		if( !User.checkMail( mail ) ){

			res.write( new WebStatus("-1").toString() );
			res.end();
			return ;

		}

		UserModel.emailFind( mail, function( status ){

			if(status.code == "404"){

				res.write( new WebStatus().toString() );
				res.end();
			}else{

				res.write( new WebStatus("-2").toString() );
				res.end();
			}

		} );

	},
	/**
		url: "/sys/set_avatar",
		method:post,
		param:
			gravatarDefault : (mm", monsterid", "wavatar", "retro", "blank") // 必须是这其中之一
		return:{
			code:0,(0, 403)
			msg:"",
			result:null
		}
	*/
	setAvatar:function( req, res ){

		var user = req.session.user;
		var status = new WebStatus();

		var gravatarDefault = req.body.gravatarDefault;


		//登陆判断
		if(!user){

			status.setCode("-3");
			res.write( status.toString() );
			res.end();
			return ;
		}

		UserModel.updateGravatarDefault(user._id, gravatarDefault, function( status ){

			res.write( status.toString() );
			res.end();

		});
		
	},
	/**

		url: "/sys/check_room_key",
		method:get,
		param:
			key : string < 100 // 可以是任意字符
		return:{
			code:0,//(0, -2)
			msg:"",//(可用，已经被使用)
			result:null
		}

	*/
	checkRoomKey:function(req, res){

		var status = new WebStatus();
		var key = req.query.key;
		if(key.length >0 && key.length < 100){

			RoomModel.nameFind( key, function( status ){

				if(status.code == "404"){
					status.setCode("0");
				}else{
					//如果查询到房间
					status.setCode( status.code == "0" ? "-2" : status.code);
				}

				res.write( status.toString() );
				res.end();				

			});

			return ;
		}

		status.setCode("-1");
		res.write( status.toString() );
		res.end();
	},

	/*
		url: "/sys/history",
		method:get,
		param:
			roomid:123456789 //正确的房间id
			pageSize :24, // number > 0  需求返回的数量
			pageNumber:1 // 请求页码
		return:{
			code:0,//(0, -1)
			msg:"",//(可用，参数错误)
			result:[
				user,user,....
			]
		}		
	
	*/
	getHistory:function(req, res){

		var roomid = req.query.roomid;
		var size = req.query.size || 20;
		//var pageNumber = req.query.pageNumber || 1;

		var status = new WebStatus();

		if( roomid && size > 0 ){
			
			LogModel.getHistory( roomid, size, function( status ){

				if(status.code == "0" && status.result.length){

					UserModel.getMultiple( status.result, function( status ){

						res.write( status.toString() );
						res.end();

					})		

				}else{
					res.write( status.toString() );
					res.end();
				}

			});
			return ;
		}

		status.setCode("-1");
		res.write( status.toString() );
		res.end();

	}
};