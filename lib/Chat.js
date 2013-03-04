
/*

	Chat  一个post的抽象类

*/

exports = module.exports = Chat;

function staticHTML(a){return a.replace(/<|>/g,function(a){return a=="<"?"&lt;":"&gt;"})}

function Chat( roomid , text, user){

	this.time = parseInt(new Date().getTime() / 1000);
	this._id = null; //此数据为数据库生成

	this.roomid = roomid;
	this.text = staticHTML(text) || "";

	this.Uid = user.id;
	this.Uname = user.name;

	this.del = 0; // 是否已经被删除

	this.index = 0;

	this.to = null;//针对性对话信息

};

Chat.factory = function( json ){

	var chat = new Chat( json.roomid, json.text, {id:json.Uid, name:json.Uname} );
	chat.setId( json._id );
	chat.setDel( json.del );
	chat.setIndex( json.index );
	//chat.setUser( json.user );

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

		this.Uid = user.id;
		this.Uname = user.name;

	},
	setDel:function( del ){

		this.del = del;
	},

	setIndex:function( index ){

		this.index = index;
	},
	setTo:function( to ){
		this.to = to;
	},
	save:function(){

	},

	toJSON:function(){

		return {
			index:this.index,
			roomid:this.roomid,
			time : this.time, 
			text : this.text,

			Uid : this.Uid, 
			Uname: this.Uname,

			del : this.del  // 是否已经被删除

		}

	},

	onUpdate:function( keys ){


	}
}

