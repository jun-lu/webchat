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
	

var Photo = module.exports = function( fileName, format, masterId, albumsId, options){
	
	this._id = null;//数据库id
	this.fileName = fileName;//存放文件名
	this.masterId = masterId;//上传者的id
	this.albumsId = albumsId;//属于某个相册
	this.format = format;
	this.originalName = "";//正常系统命名规则 | 原始文件名
	this.des = "";//string < 500 | 用户为图片添加的描述
	this.otherDes = "";//string < 500 | 选自照片中本身包含的信息，比如相机，拍照地点  不一定实现
	this.size = 0;
	this.time = parseInt( Date.now() / 1000 );//上传时间
	this.subdirectory = parseInt( Date.now()/3600000/24 );
	this.features = {};

	this.s_w = 0; //小土大小
	this.s_h = 0;

	this.width = 0;//原图
	this.height = 0;

	this.m_w = 0;//缩放以后的图片大小，也是网页上使用的大小
	this.m_h = 0;

	// options 仅允许包含以上属性
	options && mix(this, options);
	
};


Photo.prototype = {
	constructor:Photo,
	
	setFormat:function( format ){

		this.format = format;
	},
	getPath:function( root ){

		root = root || "";
		return root + this.subdirectory+"/"+this._id+this.format;

	},
	getSmallPath:function( root ){
		root = root || "";
		return root + this.subdirectory+"/"+this._id+"_s"+this.format;
	},
	getModeratePath:function( root ){
		root = root || "";
		return root + this.subdirectory+"/"+this._id+"_m"+this.format;
	},
	getInfo:function(){
		return {
			_id:this._id,
			fileName:this.fileName,
			albumsId:this.albumsId,
			masterId:this.masterId,
			roomid:this.roomid,
			des:this.des,
			format:this.format,
			path:this.getPath(),
			path_s:this.getSmallPath(),
			path_m:this.getModeratePath(),
			time:this.time,
			s_w:this.s_w, //小土大小
			s_h:this.s_h,

			width:this.width,//原图
			height:this.height,

			m_w:this.m_w,//缩放以后的图片大小，也是网页上使用的大小
			m_h:this.m_h,

			features:this.features
		};
	}
}
