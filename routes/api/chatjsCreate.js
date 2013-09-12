/**
	number:17
		chat.js 登录
		
		uid为空
			创建uid账户，下次可使用uid登录
		uid有值
			查询uid是否注册，若已经注册直接登录到账户
			未注册使用uid创建账户


	url:"/sys/vchat-create"
	method:"post",
	param:{
		server: //必选
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
var config = require('../../config');
var Promise = require('../../lib/Promise');
var WebStatus = require('../../lib/WebStatus');
var UserModel = require('../../lib/UserModel');


module.exports = function( req, res ){

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
	}