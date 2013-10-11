/*
	Room

	描述一个房间
	
	topic 主题
	des 副标题
	masterId 创建者id
	name:别名 -> 可作为URL直接访问

	chatIndex 对话ID

*/
var crypto = require('crypto');

exports = module.exports = Room;



function staticHTML(a){
		return a.replace(/<|>/g,function(a){return a=="<"?"&lt;":"&gt;"});
}



function Room(topic, des, masterId){

	this.id = String(new Date().getTime());
	this.topic = staticHTML(topic) || "";
	this.des = staticHTML(des) || "";
	this.masterId = masterId || "";
	this.name = null;
	//this.masterName = "";
	this.master = null;

	this.time = parseInt(Date.now()/1000);
	this.password = null;//访问密码

	this.status = 1; // 1 开放，0关闭

	this.chatIndex = 0;
	//this.onlineUser = [];

}

Room.PUBLIC_KEYS = {
	_id:1,
	id:1,
	name:1,
	topic:1,
	des:1,
	status:1,
	time:1
};

Room.toHex = function( str ){

	var md5 = crypto.createHash('md5');
	md5.update( str );
	return md5.digest( 'hex' ) 

};

Room.factory = function( json ){

	var room  = new Room(json.topic, json.des, json.masterId);
	room.setid( json.id );
	room.setName( json.name );
	//以前的数据没有 masterName 项
	//room.setMasterName( json.masterName || "");
	room.setPassword( json.password || null );
	room.setTime( json.time );
	return room;

}

Room.prototype = {

	constructor:Room,
	toHex:Room.toHex,
	setid:function( id ){

		this.id = id;
	},
	//domain 把字符串转换为md5值，并设置为房间唯一id
	setdomain:function( string ){
		this.id = this.toHex( string );
	},
	setTopic:function( topic ){
		this.topic = topic;
	},
	setDes:function( des ){

		this.des = des;
	},
	setMasterId:function( id ){
		this.masterId = id;
	},
	setChatIndex:function( index ){
		this.chatIndex = index;
	},
	setName:function( name ){
		this.name = name;
	},
	setMasterName:function( masterName ){
		this.masterName = masterName;
	},
	setPassword:function( pwd ){
		this.password = pwd;
	},
	setTime:function( time ){

		this.time = time;
	},
	setMaster:function( master ){

		this.master = master;
	},
	save:function(){

		this.onSave();

	},
	toJSON:function(){

		return {
			id:this.id,
			topic:this.topic,
			des:this.des,
			masterId:this.masterId,
			//masterName:this.masterName,
			name:this.name,
			password:this.password,
			status:this.status,
			time:this.time
		};

	},

	getInfo:function( keys ){

		return {

			id:this.id,
			topic:this.topic,
			des:this.des,
			masterId:this.masterId,
			name:this.name,
			password:this.password,
			time:this.time,
			status:this.status,
			master:this.master
		}
	}
};

