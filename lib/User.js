/*
	User

	描述一个用户
	
	email 邮箱地址
	pwd 密码 请先执行MD5

	name:， 为设置为空


*/
var crypto = require('crypto');

exports = module.exports = User;

function User(mail, pwd){

	this.mail = mail;
	this.pwd = pwd;

	this.hexMail = null;
	this.hexPwd = null;
	this.hexRandom = null;

	this.name = "";

};

User.factory = function( json ){

	var user = new User(json.mail, json.pwd);
	user.setName( json.name );
	user.setPwd( json.pwd );
	user.setHex( json.hexMail, json.hexPwd, json.hexRandom );
	return user;

};

User.prototype = {

	constructor:User,
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

		this.hexMail = null;
		this.hexPwd = null;
		this.hexRandom = null;

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
	loginSelecter:function(){

		return {
			mail:this.mail,
			pwd:this.pwd
		};

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
		md5.update( parseInt( Math.random() * 1000 ) );
		this.hexRandom = md5.digest( 'hex' );

		return this.hexRandom;
	},
	toCookie:function(){

		return hexMail + hexPwd ;

	}
};

