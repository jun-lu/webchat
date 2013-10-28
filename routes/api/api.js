/**
	
	login
	
	登录
*/

var fs = require("fs");
var tools = require("../../lib/tools");
var User = require("../../lib/User");
var config = require("../../config");
var WebStatus = require("../../lib/WebStatus");
var LogModel = require("../../lib/LogModel");
var ChatModel = require("../../lib/ChatModel");
var UserModel = require("../../lib/UserModel");
var Room = require("../../lib/Room");
var RoomModel = require("../../lib/RoomModel");
var NoticeModel = require("../../lib/NoticeModel");
var Promise = require("../../lib/Promise");


var sysWord = config.sysWord;

module.exports = {

	//修改当前用户的昵称
	setUserName:function( req, res ){

		var user = req.session.user || null;
		var name = req.body.name;
		var status = new WebStatus();
		
		res.setHeader("Content-Type" ,"application/json; charset=utf-8");

		if(user == null){
			res.write( new WebStatus("-3").toString() );
			res.end();
			return ;
		}

		if( name && user){
			//如果用户原来的昵称是空（刚进入的匿名用户）
			//把头像修改成默认的小怪兽，以区别为写名字的用户
			if( !user || !user.name ){
				UserModel.updateGravatarDefault( user._id, "monsterid", function(){});
			}
			
			name = tools.removeHtmlTag( name );
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
		var name = tools.removeHtmlTag( req.body.name ) || "";
		var topic = req.body.topic;
		var des = req.body.des;
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

			
			if(sysWord.indexOf(name) != -1){
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
			if(topic.length && des){

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

	},

	// 获取时间轴上更多对话信息

	getMore:function(req, res){

		// 下拉数据
		var roomid = req.query.roomid;
		var time = parseInt(req.query.time, 10);
		var limit = req.query.limit || 10;
		//var chatModel = new ChatModel();

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

		//登录判断
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
					status.setMsg("email已经被使用");
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
		
		if(user == null){
			res.write( new WebStatus("-3").toString() );
			res.end();
			return ;
		}

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


		//登录判断
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

			if(sysWord.indexOf( key ) != -1){

				res.write( new WebStatus("-2").toString() );
				res.end();
				return ;
			}

			RoomModel.nameFind( key, function( status ){

				if(status.code == "404"){
					status.setCode("0");
				}else{
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
			size :24, // number > 0  需求返回的数量
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

	},
	userSummary:function(req, res){

		var user = req.session.user || null;
		var summary = req.body.summary;
		var status = new WebStatus();

		if( !user ){
			status.setCode("-3");
			res.write( status.toString(),"utf-8" );
			res.end();
			return ;
		}

		if( summary && summary.length < 300){

			summary = tools.removeHtmlTag( summary );
			UserModel.updateSummary(user._id, summary, function( status ){
				res.write( status.toString() );
				res.end();
				return ;
			});

		}else{
			status.setCode("-1");
			res.write( status.toString() );
			res.end();

		}
	},
	//12
	noticeCount:function(req, res){
		var user = req.session.user || null;
		var status = Number(req.query.status) || 0;

		if( !user ){

			res.write( new WebStatus("-3").toString() );
			res.end();
			return ;
		}

		NoticeModel.countStatus( String(user._id), [0], function( status ){

			res.write( status.toString() );
			res.end();

		});

	},
	//13
	noticeList:function(req, res){

		var user = req.session.user || null;
		var time = Number(req.query.time) || Date.now()/1000;
		var number = Number(req.query.number) || 5;

		var output = {};

		if( !user ){

			res.write( new WebStatus("-3").toString() );
			res.end();
			return ;
		}

		var promise = new Promise();

		promise.add(function(){
			NoticeModel.countStatus( String(user._id), [0,1], function( status ){

				output.count = status.result;
				promise.ok();
			});
		});

		promise.add(function(){
			NoticeModel.findUnread( String(user._id), time, number, function( status ){

				output.list = status.result;
				promise.ok();
				//标示为已经知晓状态
				if( status.code == "0" && status.result && status.result.length > 0 ){
					var ids = [];
					for(var i=0; i< status.result.length ; i++){
						ids.push( status.result[i]._id.toString() );
					};
					//console.log("ids", ids );
					NoticeModel.updateMoreStatus( ids, 1);
				}

			});
		});

		promise.then(function(){
			var status = new WebStatus();
			status.setResult( output );
			res.write( status.toString() );
			res.end();
		});

		promise.start();
	},
	//14
	noticeStauts:function(req, res){

		var user = req.session.user || null;
		var status = Number(req.body.status);
		var _id = req.body._id;

		status = status ? status : 2;


		if( !user ){

			res.write( new WebStatus("-3").toString() );
			res.end();
			return ;
		}

		if( String(_id).length != 24 || !(status == 1 || status == 2 || status == 0)){

			res.write( new WebStatus("-1").toString() );
			res.end();

			return ;
		}


		NoticeModel.updateStatus( String(_id), status, function( status ){

			res.write( status.toString() );
			res.end();

		});
	},
	//17号接口
	vchatCreate:function( req, res ){
		//console.log(11111111111);
		res.setHeader('Access-Control-Allow-Credentials', 'true');
		res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
		var user = req.session.user;
		var domain = req.body.domain;
		var uid = req.body.uid || "";
		var uname = req.body.uname || "匿名";
		var uavatar = req.body.uavatar || null;

		var output = {
			user:null,
			multiple:user,
			isNew:0
		};
		
		var promise = new Promise();


		if( !domain ){

			res.end( new WebStatus("-1").setMsg("Miss 'domain'").toString() );
			return ;
		}

		promise.then(function(){
			//如果uid为空，user存在就使用vchat的用户
			output.isNew = 0;
			if(uid == "" && user){
				output.isNew = 2;//vchat用户
				promise.ok( new WebStatus().setResult( user ) );
			}else{
				
				uid = uid ? uid : Date.now();
				UserModel.findVchatUser( uid, function( status ){

					promise.ok( status );

				});
			}
		});

		promise.then(function( status ){

			//已经存在用户
			if( status.code == "0" ){
				promise.ok( status );
			}else{
				output.isNew = 1;
				uid = domain + Date.now();
				UserModel.createVchatUser( uid, domain, uname, uavatar, function( status ){
					promise.ok( status );

				});
			}
		});

		promise.then(function( status ){
			//console.log( "status", status );
			var user = status.result;
			output.user = user.getPublicInfo(48);
			res.setHeader("Set-Cookie", ["sid="+user.toCookie()+";path=/;domain="+config.domain+";expires="+new Date("2030") ]);
			res.end( status.setResult( output ).toString() );

		});

		promise.start();
	},
	//18号接口
	vchatLogin:function( req, res ){
		res.setHeader('Access-Control-Allow-Credentials', 'true');
		res.setHeader("Access-Control-Allow-Origin", req.headers.origin);

		var user = req.session.user;
		var domain = req.body.domain;
		var topic = req.body.topic;
		var des = req.body.des;
		var haxid = null;

		if( !user ){
			res.end( new WebStatus("304").setMsg("not login") );
			return ;
		}

		if( !domain ){
			res.end( new WebStatus("-1").setMsg("Miss 'domain'") );
			return ;
		}

		haxid = Room.toHex( domain );

		var promise = new Promise();

		promise.add(function(){
			RoomModel.idFind(haxid, function( status ){

				promise.ok( status );

			});
		});

		promise.then(function( status ){

			if( status.code == "0" ){
				promise.ok( status );
			}else{

				var room = new Room(topic || domain, des || domain, user._id);
				room.setdomain( domain );
				RoomModel.insert(room.toJSON(), function( status ){
					promise.ok( status );
					if(status.code == "0"){
						ChatModel.create( status.result.id, "Your first message!", "*", user._id, null);
					}
				});
			}
		});

		promise.then(function( status ){

			res.end( status.toString() );
		});	

		promise.start();

	},
	vchatHistory:function( req, res ){
		res.setHeader('Access-Control-Allow-Credentials', 'true');
		res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
		var user = req.session.user;
		var to = req.query.to;
		var limit = parseInt(req.query.limit) || 10;
		var roomid = req.query.roomid;
		var promise = new Promise();

		if( !user ){

			res.end(new WebStatus("304").toString());
			return ;

		};

		if( !roomid ){
			res.end(new WebStatus("-1"));
			return ;
		}
		promise.add(function(){

			ChatModel.findLimitSort({
				roomid:roomid,
				time:{"$lt":parseInt(Date.now()/1000)},
				from:{"$in":[to, user._id]}, 
				to:{"$in":[user._id, to]},
			}, limit, {time:-1}, function( status ){
				promise.ok( status );
			})

		});

		promise.then(function( status ){

			if(status.code == 0){
				ChatModel.serialization( status, function( status ){

					promise.ok( status );

				})
			}else{
				promise( status );
			}

		});

		promise.then(function( status ){
			status.result && status.result.reverse();
			res.end( status.toString() );
		})

		

		promise.start();
		

	}
};