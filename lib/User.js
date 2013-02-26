/*
	User

	描述一个用户
	
	email 邮箱地址
	pwd 密码 请先执行MD5

	name:， 未设置 为空


	重新设置密码 修改hexPwd
	user 登陆一次 修改 hexRandom
*/
var crypto = require('crypto');

exports = module.exports = User;

function User(mail, pwd){

	this._id = null;
	this.mail = mail;
	this.pwd = pwd;

	this.hexMail = null;
	this.hexPwd = null;
	this.hexRandom = null;

	this.name = "";

};

//pwd所使用的hex
User.toHex = function( str ){

	var md5 = crypto.createHash('md5');
	md5.update( str );
	return md5.digest( 'hex' ) 

};
User.factory = function( json ){

	var user = new User(json.mail, json.pwd);
	user.setid( json._id );
	user.setName( json.name );
	user.setPwd( json.pwd );
	user.setHex( json.hexMail, json.hexPwd, json.hexRandom );
	return user;

};

User.prototype = {

	constructor:User,
	setid:function( id ){

		this._id = String(id);
	},
	setMail:function( topic ){
		this.mail = mail;
	},
	setPwd:function( pwd ){

		this.pwd = pwd;
	},
	setName:function( name ){
		this.name = name;
	},
	setHex:function(hexMail, hexPwd, hexRandom){

		this.hexMail = hexMail;
		this.hexPwd = hexPwd;
		this.hexRandom = hexRandom;

	},
	toJSON:function(){

		return {
			mail:this.mail,
			pwd:this.pwd,
			name:this.name,
			hexMail: this.HexMail || this.getHexMail(),
			hexPwd: this.HexPwd || this.getHexPwd(),
			hexRandom: this.hexRandom || this.getHexRandom()
		};

	},
	//获取基本信息
	getInfo:function(){

		return {
			_id:this._id,//数据库id
			mail:this.mail,
			name:this.name,
		};

	},
	loginSelecter:function(){

		return {
			mail:this.mail,
			pwd:this.pwd
		};

	},
	cookieSelecter:function(){

		return {
			hexMail: this.HexMail,
			hexPwd: this.HexPwd,
			hexRandom: this.hexRandom
		}
	},
	getHexMail:function(){

		var md5 = crypto.createHash('md5');
		md5.update( this.mail );
		this.HexMail = md5.digest( 'hex' );

		return this.HexMail 

	},
	getHexPwd:function(){

		var md5 = crypto.createHash('md5');
		md5.update( this.pwd );
		this.HexPwd = md5.digest( 'hex' );

		return this.HexPwd;

	},
	getHexRandom:function(){

		var md5 = crypto.createHash('md5');
		md5.update( String(parseInt( Math.random() * 1000 )) );
		this.hexRandom = md5.digest( 'hex' );

		return this.hexRandom;
	},
	toCookie:function(){

		return (this.hexMail || this.getHexMail()) + "|" 
		+ (this.hexPwd || this.getHexPwd()) + "|" 
		+ (this.hexRandom || this.getHexRandom());

	}
};

