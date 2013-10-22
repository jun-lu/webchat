/**
	number:18
		chat.js登录接口
    uid为空
        创建uid账户，下次可使用uid登录
    uid有值
        查询uid是否注册，若已经注册直接登录到账户
        未注册使用uid创建账户


	url:"/sys/vchat-login"
	method:"post",
	param:{
		domain: //必选
		uid:"自动生成一个24位MD5值" //可选
		uname: "匿名"//可选
		uavatar: ""//可选
	}

	return {
		code:0,
		msg:"",
		result:{
			user:User,
			multiple:User, //留言器已经保存在用户
			roomid:13623984732, //server对应的roomid,
			isNew:[0,1]// 0旧账户  1新账户
		}
	}
*/

var Promise = require('../../lib/Promise');
var WebStatus = require('../../lib/WebStatus');
var Room = require('../../lib/Room');
var RoomModel = require('../../lib/RoomModel');
var ChatModel = require('../../lib/ChatModel');

module.exports = function( req, res ){
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

}