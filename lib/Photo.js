/**
	
	描述一张照片
	
	图片属性
		1：描述
		2：创建者id
		3：创建时间
		4：所属相册id
		5：所属房间id
		

*/

function mix(a, b){
	for(var key in b){
		if( b.hasOwnProperty( key ) ){
			a[key] = b[key];
		}
	}
}
	

var Photo = module.exports = function( fileName, masterId, albumsId, options){
	
	this._id = null;//数据库id
	this.fileName = fileName;//存放文件名
	this.masterId = masterId;//上传者的id
	this.albumsId = albumsId;//属于某个相册
	this.originalName = "";//正常系统命名规则 | 原始文件名
	this.des = "";//string < 500 | 用户为图片添加的描述
	this.otherDes = "";//string < 500 | 选自照片中本身包含的信息，比如相机，拍照地点  不一定实现
	this.size = 0;
	this.time = parseInt( Date.now() / 1000 );//上传时间
	this.subdirectory = parseInt( Date.now()/360000/24 );
	this.features = {};
	// options 仅允许包含以上属性
	options && mix(this.features, options);
	
};


Photo.prototype = {
	constructor:Photo,
	
	getInfo:function(){
		return {
			_id:this.id,
			fileName:this.fileName,
			albumsId:this.albumsId,
			masterId:this.masterId,
			roomid:this.roomid,
			des:this.des,
			otherDes:this.otherDes,
			time:this.time,
			features:this.features
		};
	},
	toJSON:function(){
		return {
			_id:this.id,
			fileName:this.fileName,
			albumsId:this.albumsId,
			masterId:this.masterId,
			roomid:this.roomid,
			des:this.des,
			otherDes:this.otherDes,
			time:this.time,
			features:this.features
		};
	}
}
