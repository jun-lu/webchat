/**
	
	home
	
	首页
*/
var RoomModel = require("../lib/RoomModel");
var tools = require("../lib/tools");
var Room_PUBLIC_KEYS = require("../lib/Room").PUBLIC_KEYS;


module.exports = {

	get:function(req, res){

		var key = String(req.query.key);
		var user = req.session.user;

		var output = {
			user:user ? user.getInfo() : null,
			result:[]// 搜索结果
		};


		var reg = new RegExp( key, "i");

		RoomModel.opendb(function( collection, db ){
			collection.find( {status:1, "$or":[{topic:reg},{des:reg}]}, Room_PUBLIC_KEYS).limit(10).toArray(function(err, result){

				
				var webstatus = null;

				if( err ){
					webstatus =new WebStatus("601");
				}else{
					//webstatus = new WebStatus().setResult(result || []);
					output.result = result;
				}

				//res.write( JSON.stringify( output ), "", "  " );
				//res.end();
				//res.render("search", output);


			});
		});		
		
	},
	post:null

};