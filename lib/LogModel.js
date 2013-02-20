/**

	只记录用户日志

	LogModel

		提供对 user 集合的操作

	
	webchat
		-user
			-- User.js
		-room
			-- 请参看ChatRoom类


	{
		_id:用户id
		do:
		time:

	}
*/

//var User = require('./User');
var DbModel = require('./DbModel');


exports = module.exports = LogModel;

function LogModel(){
	this.collection = "user_log";
};
//Object.create( events.EventEmitter )
LogModel.prototype = Object.create( DbModel.prototype );
LogModel.prototype.findLog = function( selecter ){

	var _this = this;
	//console.log("findLog", selecter, _this.collection);
    this.getDb().open(function (error, client) {
      if (error) throw error;

      var collection = client.collection( _this.collection );

      collection.find( selecter ).limit(100).sort({time:-1}).toArray(function(err , items ){
      		client.close();
			_this.emit( _this.onfind, err, items);
			
		});
    });
}

