/**
	
	home
	
	首页
*/
var LogModel = require("../../lib/LogModel");
var RoomModel = require("../../lib/RoomModel");
var tool = require("../../lib/tools");

module.exports = function(req, res){

	var user = req.session.user;
	var querySuccess = 0;
	var log = {};
	var newRoom = [];
	var recommendRooms = [];
	var recommendOne = null;
	var roomids = recommendRoom;
    user = user ? user.getInfo() : user;
    //最新的对话
    RoomModel.findNewRoom(5, function( status ){
    	if(status.code == 0){
    		newRoom = status.result;
    	}
    	success();
    });
    //推荐的对话
    RoomModel.querys({"id":{"$in":roomids}}, function( status ){
    	if(status.code == 0){
    		recommendOne = status.result[ parseInt(Math.random() * (status.result.length-1)) ];
    		status.result.sort(function(){ return Math.random() - 0.5; })
    		recommendRooms = status.result.slice(0, 5);
    	}
    	success();
    });

    //我刚刚去过的地方
	if( user ){
		//我最近去过的地方
		LogModel.getLog( String(user._id), 100, function( status  ){

			if(status.code == "0"){
				var logs = status.result;
				for(var i=0; i< logs.length; i++){

					if(log[logs[i].info.id] == undefined){
						log[logs[i].info.id] = logs[i].info;
					}
				}
			}

			//res.render('index', {user:user, log:log});
			success();
		} );
		return ;
	}

	success();

	function success(){
		querySuccess++
		if(querySuccess >= 3){
			//console.log( newRoom );
			res.render('index', {user:user, log:log, newRoom:newRoom,recommendRooms:recommendRooms, recommendOne:recommendOne, tool:tool});
		}

	}
	//console.log("index user", user );
	

}