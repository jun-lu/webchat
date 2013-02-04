/*
	ChatRoom

	描述一个房间
	
	topic 主题
	des 副标题
	masterId 创建者id


	chatIndex 对话ID

	在线用户列表
	onlineUser [
		{User}, {User}
	]

*/

exports = module.exports = ChatRoom;

function ChatRoom(topic, des, masterId){

	this.id = 123456;
	this.topic = "";
	this.des = "";
	this.masterId = "";

	this.chatIndex = 0;
	this.onlineUser = [];

}

ChatRoom.prototype = {

	constructor:ChatRoom,
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
	toString:function(){

		return {
			id:this.id,
			topic:this.topic,
			des:this.des,
			masterId:this.masterId,
			onlineUser:[]
		}

	},

	onSave:function(){}

};

