#配置
	1:下载安装node
	2:克隆 webchat 项目
	3:安装项目的所有中间件(使用npm install完成)
	4:创建配置文件 settings.js
		module.exports = {
			db:"127.0.0.1",
			port:27017
		};
	5:访问webchat 127.0.0.1:3000

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
		
	4：讨论中规则
		1：讨论主题与副标题改变，推送时间轴消息
		2：成员离线或上线推送时间轴消息
	
	5:讨论组信息与设置
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
		

#投票插件
	
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



#定义数据体

####用户定义 User
````javascript
{
	"_id":"514197562128205e66000011",
	"mail":"idche@qq.com",// 匿名用户的email为一串数字
	"name":"lujun",
	"hexMail":"", // 用户email md5值，也作为头像的网址使用
	"avatar":"http://www.gravatar.com/avatar/d437481aad048f1cb9ff68483c662bae.jpg?s=48&d=monsterid"
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
	"masterName":"lujun", //创建者用户名
}
````


####对话定义 Chat
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

####发送一条信息
````javascript
url: "/sys/post"
method: post
param:
	roomid:number // 房间id
	text:string < 2000
	[to]:string //回应某条信息的 _id
return:{
	code:0,
	msg:"正确",
	result:Chat
}
````
####修改昵称
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

####匿名用户绑定email
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

##修改房间信息，仅房间创建者可修改
````javascript
url: "/sys/update_room"
method:post
param:
	name: string < 50
	topic: string < 500,
	des: string < 2000
return:{
	code:0, //(0, -1, 403),
	msg:"", //(正确, 参数错误, 超出访问权限(没有权限修改)),
	result:null
}
````

####根据时间获取房间对话
````javascript
url: "/sys/getmore"
method:get
param:
	roomid:"1361182575505" //房间id
	/**
		小于此时间错的最近 size 条信息
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

####获取我参与过的对话
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

####检查用户名是否被注册
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

####修改用户头像
````javascript
url: "/sys/set_avatar",
method:post,
param:
	gravatarDefault : (mm", monsterid", "wavatar", "retro", "blank") // 必须是这其中之一
return:{
	code:0,(0, 403)
	msg:"",
	result:null
}
````

