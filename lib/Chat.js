
/*

	Chat  一个post的抽象类

*/
var ObjectID = require('mongodb').ObjectID;

exports = module.exports = Chat;

function staticHTML(a){return a.replace(/<|>/g,function(a){return a=="<"?"&lt;":"&gt;"})}

function Chat( roomid , text, to, from, aim){

	this._id = null; //此数据为数据库生成

	this.roomid = roomid;
	this.text = staticHTML(text) || "";

	this.to = to; //数据库 User id
	this.from = from; //数据库 User id

	this.aim = aim || null;//针对性对话信息

	this.time = parseInt(Date.now() / 1000);

	this.del = 0; // 是否已经被删除

};

Chat.factory = function( json ){
	// 在做数据修复之后 去掉 json.user || 后面的代码
	var chat = new Chat( json.roomid , json.text, json.to, json.from, json.aim );
	chat.setId( json._id );
	chat.setDel( json.del );
	chat.setTime( json.time );
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
	setDel:function( del ){

		this.del = del;
	},
	setAim:function( aim ){

		this.aim = aim;
	},
	setTo:function( to ){
		this.to = to;
	},
	setFrom:function( from ){
		this.from = from;
	},
	toJSON:function(){

		return {
			_id:this._id,
			roomid:this.roomid,
			time : this.time, 
			text : this.text,
			to : this.to,
			from: this.from,
			aim: this.aim,
			del : this.del  // 是否已经被删除
		}

	}
}


