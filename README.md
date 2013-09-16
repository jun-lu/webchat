#配置
	1:下载安装node
	2:克隆 webchat 项目
	3:安装项目的所有中间件(使用npm install完成)
	4:创建配置文件 settings.js
		
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


#第一版本规划	
	1: 讨论组创建过程和操作
	
		1：创建讨论组
			1：用户打开webChat首页，点击 "创建" 按钮(弹出或者进入创建页面)
			2：输入讨论主题与副标题，确认即可创建一个讨论组。
			
		2：修改讨论主题
			1：点击主题文字后面的小图标(小图标待定)，主题变成可编辑状态，回车完成输入
			
		3：修改讨论副标题
			1：点击主题文字后面的小图标(小图标待定)，主题变成可编辑状态，回车完成输入
	
	2：参与讨论过程和操作
	
		1：进入讨论组
			1：用户在浏览器地址栏键入（粘贴）讨论组URL，可直接进入讨论组。
			
		2：昵称设置规则
			在浏览器端储存用户昵称。
			
			规则
			第一次参与讨论				用户手动输入昵称		
			以后进入						恢复上一次的昵称					
		
	3：如何发言
		在讨论组页面输入框输入不为空的文字，回车发送给当前在线所有人。
		
	4：讨论中规则(未实现)
		1：讨论主题与副标题改变，推送时间轴消息
		2：成员离线或上线推送时间轴消息
	
	5:讨论组信息与设置（表现形式有所改变）
		1：聊天首页下拉框内，给出本页URL，并提示用户发送URL给朋友，即可加入聊天。（所有用户）
		2：发送当前聊天记录到邮箱，用户输入邮箱地址，点击确认，系统发送当前所有聊天记录给用户。(所有用户)
		3：结束讨论组，点击结束讨论按钮，即关闭讨论组。讨论组处于关闭状态，只可阅读记录，不可发言。（创建者）
	
	6：讨论组权限规则
		1：所有用户能创建讨论组（注册，非注册）
		2：非注册用户创建讨论组，用户如果提供了email，则把本讨论组创建者权限赋予这个EMAIL；
		3：新注册用户（email）注册，识别以往是否通过此email创建过讨论组，有则归于其名下

	应用场景
		在线讨论组，基于事件，以事件来汇聚人。当下的社交则是基于人。

		1；周六组织一个活动，邀请参加的朋友一起讨论活动细节。
		2：事件直播，基于某个新闻事件的直播，所有人可以参与。
		3：旅行日记，为自己建立一个旅行日记讨论组，记录下旅行的所见所闻。


#第2版本聊天页面功能规划
	
	统一导航
		首页 ，创建对话，其他对话。        [头像+] 账号

										#点击头像弹出选择头像弹出层
										-- 修改昵称
										-- 我参与过的对话
											匿名用户	--绑定email
										-- 切换用户


	表现
		对话主题
		对话副标题
		对话输入框
		最近的对话列表+时间线选择
		在线人列表
		查看历史参与的人（按钮或列表）
		修改对话信息（按钮）
		

#投票插件 （搁浅）
	
	应用场景 : Chat页面
	使用权限 : 
		1.所有对话用户
		2.发起人可以删除自己创建的投票项目

	使用说明 :
		1.发起投票人(任何人)创建投票项目(投票话题，可选表决项[默认带有放弃此次投票项]，参与投票人)
		2.在各个投票项目中被参与投票的人的浏览器弹出参与提示(考虑使用chrome插件形式)
		3.参与人进行投票(在参与还没进行投票之前不可查看投票结果)，待其投票结束之后(不可在此进行投票)
		  便可查看投票结果(使用SVG进行数据统计)
		4.待全部投票完成之后，数据按照没投票已投票进行统计显示
		5.投票项目依附该话题列表式显示在相应的地方

#提醒功能
	
	提醒机制
		1：用户直接回复您的对话
		2：用户@您的名字// 这个可能暂时不实现
	
	提醒方式（部分暂时无法实现的略过）
		1：网站头部新消息提醒
		2：注册用户 mail 提醒
		3：chrome 浏览器提醒
		4: mac 通知栏提醒

	提醒阅读方式
		1：点击头部提醒默认展示 5 条新信息，并标记为已读
		2：通过网站头部提醒到达信息详情页面		


	提醒内容

		lujun 回复了你
		服务器是在淘宝上买的，域名可以随便找个地方买就好
		
		lujun 提到了你
		@jun 请问下如何才能使用nodejs作为服务器？

#图片功能
	
	上传机制
		1.任何已经绑定邮件的用户才可以上传照片
		2.具有上传图片权限的用户可以在任何房间以及自己建立的相册里面上传图片

	删除机制
		1.具有上传图片权限的用户可以对自己建立的相册进行相册编辑,图片删除,相册删除
		2.房间创建者可以对该房间绑定的进行相册编辑,图片删除,相册删除。

	图片url
		1.vchat.co/p/r/相册id/图片id.jpg
		2.vchat.co/p/create?roomid=房间id

	相册属性
		1.描述
		2.创建者
		3.创建时间
		4.相册名
		5.房间归宿(房间id)
		6.权限（公开1，房间所有权限2，个人所有权限3）

	图片属性
		1：描述
		2：创建者
		3：创建时间
		4：所属相册id
		5：所属房间id
	

	恶意图片处理机制
		1.用户上传图片立即显示,但经过后台审核,审核之后如果不通过经过邮件提醒,并删除该恶意图片。
		2.用户如果3次删除恶意照片则封号。

	数据库路径
		root/上传日期/访问权限/(roomid|userid)-photoshop_id.jpg
		img_vchat/201203041111/

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
	type:1// 1对话中回复（回复方式） 2对话中提到（@方式）
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
url: "/sys/set_user_name"
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
url: "/sys/bindmail"
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
url: "/sys/room_update"
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
url: "/sys/getmore"
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

####获取我参与过的对话（6）
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
url:"/sys/checkmail",
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
url: "/sys/set_avatar",
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
url: "/sys/check_room_key",
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
url: "/sys/history",
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
url: "/sys/user_summary",
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
url:"/sys/notice_count"
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
url:"/sys/notice_list"
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
url:"/sys/notice_status"
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

####获取前端js所需要的模版 19
````javascript

	action: 获取前端js所需要的模版
	logic：从 /views/tmpl/ 下获取 path 文件并返回内容
	
	
	url:/sys/tmpl
	method:get
	param:
		path: string
	
	return string
````