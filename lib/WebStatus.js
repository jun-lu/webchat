/**

	WebError

	描述错误
*/


exports = module.exports = WebStatus;

var STATUS = {
	"0":"正确执行",
	"-1":"参数错误",	
	"500":"服务器错误",
	"600":"数据库错误",
	"601":"数据库写入错误",
	"602":"数据库查询错误",

};

function WebStatus( code ){

	this.init( code );
};
WebStatus.prototype.constructor = WebStatus;

WebStatus.prototype.init = function( code ){

	code = code === undefined ? 0 : code;
	this.code = code;

	this.msg = STATUS[code] || "未知错误定义";

};


WebStatus.prototype.setCode = function( code  ) { 
	this.init( code );
};

WebStatus.prototype.addMsg = function( msg ){

	this.msg += msg;
};

WebStatus.prototype.setMsg = function( msg ){

	this.msg = msg;

},

WebStatus.prototype.toJSON = function(){
	return {

		code : this.code,
		msg: this.msg

	};
};
WebStatus.prototype.toString = function(){
	return JSON.stringify( this.toJSON );
};


