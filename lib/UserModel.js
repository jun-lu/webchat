/**

	UserModel

		提供对 user 集合的操作

	
	webchat
		-user
			-- User.js
		-room
			-- 请参看ChatRoom类
*/

var User = require('./User');
var WebStatus = require('./WebStatus');
var MongodbModel = require('./MongodbModel');
//var ObjectID = require('mongodb').ObjectID;


function UserModel(){
	this.collection = "user";
};

UserModel.prototype = Object.create( MongodbModel.prototype )


/**
	设置用户头像为一个网络头像
*/
UserModel.prototype.setAvatar = function(_id, avatar, callback){
	this.update({_id:this.objectId(_id)}, {avatar:avatar}, callback);
}
/** api */

/** 


	根据一个条件查询一个用户

 */
UserModel.prototype.inquire = function( selecter, callback){

	this.find( selecter, function( status ){

		if( status.code == "0" ){

			var list = [];
			var data = status.result;

			for(var i=0; i< data.length; i++){
				list.push( User.factory( data[i] ).getPublicInfo() );
			}

			status.setResult( list );

		}

		callback && callback( status );


	});

	/**

	var model = new UserModel();
	model.on( model.onfindOne, function(err, data){
		var status = new WebStatus();
		if( err ){
			status.setCode( "601" );
			status.setResult( err );
		}else{
			if( data == null ){
				status.setCode("404");
			}else{

				var list = [];

				for(var i=0; i< data.length; i++){
					list.push( User.factory( data[i] ).getPublicInfo() );
				}

				status.setResult( list );

			}
		}
		callback( status );
	});
	model.find( selecter );
	*/
};

UserModel.prototype.inquireOne = function( selecter, callback){

	this.findOne( selecter, function( status ){

		if( status.code == "0" ){
			status.setResult( User.factory( status.result ) );
		}

		callback && callback( status );
	});

	/**
	var model = new UserModel();
	model.on( model.onfindOne, function(err, data){
		var status = new WebStatus();
		if( err ){
			status.setCode( "601" );
			status.setResult( err );
		}else{
			if( data == null ){
				status.setCode("404");
			}else{
				status.setResult( User.factory(data) );

			}
		}
		callback( status );
	});
	model.findOne( selecter );
	*/
};



/**
	创建一个用户
	
	mail email / 匿名用户mail pwd都为数字
	pwd 密码
	name 用户名 / 匿名用户可为空

	return user
*/
UserModel.prototype.create = function( mail, pwd , name, callback){

	var user = new User( mail, User.toHex( pwd ) );
	user.setName( name );

	this.insert( user.toJSON(), function( status ){
		//console.log( status, "status" );
		if( status.code == "0" ){
			status.setResult( User.factory( status.result ) );
		}
		callback( status );	
	});

	/**

	var model = new UserModel();
	var user = new User( mail, User.toHex( pwd ) );
	user.setName( name );

	model.on( model.oninsert , function(err, data){

		var status = new WebStatus();

		status.setCode( err ? "601" : "0");
		status.setResult( err || User.factory( data ) );
		
		callback( status,  data);

	});


	model.insert( user.toJSON() );
	*/
};

/**

	通过 email 查找一个用户

	mail

	return user || null
*/

UserModel.prototype.emailFind = function( mail, callback){

	this.inquireOne( {mail:mail}, callback );

};

/** 
	通过email  和 密码查询一个用户
	mail
	pwd

	return user || null
 */

 UserModel.prototype.emailPwdFind = function(mail, pwd, callback){

 	this.inquireOne( {mail:mail, pwd:User.toHex(pwd) }, callback );

 };

 /***
	创建匿名用户

	return user
 */

 UserModel.prototype.createAnonymousUser = function( callback ){

 	var mail = String(Date.now());
 	var pwd = mail;
 	//console.log("createAnonymousUser", mail, pwd);
 	this.create( mail, pwd, "", callback );

 };

 /**
	hex验证用户

	hexMail
	hexPwd 
	hexRandom 
 */

 UserModel.prototype.hexFind = function(hexMail, hexPwd, hexRandom, callback){

 	this.inquireOne( {hexMail:hexMail, hexPwd:hexPwd, hexRandom:hexRandom }, callback );

 }

 UserModel.prototype.find_id = function( id , callback){

 	this.inquireOne( {_id:this.objectId(id)} , callback);
 }


 /** 
	修改用户名
 */

UserModel.prototype.updateName = function( id, newName, callback){

	this.update( {_id:this.objectId(id)}, {name:newName}, callback );

	/**

	var model = new UserModel();
	model.on( model.onupdate , function(err, data){

		var status = new WebStatus();

		status.setCode( err ? "601" : "0" );
		status.setResult( err || data );

		callback && callback( status );

	});
	model.update( {_id:new ObjectID(id)} ,  {name:newName});
	*/
};


 /** 
	修改用户的介绍
 */

UserModel.prototype.updateSummary = function( id, summary, callback){


	this.update( {_id:this.objectId(id)}, {summary:summary}, callback );
	/**

	var model = new UserModel();
	model.on( model.onupdate , function(err, data){

		var status = new WebStatus();

		status.setCode( err ? "601" : "0" );
		status.setResult( err || data );

		callback && callback( status );

	});
	model.update( {_id:new ObjectID(id)} ,  {summary:summary});
	*/
};


/**
	使用 email 和密码 登录 账户
	修改用户 email  pwd

	return user;
*/
UserModel.prototype.updateMailPwd = function(id, mail, pwd, callback){

	var hexMail = User.toHex( mail );
	var hexPwd = User.toHex( pwd );

	this.update( {_id:this.objectId(id)},   {mail:mail, pwd:hexPwd, hexMail:hexMail, hexPwd:hexPwd}, callback );
	/**
	var model = new UserModel();
	model.on( model.onupdate , function(err, data){

		//console.log(err, data);
		var status = new WebStatus();

		status.setCode( err ? "601" : "0" );
		status.setResult( err || data );

		callback && callback( status );

	});

	model.update( {_id:new ObjectID(id)} ,  {mail:mail, pwd:hexPwd, hexMail:hexMail, hexPwd:hexPwd});
	*/
};



/**
	修改用户头像的 gavatarDefault
*/
UserModel.prototype.updateGravatarDefault = function(id, gravatarDefault, callback){

	//如果参数不是可选值的一部分，将使用默认
	gravatarDefault = User.gravatarDefaultEnum[gravatarDefault] ||  User.gravatarDefaultEnum["default"];
	
	this.update( {_id:this.objectId(id)}, {gravatarDefault:gravatarDefault} , callback);

	/**
	var model = new UserModel();
	model.on( model.onupdate , function(err, data){

		//console.log(err, data);
		var status = new WebStatus();

		status.setCode( err ? "601" : "0" );
		status.setResult( err || data );

		callback && callback( status );

	});

	model.update( {_id:new ObjectID(id)} ,  {gravatarDefault:gravatarDefault});
	*/
};

/** 
	查询多个用户
*/
UserModel.prototype.getMultiple = function( ids, callback){

	for(var i=0; i<ids.length; i++){

		ids[i] = this.objectId(ids[i]);
	}


	this.inquire( {"_id":{"$in":ids}}, callback);
};

/**
	为用户添加一个房间的密码
*/

UserModel.prototype.addRoomPassword = function(id, roomid, password, callback){

	var $set = {};
	$set["passwords."+roomid] = password;

	this.update( {_id:this.objectId(id)}, $set, callback );
	
	/**
	var model = new UserModel();
	model.on( model.onupdate , function(err, data){

		//console.log(err, data);
		var status = new WebStatus();

		status.setCode( err ? "601" : "0" );
		status.setResult( err || data );

		callback && callback( status );

	});

	var $set = {};
	$set["passwords."+roomid] = password;

	model.update( {_id:new ObjectID(id)} ,  $set);
	*/

};

/** 
	为第3方登录创建登录
	oauth_options {openid,  access_token, expires_in}

 */
/**
 UserModel.prototype.createOauthUser = function( mail, name, pwd, oauth_options, callback ) {

 	var user = new User( mail, User.toHex( pwd ) );
	user.setName( name );
	user.setOauth( oauth_options.openid, oauth_options.access_token, oauth_options.expires_in, oauth_options );


 	this.insert( user.toJSON(), callback );

 	/**
 	var model = new UserModel();
	var user = new User( mail, User.toHex( pwd ) );
	user.setName( name );
	user.setOauth( oauth_options.openid, oauth_options.access_token, oauth_options.expires_in, oauth_options );

	model.on( model.oninsert , function(err, data){

		var status = new WebStatus();

		status.setCode( err ? "601" : "0");
		status.setResult( err || User.factory( data ) );
		
		callback( status,  data);

	});


	model.insert( user.toJSON() );
	
 }
 */

UserModel.prototype.createOauthUser = function( user, callback ) {


	this.insert( user.toJSON(), function( status ){
		
		status.setResult( User.factory( status.result ) );
		callback && callback( status ) 

	});


	/**
 	var model = new UserModel();
	
	model.on( model.oninsert , function(err, data){

		var status = new WebStatus();

		status.setCode( err ? "601" : "0");
		status.setResult( err || User.factory( data ) );
		
		callback( status,  data);

	});


	model.insert( user.toJSON() );
	*/
};

/**
	通过 from 和 openid 登录账户
*/

UserModel.prototype.findOauth = function(from, openid, callback){

	this.inquireOne( {"oauth.from":from, "oauth.openid":openid}, callback);
};


/**
	创建vchat.js用户


	uid --> mail
	server --> pwd

*/

UserModel.prototype.createVchatUser = function( uid, server, uname, uavatar, callback ) {

	var user = new User(uid, server);
		(uname != "匿名") && user.setGravatarDefault("wavatar");
		user.setName(uname || "匿名");
		if(uavatar){ 
			user.setAvatar( uavatar );
		}else{
			user.setGravatarDefault("wavatar");
		}
		user.oauth = {
			"form":server,
			"openid":uid
		};

	this.insert( user.toJSON(), function( status ){
		//console.log("install", status);
		status.setResult( User.factory( status.result ) );
		callback && callback( status ) 

	});

};

/**

	vchat.js登录用户
	
*/

UserModel.prototype.findVchatUser = function( uid, callback ){

	this.inquireOne( {"mail":uid, "oauth.openid":uid}, callback);

};


exports = module.exports = new UserModel;


