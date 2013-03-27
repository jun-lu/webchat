
/*

	Chat  一个post的抽象类

*/
var ObjectID = require('mongodb').ObjectID;

exports = module.exports = Chat;

function staticHTML(a){return a.replace(/<|>/g,function(a){return a=="<"?"&lt;":"&gt;"})}

function Chat( roomid , text, user){

	this.time = parseInt(Date.now() / 1000);
	this._id = null; //此数据为数据库生成

	this.roomid = roomid;
	this.text = staticHTML(text) || "";

	this.uid = user.uid || user._id;
	this.uname = user.uname || user.name;
	this.uavatar = user.uavatar || user.getGravatar();

	this.del = 0; // 是否已经被删除

	this.to = null;//针对性对话信息

};

Chat.factory = function( json ){
	// 在做数据修复之后 去掉 json.user || 后面的代码
	var chat = new Chat( json.roomid, json.text, {"uid":json.uid, "uname":json.uname,"uavatar":json.uavatar} );
	chat.setId( json._id );
	chat.setDel( json.del );

	return chat;

};

Chat.prototype = {

	// time 为标准时间错 / 1000
	setId:function( id ){
		this._id = id;
	},
	setTime:function( time ){
		this.time = time;
	},
	setText:function( text ){
		this.text = text;
	},
	setUser:function( user ){

		this.user = user;
		//this.Uid = user.id;
		//this.Uname = user.name;

	},
	setDel:function( del ){

		this.del = del;
	},

	setIndex:function( index ){

		this.index = index;
	},
	/**
		_id:
		uid:
		uname:
		context:
	*/
	setTo:function( to ){
		this.to = to;
	},
	toJSON:function(){

		return {
			_id:this._id,
			roomid:this.roomid,
			time : this.time, 
			text : this.text,
			uid :this.uid,
			uname : this.uname,
			uavatar : this.uavatar,
			to : this.to,
			del : this.del  // 是否已经被删除
		}

	}
}


