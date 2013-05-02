/*
	
	detail 一个post的详细信息
	
*/

var config = require("../../config");
var tools = require("../../lib/tools");
var UserModel = require("../../lib/UserModel");
var RoomModel = require('../../lib/RoomModel');
var ChatModel = require('../../lib/ChatModel');
var LogModel = require('../../lib/LogModel');
var WebStatus = require('../../lib/WebStatus');
var socketServer = require('../../lib/socketServer');
var Promise = require("../../lib/Promise");
var roomLimit = require("../sys/room_limit");
var NoticeModel = require("../lib/NoticeModel");

//http://www.renren.com/338096010

module.exports = {

		get:function(req, res){

			//console.log(111);
			var user = req.session.user || null;
			var _id = req.params._id;
			var noticeid = req.query.noticeid;
			/**
				output:{
					data:Chat,
					list:[Chat,....],
					room:Room,


				}
			*/

			var output = {
				tool:tools,
				user:user,
				room:null
			};
			

			var promise = new Promise( req, res);

			promise.then(function(){

				if( !_id  || tools.trim(_id).length != 24){
					res.status(404).render("404", new WebStatus("404") );
					return ;
				};
				this.resolve();

			});

			//要查询的信息
			promise.then(function(){

				//var _this = this;
				ChatModel.findOne(_id, function( status ){

					if( status.code == "0" ){
						output.data = status.result;
						promise.resolve( status.result.roomid );
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

						promise.resolve();

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
							promise.resolve();
						});
					}else{
						output.list = [];
						promise.resolve();
					}

				});

			});

			//页面输出
			promise.then(function(){

				//console.log(1);
				res.render("d/detail", output);
				promise.resolve();

			});

			promise.add(function(){
				if(String(noticeid).length == 24){
					NoticeModel.updateStatus(noticeid, 2);
				};
			});

			//开始
			promise.start();


		}
};