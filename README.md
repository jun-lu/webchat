#配置
	1:下载安装node
	2:克隆 webchat 项目
	3:安装项目的所有中间件(使用npm install完成)
		
	4:创建配置文件 config.js
		
		全局安装fis
		npm install -g fis

		运行
		fis.sh  
		完成以后到  ../online-webchat  下运行 node app.js
		 
	/** config.js */

````javascript
module.exports = {
	
	/**
		database ip
		10.6.0.27
		128.0.0.1
	*/
	dbs:[
        {
            ip:"127.0.0.1",
            port:27017

        }
    ],
	
	/**
		database port
	*/
	port:27017,
	
	/**
		database name
	*/
	dbname:"webchat",
	
	/**
		http server port
	*/
    httpPort:80,
    httpsPort:443,
	
	/**
		cookie domain
	*/
    domain:".vchat.com",
	/**
		photo upload
	*/
	//uploadDir:"d:/github/upload/",
	uploadDir:"/Users/jun/github/upload/",

	/**
		系统保留的子域
	*/
	sysWord: "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,0,1,2,3,4,5,6,7,8,9,sys,m,user,tmpl,images,image".split(","),

	socketHost:"ws://vchat.com/sys/chat-server",
	/**
		推荐的房间
	*/
	recommendRooms:["1365651264385","1361458149047","1361182575505"]
	

};
````
	内存  free -m  磁盘 df -h  top

#2013/06/14 的想法
	
	即时的语音对话
	
#新页面设计
	对话页面
		当前对话信息展示，在线用户，历史在线，主题信息
		发布框
		多人对话
		单独对话
		视频和语音扩展
		
		

#2013/07/01 vchat.js
	
	vchat.js 插件
	让所有网站在线用户拥有即时对话功能。


	__vchat_setting = {

		server:document.domain,

		uid: String //每个用户唯一，并且保证不会被冒用
		uname: String //用户名
		uavatar: String URL

	}	




#加入 来往纪录 contact
	如果你针对某个人回复，则他会在你的来往纪录中出现，在你邀请、@ 的时候这个纪录将作为你的潜在联系对象。


#定义数据体

####用户定义 User
````javascript
{
	"_id":"514197562128205e66000011",
	"mail":"idche@qq.com",// 匿名用户的email为一串数字
	"name":"lujun",
	"hexMail":"", // 用户email md5值，也作为头像的网址使用
	"gravatarDefualt":"monsterid",
	"avatar":"http://www.gravatar.com/avatar/d437481aad048f1cb9ff68483c662bae.jpg?s=48&d=monsterid"
	"time": 时间戳/1000 //用户创建时间
}
````

####房间定义 Room
````javascript
{
	"id":"1361182575505",//可作为 vchat/id 直接访问房间
	"name":"vchat",//可作为 vchat/name 直接访问房间
	"topic":"vchat开发测试",
	"des":"主题说明文字",
	"masterId":"514197562128205e66000011",//创建者 _id
	"masterName":"lujun", //创建者用户名 （启用）
	"master":User//这里只展现了user的公用信息
}
````


####对话定义 Chat (已经过期)
````javascript
{
	_id:"51419a0c2128205e66000024", //数据库唯一 _id
	roomdid: "1361182575505",  //房间 _id
	uid: "514197562128205e66000011", //用户 _id
	uname: "lujun", //用户昵称
	uavatar: "http://www.gravatar.com/avatar/d437481aad048f1cb9ff68483c662bae.jpg?s=48&d=monsterid",
			 // 用户头像地址  遵循 gravatar 网站头像规则
	time: 1363252238, //时间戳/1000
	to:(null || Chat) //如果是回应某个对话有此项目
}
````


####对话定义 Chat
````javascript
{
	_id:"51419a0c2128205e66000024", //数据库唯一 _id
	roomdid: "1361182575505",  //房间 _id
	to:User || "*", 如果是两人对话则为User对象，否则为 "*"
	time: 1363252238, //时间戳/1000
	from: User 发送者,
	aim:"51419a0c2128205e660000xx" || null  针对某条信息的回复 
}
````


####提醒 Notice
````javascript
{
	_id:"51419a0c2128205e66000024", //数据库唯一 _id
	type:1// 1对话中回复（回复方式） 2对话中提到（@方式） 3邀请加入对话
	form:User, //来自
	to:User._id, //  接收用户的id
	where:Room, //根据type会返回不同的对象
	what:Chat _id, // 数据库id
	response:Chat _id //数据库ID
	status:0 // 0未知晓  1已知晓  2已读（0，1都是未读状态，区别在于用户是否知晓）
	time:1363252238// 消息发生时间 时间戳/1000
}
````


####图册 Albums
````javascript
{

	_id: Objectid,// 数据库id
	name: name, // string < 100
	masterId : ObjectId, //所属用户id
	roomId: ObjectId, //所属对话
	des : string,// string < 500
	permissions : 0,//number 0 完全公开 1 半公开 2 房间所有权 3个人所有权
	time : parseInt( Date.now() / 1000 ),
	facePhoto : null,//封面 一个图片地址
	photoCount : 0 //图片数量
}
````

####图片 Photos
````javascript
{

	_id : null,//数据库id
	fileName : fileName,//原始文件名
	masterId : masterId,//上传者的id
	albumsId : albumsId,//属于某个相册
	format : format, //图片格式 jpg  bmp  gif ...
	des : string,//string < 500 | 用户为图片添加的描述
	size : 0,//图片大小
	time : parseInt( Date.now() / 1000 );//上传时间
	subdirectory : parseInt( Date.now()/3600000/24 ),// 物理路劲
	features : {} //图片的其他信息
}
````

####联系 Contact
````
{
	_id:"",
	sid:"", //记录人 id  send user id
	aid:"", //对方 id  accept user id
	thermograph:Number, //温度计
	time: parseInt( Date.now() / 1000 )
}
````

####定义接口返回值  return
````javascript
{
	/**
		code:"msg"
		"0":"正确执行",
		"-1":"参数错误",	
		"-2":"信息重复",
		"500":"服务器错误",
		"600":"数据库错误",
		"601":"数据库错误",
		"403":"Client Access Licenses exceeded（超出客户访问许可证）",
		"404":"not defined",
	*/
	code:0, //代码执行状态  非 0 状态表示非正确执行
	msg: "", //除以上常用状态码文字，其他状态会有更具体说明
	/**
		当 code == 0  result值 可用
		数组 [1,2,3,4,...], 空 -> []
		对象 {a:,b:,c} , 空 -> null
		无返回值 null
	*/
	result: //返回数据
}
````




#api 文档 仅ajax

####发送一条信息（1）
````javascript
url: "/sys/post"
method: post
param:
	roomid:number // 房间id
	text:string < 2000
	[aim]:string //回应某条信息的 _id
return:{
	code:0,
	msg:"正确",
	result:Chat
}
````
####修改昵称（2）
````javascript
url: "/sys/user-name-update"
method: post
param:
	name: string < 50
return :{
	code:0, //(0, -1),
	msg:"" //(正确,参数错误),
	result:null
}
````

####匿名用户绑定email（3）
````javascript
url: "/api/user-mail-set"
method: post
param:
	mail: string //合法的email地址
	pwd: string > 5
return :{
	code:0, //(0, -1, 403),
	msg:"" //(正确, 参数错误, 超出访问权限(已经绑定过了)),
	result:null
}
````

##修改房间信息，仅房间创建者可修改（4）
````javascript
url: "/api/room-update"
method:post
param:
	name: string < 50
	topic: string < 500,
	des: string < 2000,
	[password]: string < 30
return:{
	code:0, //(0, -1, 403),
	msg:"", //(正确, 参数错误, 超出访问权限(没有权限修改)),
	result:null
}
````

####根据时间获取房间对话（5）
````javascript
url: "/api/room-chat-get"
method:get
param:
	roomid:"1361182575505" //房间id
	/**
		小于此时间戳的最近 size 条信息
		可以使用未来时间戳获取最新的10条
	*/
	time:"时间戳"/1000 
	[size]:10 //默认10条
return:{
	code:0,
	msg:"正确执行",
	result:[Chat,Chat,Chat,.......]
}
````

####获取我参与过的对话（6）(过期)
````javascript
url: "/sys/ichats"
method : get
param:null
return:{
	code:0, //(0, -1),
	msg:"正确"  //("正确"，"参数错误"),
	result:{
		intos:[room, room, ....] //我参与过的对话倒序
		creates:[room, room, ....] //我创建的对话倒序
	}
}
````

####检查mail是否被注册（7）
````javascript
url:"/api/user-mail-verify",
method:get
param:
	mail: //一个正确的email
return:{
	code:"0" //0, -2
	msg:"正确"//未注册，已经注册
	result:null
}
````

####修改用户头像（8）
````javascript
url: "/sys/user-avatar-update",
method:post,
param:
	gravatarDefault : ("mm", "identicon", "monsterid", "wavatar", "retro", "blank") // 必须是这其中之一
return:{
	code:0,(0, 403)
	msg:"",
	result:null
}
````

####检查房间快捷访问key是否被注册（9）
````javascript
url: "/api/room-key-verify",
method:get,
param:
	key : string < 100 // 可以是任意字符
return:{
	code:0,//(0, -2)
	msg:"",//(可用，已经被使用)
	result:null
}
````

####读取房间历史参与的人的列表（10）
````javascript
url: "/api/room-visitors-get",
method:get,
param:
	roomid:123456789 //正确的房间id
	[size] :24, // number > 0  需求返回的数量
return:{
	code:0,//(0, -1)
	msg:"",//(可用，参数错误)
	result:[
		user,user,....
	]
}
````


####修改用户的个人介绍（11）
````javascript
url: "/api/user-summary-update",
method:post,
param:
	summary: string < 300
return:{
	code:0,//(0, -1)
	msg:"",//(可用，参数错误)
	result:null
}
````

####获取当前登录用户未读信息条数(12)
````javascript
url:"/api/notice-count"
method:"get"
param:null,
return :{
	code:0,(0, 301),
	msg:""//(可用, 未登录)
	result: 3//(未读信息条数)
}
````

####获取前 number 条用户非已读信息(13)
````javascript
url:"/api/notice-list"
method:"get",
param:{
	[time]:new Date().getTime()+1 //未来时间戳获取最新的 number -- 默认未来时间戳
	[number]:5 //	--默认 5
}
return :{
	code:0,
	msg:"",
	result:[Notice, Noitce, ...]
}
````

####改变提醒的状态（理论上只允许标记为 2 已读）（14）
````javascript
url:"/api/notice-status"
method:"post",
param:{
	_id: ,//信息_id
	[status]:2,//默认2
}
return :{
	code:0,
	msg:"",
	result:null
}
````


####删除一张或者多张照片（15）
````javascript
url:"/p/sys/delete-photo"
method:"post",
param:{
	ids:""//字符串，多个id用逗号分割
}
return :{
	code:0,
	msg:"",
	result:ids// 已经被删除的photo id
}
````

##vchat.js接口

####登录vchat 17号
````javascript
/**
	uid为空
		创建uid账户，下次可使用uid登录
	uid有值
		查询uid是否注册，若已经注册直接登录到账户
		未注册使用uid创建账户

*/
url:"/sys/vchat-create"
method:"post",
param:{
	server: //必选
	uid:"自动生成一个24位MD5值" //可选
	uname: "匿名"//可选
	uavatar: ""//可选
}

return {
	code:0,
	msg:"",
	result:{
		user:User,
		multiple:User, //留言器已经保存在用户
		roomid:13623984732, //server对应的roomid,
		isNew:[0,1]// 0旧账户  1新账户
	}
}

````

####登录 chat server 18
````javascript
/**
	uid为空
		创建uid账户，下次可使用uid登录
	uid有值
		查询uid是否注册，若已经注册直接登录到账户
		未注册使用uid创建账户

*/
url:"/sys/vchat-login"
method:"post",
param:{
	domain: //必选
	uid:"自动生成一个24位MD5值" //可选
	uname: "匿名"//可选
	uavatar: ""//可选
}

return {
	code:0,
	msg:"",
	result:{
		user:User,
		multiple:User, //留言器已经保存在用户
		roomid:13623984732, //server对应的roomid,
		isNew:[0,1]// 0旧账户  1新账户
	}
}

````



####创建对话 20
````javascript
	
	url:"/api/room-create"
	method:post
	param:
		topic:string < 140,
		[des]:string < 300,
		[pwd]: string < 16
	
	return {
		code:0,
		msg:"",
		result:Room
	}
	 
````

####获取我的往来纪录 21（默认按照热度倒叙排列）
````javascript
	
	url:"/api/user-contact-get"
	method:get
	param:
		[limit]:number || 20

	return {
		code:0,
		msg:"",
		result:[User,User]
	} 
````

####检索 topic 22
````javascript
	
	url:"/api/room-search"
	method:get
	param:
		key:string < 20

	return {
		code:0,
		msg:"",
		result:[Room,Room]
	} 
````


####邀请好友加入对话 topic 23
````javascript
	
	url:"/api/room-inviteh"
	method:get
	param:
		_ids: string // "_id,_id"以逗号分割的用户id
		mails: string //以 逗号分割的 e-mail
		roomid: 邀请到的房间

	return {
		code:0,
		msg:"",
		result:true
	} 
````


####关闭一个我自己创建的话题 topic 24
````javascript
	
	url:"/api/room-set-close"
	method:post
	param:
		id:Room.id
	return {
		code:0,// 304
		msg:"",
		result:true
	} 
````

