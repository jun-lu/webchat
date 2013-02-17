/*
	Room

	描述一个房间
	
	topic 主题
	des 副标题
	masterId 创建者id
	name:别名 -> 可作为URL直接访问

	chatIndex 对话ID

	在线用户列表
	onlineUser [
		{User}, {User}
	]

*/

exports = module.exports = Room;

function Room(topic, des, masterId){

	this.id = new Date().getTime();
	this.topic = topic || "";
	this.des = des || "";
	this.masterId = masterId || "";
	this.name = null;

	this.chatIndex = 0;
	this.onlineUser = [];

}

Room.prototype = {

	constructor:Room,
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
	save:function(){

		this.onSave();

	},
	toJSON:function(){

		return {
			id:this.id,
			topic:this.topic,
			des:this.des,
			masterId:this.masterId,
			name:this.name,
			onlineUser:[]
		}

	},

	onSave:function(){}

};

