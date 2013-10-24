/*
	
	detail 一个post的详细信息
	
*/

var tools = require("../../lib/tools");
var RoomModel = require('../../lib/RoomModel');
var ChatModel = require('../../lib/ChatModel');
var WebStatus = require('../../lib/WebStatus');
var Promise = require("../../lib/Promise");
var NoticeModel = require("../../lib/NoticeModel");


module.exports = {

		get:function(req, res){

			//console.log(111);
			var user = req.session.user || null;
			var _id = req.params._id;
			var noticeid = req.query.noticeid;
			var output = {
				tool:tools,
				user:user ? user.getInfo() : null,
				data:null,
				room:null
			};
			

			var promise = new Promise( req, res);

			promise.then(function(){

				if( !_id  || tools.trim(_id).length != 24){
					res.status(404).render("404", new WebStatus("404") );
					return ;
				};
				promise.ok();

			});

			//要查询的信息
			promise.then(function(){

				//var _this = this;
				ChatModel.findChatOne(_id, function( status ){

					//console.log( "status", status );
					if( status.code == "0" && status.result){
						output.data = status.result;
						promise.ok( status.result.roomid );
						//getRoom( status.result.roomid );
					}else{
						status.setMsg("没有发现你要找的信息");
						res.status(404).render("404", status );
					}

					

				});

			});


			//获取当前信息的房间信息
			promise.then(function( roomid ){
				
				//var _this = this;
				//console.log( roomid );	
				RoomModel.idFind( roomid, function( status ){

					if( status.code == "0" ){

						output.room = status.result;

						promise.ok();

					}else{
						status.setMsg("对话已经被删除，此信息无法查看！");
						res.status(404).render("error", status );
					}

				});


			});

			//获取针对此post的其他回复
			promise.add(function(){

				//var _this = this;
				ChatModel.findReply(_id, function( status ){

					if(status.code == "0" && status.result.length ){
						ChatModel.serialization( status, function( status ){

							if( status.code == "0" ){
								output.list = status.result;
							}else{
								output.list = [];
							}
							promise.ok();
						});
					}else{
						output.list = [];
						promise.ok();
					}

				});

			});

			//页面输出
			promise.then(function(){

				//console.log("output",output);
				res.render("d/detail", output);
				promise.ok();

			});

			//如果本条信息有针对我的提醒，则标记为已读
			promise.add(function(){
				if(String(noticeid).length == 24){
					NoticeModel.updateStatus(noticeid, 2, function(){});
				};
			});

			//开始
			promise.start();


		}
};