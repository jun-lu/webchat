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
var DbModel = require('./DbModel');


exports = module.exports = UserModel;

function UserModel(){
	this.collection = "user";
};

UserModel.prototype = Object.create( DbModel.prototype );



/** api */

/** 


	根据一个条件查询一个用户

 */


UserModel.inquire = function( selecter, callback){

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
};



/**
	创建一个用户
	
	mail
	pwd

	return user
*/
UserModel.create = function( mail, pwd , callback){

	var model = new UserModel();
	var user = new User( mail, User.toHex( pwd ) );

	model.on( model.oninsert , function(err, data){

		var status = new WebStatus();

		status.setCode( err ? "601" : "0");
		status.setResult( err || User.factory( data ) );
		
		callback( status,  data);

	});


	model.insert( user.toJSON() );

};

/**

	通过 email 查找一个用户

	mail

	return user || null
*/

UserModel.emailFind = function( mail, callback){

	this.inquire( {mail:mail}, callback );

};

/** 
	通过email  和 密码查询一个用户
	mail
	pwd

	return user || null
 */

 UserModel.emailPwdFind = function(mail, pwd, callback){

 	this.inquire( {mail:mail, pwd:User.toHex(pwd) }, callback );

 };

 /***
	创建匿名用户

	return user
 */

 UserModel.createAnonymousUser = function( callback ){

 	var mail = String(Date.now());
 	var pwd = mail;
 	//console.log("createAnonymousUser", mail, pwd);
 	this.create( mail, pwd, callback );

 };

 /**
	hex验证用户
	hexMail
	hexPwd 
	hexRandom 
 */

 UserModel.hexFind = function(hexMail, hexPwd, hexRandom, callback){

 	this.inquire( {hexMail:hexMail, hexPwd:hexPwd, hexRandom:hexRandom }, callback );

 }


 /** 
	修改用户名
 */

UserModel.updateName = function( id, newName, callback){

	var model = new UserModel();
	model.on( model.onupdate , function(err, data){

		var status = new WebStatus();

		status.setCode( err ? "601" : "0" );
		status.setResult( err || data );

		callback && callback( status );

	});
	model.update( {_id:Object(id)} ,  {name:newName});
};












