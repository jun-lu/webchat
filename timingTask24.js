/**
	
	每天24时执行脚本
	此脚本用于关闭24小时内没有任何新对话的话题。

*/

var Promise = require("./lib/Promise")
var RoomModel = require("./lib/RoomModel");
var ChatModel = require("./lib/ChatModel");


var promise = new Promise();

//话题查询
promise.then(function(){

	RoomModel.find({status:1}, function( status ){

		if( status.code ==0 && status.result.length > 0 ){

			promise.ok( status );
		}


	});

});

//时间比较
promise.then(function( status ){

	var list = status.result;
	var i=0;
	var now = parseInt(Date.now()/1000);

	function start(){
		if(++i < list.length){
			compareTime( list[i].id )
		}else{
			console.log("完成");
		}
	}

	function compareTime( id ){
		//console.log(id)
		ChatModel.findOne({roomid:id, time:1}, function( status ){

			if( (status.code == 0 && 
				status.result && 
				status.result.time - now > 60*60*24) || 
				status.code == 404){
				//console.log("status", status);
				//console.log("roomid", id);
				//start();
				console.log("clsoe", id);
				RoomModel.update({id:id}, {status:0}, function(){
					start();
				});
			}else{
				start();
			}

		});
	}

	start();
});

promise.start();