
/**
	
	描述一个相册
		1.描述 des
		2.创建者
		3.创建时间
		4.相册名 name
		5.房间归宿(房间id) roomid
		6.权限（公开1，房间所有权限2，个人所有权限3） Permissions
			0 完全公开 
				所有注册用户可上传照片
				创建者有删除照片权限
				创建者可修改相册信息
				
			1 半公开   ?
			2 房间所有权 ? 
			3 个人所有权 
				自己可以上传
		
*/


var Albums = module.exports = function( name , masterId, des, permissions, options){
	
	this.name = name;// string < 100
	this.masterId = masterId;
	this.des = des;// string < 500
	this.permissions = 0;//number 0 完全公开 1 半公开 2 房间所有权 3个人所有权
	this.time = parseInt( Date.now() / 1000 );
	this.facePhoto = null;//封面
};

Albums.prototype = {
	construcotr:Albums,
	getInfo:function(){
		
		return {
			name:this.name,
			masterId:this.masterId,
			des:this.des,
			permissions:this.permissions,
			facePhoto:this.facePhoto,
			time:this.time
		};
		
	},
	toJSON:function(){
	
		return {
			name:this.name,
			masterId:this.masterId,
			des:this.des,
			permissions:this.permissions,
			facePhoto:this.facePhoto,
			time:this.time
		};
	}
}