

var PhotoModel = require("./lib/PhotoModel");
var UserModel = require("./lib/UserModel");

var url = "http://www.baidu.com/img/bdlogo.gif";

UserModel.find({avatar:/\w/}, function( status ){
	if(status.code == 0){
			for(var i=0; i<1; i++){//status.result.length
				updateUserAvatar(status.result[i])
			}
		}
});

function updateUserAvatar( user ){
	new PhotoModel().getNetworkImage(user.avatar, function( status ){
		if(status.code == 0){
			new PhotoModel().copyPhoto(status.result, null, {s_w:48, s_h:48, m_w:960, m_h:10000}, function( status ){
				console.log("status", status)
				if(status.code == 0){
					var path = status.result.getSmallPath("https://www.vchat.co/p/v/");
					console.log(path)
					setUserAvatar(user, path);
				}else{
					setUserAvatar(user, null)
				}
			})
		}else{
			setUserAvatar(user, null)
		}
	});
}

function setUserAvatar( user, path ){
	UserModel.update({_id:UserModel.objectId( user._id )}, {avatar:null}, function(){})
}