
/**
	module
	photoIndex
*/

var fs = require("fs");
var tools = require("../../lib/tools");
var WebStatus = require("../../lib/WebStatus");
var Promise = require("../../lib/Promise");
var Albums = require("../../lib/Albums.js");
var Photo = require("../../lib/Photo");
var Pagination = require("../../lib/Pagination");
var AlbumsModel = require("../../lib/AlbumsModel.js");
var RoomModel = require("../../lib/RoomModel");
var albumsModel = new AlbumsModel();

var PhotoModel = require("../../lib/PhotoModel.js");
var photoModel = new PhotoModel();

module.exports = {
	
	//相册照片列表	
	view:function( req, res ){
		
		var user = req.session.user;
		
		var output = {
			user:user ? user.getInfo() : null,
			albums:null,
			photos:[],
			pagination: ""
		};
		
		
		var _id = req.params.albums;
		var page = parseInt(req.params.page) || 1;
		var photoMaxNumber = 20;
		
		var promise = new Promise();
		
		promise.add(function(){
			albumsModel.findOne({_id:albumsModel.objectId(_id)}, function( status ){
				if(status.code == "0" && status.result){
					output.albums = status.result;
					promise.resolve( _id );
					//res.render('./p/albums', output);
				}else{
					res.render("./404", new WebStatus("404").setMsg("没有找到相册").toJSON());
				}
			});	
		});
		
		
		promise.then(function( albumsId ){
			//console.log("skip->>", page * photoMaxNumber, page-1 * photoMaxNumber);
			photoModel.findLimitSkipSort({albumsId:albumsId}, photoMaxNumber, (page-1) * photoMaxNumber, {_id:-1}, function( status ){
				if(status.code == "0" && status.result){
					var photos = [];
					for(var i=0; i<status.result.length; i++){
						photos.push( new Photo(null, null, null, null, status.result[i]).getInfo() );
					};
					
					output.photos = photos;
				}
				promise.resolve();
			});	
		});
		
		promise.then(function(){

			//console.log("page ->>",page, Math.ceil(output.albums.photoCount/photoMaxNumber) || 1);	
			output.pagination = new Pagination(page, Math.ceil(output.albums.photoCount/photoMaxNumber) || 1, "/p/r/"+_id+"/").getHTML();
			
			res.render('./p/albums', output);
		});
		
		
		promise.start();

	},
	createView:function( req, res ){
		
		var user = req.session.user;
		var output = {
			user:user ? user.getInfo() : null,
			defaultAlbumsName:"",
			room:null
		};
		var roomid = req.params.roomid;

		output.defaultAlbumsName = tools.format(Date.now(), "yyyy-MM-dd");

		RoomModel.idFind( roomid, function( status ){

			if( status.code == "0" ){

				output.room = status.result;
				res.render('./p/create-albums', output);

			}else{
				res.status("404").render("error", status.setMsg("URL 不正确"));
			}

		});

		//res.render('./p/create-albums');
		
	},
	create:function(req, res){
		
		var user = req.session.user;
		
		var status = new WebStatus();
		var output = {
			user:user ? user.getInfo() : null
		};
		
		var name = tools.trim(req.body.name);
		var des = req.body.des;
		var permissions = parseInt(req.body.permissions);
		var roomId = req.body.roomId || null;
		
		if(!(name && name.length >0 && name.length < 50)){
			status.setCode("-1");
			status.setMsg("相册名在1-50之间");
			res.write( status.toString() );
			res.end();
			return false;
		};
		
		if(!(des.length==0 || des.length < 50)){
			status.setCode("-1");
			status.setMsg("相册描述在0-500之间");
			res.write( status.toString() );
			res.end();
			return false;
		}
		
		if(!(permissions == 0 || permissions == 1)){
			status.setCode("-1");
			status.setMsg("权限只能是0或1");
			res.write( status.toString() );
			res.end();
			return false;
		}
		
		
		var albums = new Albums(name , user._id, roomId, des, permissions, {});
		albumsModel.insert( albums, function( status ){
			//console.log("status",status);
			if(status.code == "0"){
				res.redirect('/p/r/'+ status.result._id+'/page/1' );
			}else{
				res.write(status.toString());
				res.end();
			}
		});
		
	}

}
