
/*

	Notice  提醒抽象

	type: 1 对话回复 2对话at 
	from:来自
	to:去
	what:
	des:描述
	time:
	status: //状态 0未读  1已知晓  2已读

	from 在 where 中 提到了 to, what -> response ? 

*/
var ObjectID = require('mongodb').ObjectID;

var Notice = module.exports = function( type, from, to, where, what, response){

	this._id = null;
	this.type = type;
	this.from = from;
	this.to = to;
	this.where = where;
	this.what = what;//id
	this.response = response;
	this.time = parseInt(Date.now()/1000);
	this.status = 0;

};


Notice.factory = function( json ){
	// 在做数据修复之后 去掉 json.user || 后面的代码
	var notice = new Notice( json.type, json.from, json.to, json.where, json.what, json.response);
	notice.setId( json._id );
	notice.setStatus( json.status );

	return notice;

};

Notice.prototype = {

	// time 为标准时间错 / 1000
	setId:function( id ){
		this._id = id;
	},
	setTime:function( time ){
		this.time = time;
	},
	setFrom:function( from ){
		this.from = from;
	},
	setTo:function( to ){
		this.to = to;
	},
	setType:function( type ){
		this.type = type;
	},
	setStatus:function( status ){
		this.status = status;
	},
	setWhere:function( where ){
		this.where = where;
	},
	toJSON:function(){

		return {
			type:this.type,
			from:this.from,
			to:this.to,
			where:this.where,
			what:this.what,
			response:this.response,
			time:this.time,
			status:this.status
		};

	}
}


