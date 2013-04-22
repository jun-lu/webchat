/*
	Room

	描述一个房间
	
	topic 主题
	des 副标题
	masterId 创建者id
	name:别名 -> 可作为URL直接访问

	chatIndex 对话ID

*/

function staticHTML(a){
		return a.replace(/<|>/g,function(a){return a=="<"?"&lt;":"&gt;"});
}


exports = module.exports = Room;

function Room(topic, des, masterId){

	this.id = String(new Date().getTime());
	this.topic = staticHTML(topic) || "";
	this.des = staticHTML(des) || "";
	this.masterId = masterId || "";
	this.name = null;
	this.masterName = "";
	this.master = null;

	this.time = parseInt(Date.now()/1000);
	this.password = null;//访问密码

	this.chatIndex = 0;
	//this.onlineUser = [];

}
//db.room.update({_id:"5113797bf9d8237201000003"}, {"$set":{masterId:"512081d4ff08ee5e51000001"}})
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
	setid:function( id ){

		this.id = id;
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
			masterName:this.masterName,
			name:this.name,
			password:this.password,
			time:this.time
		};

	},

	getInfo:function(){

		return {

			id:this.id,
			topic:this.topic,
			des:this.des,
			masterId:this.masterId,
			//masterName:this.masterName,
			name:this.name,
			password:this.password,
			time:this.time,
			master:this.master
		}
	}
};

