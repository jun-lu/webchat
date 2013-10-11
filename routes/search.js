/**
	
	home
	
	首页
*/
var RoomModel = require("../lib/RoomModel");
var WebStatus = require("../lib/WebStatus");
var tools = require("../lib/tools");
var Room_PUBLIC_KEYS = require("../lib/Room").PUBLIC_KEYS;


module.exports = {

	get:function(req, res){

		var key = tools.trim(req.query.key);
		var user = req.session.user;

		var output = {
			user:user ? user.getInfo() : null,
			key:key,
			result:[]// 搜索结果
		};


		var reg = new RegExp( key, "i");

		RoomModel.opendb(function( collection, db ){
			collection.find( {status:1, "$or":[{topic:reg},{des:reg}]} ).limit(10).toArray(function(err, result){

				
				var webstatus = null;

				if( err ){
					webstatus =new WebStatus("601");
				}else{
					webstatus =new WebStatus("0").setResult( result || [] );
				}
				
				RoomModel.serialization( webstatus, function( status ){

					output.result = status.result;
					res.render("search", output);
				});

				


			});
		});		
		
	},
	post:null

};