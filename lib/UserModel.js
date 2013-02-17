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
var DbModel = require('./DbModel');


exports = module.exports = UserModel;

function UserModel(){
	this.collection = "user";
};
//Object.create( events.EventEmitter )
UserModel.prototype = Object.create( DbModel.prototype );
UserModel.prototype.create = function( user ){

	this.insert( user.toJSON() );

};
UserModel.prototype.checkEmail = function( mail ){

	this.findOne({mail:mail});
};
