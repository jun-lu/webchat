/**
	
	chat
	
	对话页面
*/

var tools = require("../../lib/tools");
var UserModel = require("../../lib/UserModel");
var RoomModel = require('../../lib/RoomModel');
var ChatModel = require('../../lib/ChatModel');
var Promise = require('../../lib/Promise');
var LogModel = require('../../lib/LogModel');
var WebStatus = require('../../lib/WebStatus');



module.exports = {

		get:function(req, res){

			var user = req.session.user || null;
			var id = req.params.key;
			var status = new WebStatus();


			var output = {
				user:user ? user.getInfo() : user,
				contacts:[], //联系人名单
				joinTopics:[],
				tool:tools
			}


			if( user == null ){
				res.redirect('/login');
				return false;
			}


			var promise = new Promise();


			promise.then(function () {

				LogModel.getLog( String(user._id), 100, function( status  ){
					var log = {};
					var joins = [];
					if(status.code == "0"){
						var logs = status.result;
						for(var i=0; i< logs.length; i++){

							if(log[logs[i].info.id] == undefined){
								log[logs[i].info.id] = 1;//logs[i].info;
								joins.push( logs[i].info );
							}
						}
						output.joinTopics = joins;
					}

					promise.ok();
				} );

				/**
				LogModel.inquire({"$or":[{id:user._id, location:"into_room"},{id:user._id, location:"create_room"}]}, 1000, function( status ) {
					//console.log("status", status);
					if( status.code == 0 ){

						var list = tools.unique( status.result, function( a ) {	
							console.log( "id:",a.id )
							return a.id;
						});

						for(var i=0; i< list.length; i++){
							output.joinTopics.push( list[i].info );
						}

					}
					promise.ok();	
				});
				*/
			});

			promise.then(function() {
				//res.write(JSON.stringify( output,"", "  "));
				//res.end();
				res.render("user/home", output);
			});


			promise.start();
		},

		
		post:function( req, res ){

		}


};