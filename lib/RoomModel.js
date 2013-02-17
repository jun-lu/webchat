/**

	RoomModel

		提供对room集合的操作

	
	webchat
		-user
		-room
			-- 请参看ChatRoom类
*/

var DbModel = require('./DbModel');


exports = module.exports = RoomModel;

function RoomModel(){
	this.collection = "room";
};
//Object.create( events.EventEmitter )
RoomModel.prototype = Object.create( DbModel.prototype );
RoomModel.prototype.create = function( room ){

	//var topic = "周六骑行计划讨论小组";
	//var des = "关于明天骑行，大家可以讨论下细节，组织者是鲁军";
	//var masterid = 1234567;

	//var room = new Room( topic, des, masterid );

	this.insert( room.toJSON() );
};