
/*
	url: "/sys/room-inviteh",
	method:get,
	param:
		_ids:"_id,_id" //被邀请用户的_id
		mails :"mail,mail", //  用逗号分割的email
		roomid:123456789 //正确的房间id
	return:{
		code:0,//(0, -1)
		msg:"",//(可用，参数错误)
		result:true
	}		

*/
var path = require("path");
var fs = require("fs");
var ejs = require("ejs");//compile
var WebStatus = require("../../lib/WebStatus");
var LogModel = require("../../lib/LogModel");
var RoomModel = require("../../lib/RoomModel");
var UserModel = require("../../lib/UserModel");
var Promise = require("../../lib/Promise");
var tools = require("../../lib/tools");
var SystemMail = require("../../lib/SystemMail");
var Room_PUBLIC_KEYS = require("../../lib/Room").PUBLIC_KEYS;
var checkMail = require("../../lib/User").checkMail;
var mail_tmpl_fn = ejs.compile( fs.readFileSync(path.resolve("views/tmpl/mail")+"/invite.html", {encoding:"utf-8"}) );


module.exports = function( req, res ){

	var _idString = tools.trim(req.query._ids);//.split(",");
	var mailString = tools.trim(req.query.mails);//.split(",");
	var roomid = tools.trim(req.query.roomid);
	var status = new WebStatus();
	var user = req.session.user;
	var	promise = new Promise();
	var output = {
		from:user ? user.getInfo() : null,
		to:null,
		room:null,
		time:tools.format(Date.now(), "yyyy-MM-dd hh:mm")
	};
	
	if( user == null ){

		res.write( status.setCode("-3").toString() );
		res.end();
		return ;

	};

	if( roomid.length == 0 ){

		status.setCode("-1").setMsg(" roomid is undefined ");
		res.write( status.toString() );
		res.end();

		return ;

	}

	if( _idString.length == 0 && mailString.length == 0 ){

		status.setCode("-1").setMsg(" _ids or mails is undefined ");
		res.write( status.toString() );
		res.end();

		return ;
	}

	promise.then(function(){

		RoomModel.idFind( roomid, function( status ){
			if( status.code == 0 ){
				output.room = status.result;
				promise.ok( output.room );
			}else{
				res.write( status.toString() );
				res.end();
			}
		});	

	});
	//查询被邀请的用户
	promise.then(function( room ){
		var objectIds = [];
		var _ids = _idString.split(",");

		for( var i=0; i< _ids.length; i++ ){
			objectIds.push( UserModel.objectId( _ids[i] ) );
		}

		UserModel.findFilter({ _id : {"$in":objectIds}  }, {mail:1, name:1}, function( status ){
			//var userMails = []; //被邀请的 mail
			var users = [];//被邀请的用户
			var mail = null;

			if( status.code == 0 && status.result.length != 0 ){

				for(i=0; i< status.result.length; i++){
					mail = status.result[i].mail
					if( checkMail( mail ) ){
						//userMails.push( mail );
						users.push( status.result[i] );
					}
				}

			}

			promise.ok( users );
		});

	});

	//邀请 mail
	promise.then(function( users ){

		promise.ok();
		var mails = mailString.split(",");
		var i = 0 ;
		var title = output.from.name + "邀请你参与" + output.room.topic;
		for(i=0; i< mails.length; i++){

			if( checkMail( mails[i] ) ){

				users.push( {name:"", mail:mails[i]} );
			}

		}

		if( users.length > 0 ){
			for(i=0; i<users.length ; i++){
				output.to = users[i];
				SystemMail.send(
					"jelle.lu@gmail.com",
					users[i].mail,
					title,
					title +", https://www.vchat.co/t/"+(output.room.name || output.room.id),
					mail_tmpl_fn( output ),
					function(){}
				)
			}
		}


	});

	promise.then(function(){

		res.write( new WebStatus().toString() );
		res.end();

	});

	promise.start();

};
