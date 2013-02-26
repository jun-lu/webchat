/*
	Log

	描述一个用户日志
	
	{
		_id 数据库od
		id: 人物  userid
		location: 动作名称["create_room", "init_room"]
		info: 干什么
		time: 时间
	}

*/

exports = module.exports = Log;

function Log( id, location, info ){

	this._id = null;
	this.id = id;
	this.location = location;
	this.info = info;

	this.time = Date.now();

}
//db.room.update({_id:"5113797bf9d8237201000003"}, {"$set":{masterId:"512081d4ff08ee5e51000001"}})
Log.factory = function( json ){

	var log  = new Log(json.id, json.location, json.info);
	log.set_id( json._id );
	log.setTime( json.time );
	return log;

}

Log.prototype = {

	constructor:Log,
	set_id:function( id ){

		this._id = id;
	},
	setid:function( id ){

		this.id = id;
	},
	setLocation:function( location ){
		this.location = location;
	},
	setInfo:function( info ){

		this.info = info;
	},
	setTime:function( time ){

		this.time = time;
	},
	toJSON:function(){

		return {
			_id:this._id,
			id:this.id,
			location:this.location,
			info:this.info,
			time:this.time
		}

	},

	getInfo:function(){

		return {
			_id:this._id,
			id:this.id,
			location:this.location,
			info:this.info,
			time:this.time
		}
	}
};

