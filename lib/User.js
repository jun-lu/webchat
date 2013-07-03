/*
	User

	描述一个用户
	
	email 邮箱地址
	pwd 密码 请先执行MD5

	name:， 未设置 为空


	重新设置密码 修改hexPwd
	user 登录一次 修改 hexRandom
*/
var crypto = require('crypto');
var tool = require('./tools');
exports = module.exports = User;

function User(mail, pwd){

	this._id = null; //数据库id
	this.mail = mail; //mail
	this.pwd = pwd; //pwd

	this.hexMail = null;
	this.hexPwd = null;
	this.hexRandom = null;
	this.avatar = null;
	//
	/**
		gravatar网站的d参数
		允许的值
		"mm", "identicon", "monsterid", "wavatar", "retro", "blank"
	*/
	this.gravatarDefault = User.gravatarDefaultEnum["default"];

	this.name = "";

	this.time = Date.now();
	this.summary = "";
	//保存永固去过的房间的密码
	this.passwords = {};

	//OAuth 如果用户使用第3方登录 那么这里保存登录信息
	this.oauth = null;

	
	/**
		{

			"from":"sina",// sina qq douban
			openid: //开放ID
			[openkey]: //验证id的key  腾讯会提供1 sina不提供
			access_token:
			expires_in: //过期时间秒
			time://上次登录 时间
		}
	*/

};

//pwd所使用的hex
User.toHex = function( str ){

	var md5 = crypto.createHash('md5');
	md5.update( str );
	return md5.digest( 'hex' ) 

};
//创建一个随即用户
User.factoryRandom = function(){
	var mail = Date.now() + parseInt((Math.random() * 100)) + "";
	var pwd = Date.now() + parseInt((Math.random() * 100)) + "";
	return new User(mail, pwd);

};
User.factory = function( json ){

	var user = new User(json.mail, json.pwd);
	user.setid( json._id );
	user.setName( json.name );
	user.setPwd( json.pwd );
	user.setHex( json.hexMail, json.hexPwd, json.hexRandom );
	user.setGravatarDefault( json.gravatarDefault );
	user.setPasswords( json.passwords || {} );
	user.setTime( json.time );
	user.setSummary( json.summary );
	user.setOauth( json.openid, json.access_token, json.expires_in, json.oauth );
	user.setAvatar( json.avatar );
	return user;

};
//mm", "identicon", "monsterid", "wavatar", "retro", "blank"
User.gravatarDefaultEnum = {
	"default":"mm",
	"mm":"mm",
	"identicon":"identicon", 
	"monsterid":"monsterid", 
	"wavatar":"wavatar", 
	"retro":"retro", 
	"blank":"blank"
};

//检查是否一个合法的用户email
User.checkMail = function( mail ){

	return /^[\w._\-]+@[\w_\-]+\.\w+$/.test( mail );
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
	setTime:function( time ){
		this.time = time;
	},
	setSummary:function( summary ){
		this.summary = summary || "";
	},
	setAvatar:function( avatar ){
		this.avatar = avatar;
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
	// size d
	getGravatar:function( s, d ){

		//其他平台用户直接保存了 avatar
		if(this.avatar){
			return this.avatar;
		}

		s = s || 48;
		d = d || this.gravatarDefault;

		return "http://www.gravatar.com/avatar/"+this.hexMail+".jpg?s="+s+"&d="+d+"&r=g";
	},
	setGravatarDefault:function( d ){

		this.gravatarDefault = User.gravatarDefaultEnum[d] || User.gravatarDefaultEnum["default"];
	},
	setPasswords:function( passwords ){
		this.passwords = passwords;
	},
	// options 提供特别的数据，各家不一样
	setOauth:function( openid,  access_token, expires_in, options){

		this.oauth = {
			openid:openid,
			access_token:access_token,
			expires_in:expires_in,
			time:parseInt(Date.now()/1000)
		};

		if( options ){
			tool.mix( this.oauth, options );
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
	getRoomPasswrod:function( roomid ){

		return this.passwords[roomid];

	},
	isRoomPasswrod:function( roomid, pwd ){
		return this.getRoomPasswrod( roomid ) === pwd;
	},
	//数据库信息
	toJSON:function(){

		return {
			mail:this.mail,
			pwd:this.pwd,
			name:this.name,
			avatar:this.avatar,
			gravatarDefault:this.gravatarDefault,
			hexMail: this.HexMail || this.getHexMail(),
			hexPwd: this.HexPwd || this.getHexPwd(),
			hexRandom: this.hexRandom || this.getHexRandom(),
			passwords:this.passwords,
			time:this.time,
			summary:this.summary,
			oauth:this.oauth
		};

	},
	//自己可见的信息
	getInfo:function(){

		var json = {
			_id:this._id,//数据库id
			mail:this.mail,
			name:this.name,
			hexMail:this.hexMail || this.getHexMail(),
			gravatarDefault:this.gravatarDefault,
			avatar:this.getGravatar(),
			time:this.time,
			summary:this.summary
		};

		if(this.oauth){

			json.oauth = {
				openid:this.oauth.openid,
				time:this.oauth.time
			};
		}

		return json;

	},
	//所有人可见的信息
	getPublicInfo:function( size ){
		return {
			_id:this._id,//数据库id
			//mail:this.mail,
			name:this.name,
			hexMail:this.hexMail || this.getHexMail(),
			//gravatarDefault:this.gravatarDefault,
			avatar:this.getGravatar(size || 170),
			time:this.time,
			summary:this.summary
		};
	},
	toCookie:function(){

		return (this.hexMail || this.getHexMail()) + "|" 
		+ (this.hexPwd || this.getHexPwd()) + "|" 
		+ (this.hexRandom || this.getHexRandom());

	}
};

