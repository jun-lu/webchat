;;(function(win){

	win.__vchat_config = win.__vchat_config || {};
	__vchat_config.server = __vchat_config.server || "http://vchat.co";

	if(!win.WebSocket){
		window.console && window.console.log("vchat not support your browser");
		return ;
	}
	var HTML_TMPL = {

		chat_main:'<div class="vchat-wrapper">\
							<div class="vchat-chats-wrapper" id="__vchat_chat_wrap"></div>\
							<div class="vchat-main vchat-main-mini" id="__vchat_main" >\
								<div class="vchat-self-card" id="__vchat_self" ></div>\
								<div class="vchat-user-list" id="__vchat_online_user"></div>\
								<div class="vchat-user-init" id="__vchat_init" onclick="__vchat.openAndClose()" >V-chat</div>\
							</div>\
					</div>',
		chat_box:'<div class="vchat-chats-item" id="__vchat_<%=_id%>" >\
					<div class="vchat-chats-item-in">\
						<div class="vchat-chat-title">\
							<span><%=name ? name : "??"%></span>\
							<div class="vchat-chat-item-setting">\
								<span class="vchat-chat-item-set vchat-chat-item-set-mini" title="最小化" >＿</span>\
								<span class="vchat-chat-item-set vchat-chat-item-set-noraml" title="还原" >￣</span>\
								<span class="vchat-chat-item-set vchat-chat-item-set-close" title="关闭" >ㄨ</span>\
							</div>\
						</div>\
						<div class="vchat-chat-context"></div>\
						<div class="vchat-chat-enter" z-index="0">\
								<input type="text" class="vchat-chat-input" placeholder="发消息" />\
						</div>\
					</div>\
				</div>',

		chat_item:'<div class="<%=isSelf ? \'vchat-chat-right\' : \'vchat-chat-left\'%>">\
							<div class="vchat-chat-avatar"><img src="<%=from.avatar%>" width="24" alt="" /></div>\
							<div class="vchat-chat-info">\
								<%=text%>\
								<%if(!_id){%><div class="vchat-chat-status">...</div><%}%>\
							</div>\
						</div>',

		user_card:'<div class="vchat-user-card vchat-user-card-self" id="__vchat_uid_<%=_id%>" onclick="__vchat.chat.open(\'<%=_id%>\')" >\
						<div class="vchat-user-avatar">\
							<img src="<%=avatar%>" alt="<%=name%>" width="36" height="36" />\
						</div>\
						<div class="vchat-user-info">\
							<div class="vchat-user-name"><%=name%></div>\
							<div class="vchat-user-talk"><%if(_id == __vchat.user._id){%>(我自己)<%}%></div>\
						</div>\
					</div>',
		chat_tip:'<div class="vchat-connection-tip <%code != 0 ? \'vchat-connection-tip-error\' : \'vchat-connection-tip-success\'%> ">msg</div>'				

	};


	var TOOL = {

		$:function( id ){
			return document.getElementById( id );
		},
		htmlToDom:function( html ){
			var div = document.createElement('DIV');
			var dc = document.createDocumentFragment();

			div.innerHTML = html;

			while( div.firstElementChild ){
				dc.appendChild( div.firstElementChild );
			}

			return dc;
		},
		hasClassName:function(element, className){
			return element.className.indexOf( className ) != -1;
		},
		toggleClassName:function(element, className){
			if( this.hasClassName(element, className) ){
				element.className = element.className.replace(className, "");
			}else{
				element.className = element.className + " " +className;
			}
		},
		addClassName:function(element, className){
			if( !this.hasClassName(element, className) ){
				element.className = element.className + " " +className;
			}
		},
		removeClassName:function(element, className){
			if( this.hasClassName(element, className) ){
				element.className = element.className.replace(className, "");
			}
		},	
		removeElement:function( element ){
			element.parentElement.removeChild( element );
		},
		appendHTML:function( element, html ){
			element.appendChild( this.htmlToDom( html ) );
		},
		insertHTML:function( element, html ){
			if(element.firstElementChild){
				element.insertBefore( this.htmlToDom( html ), element.firstElementChild );
			}else{
				element.appendChild( this.htmlToDom( html ) );
			}
		},
		tmpl:function(str, data){
			var fn = !/\W/.test(str) ?
			  cache[str] = cache[str] ||
				tmpl(document.getElementById(str).innerHTML) :
			  
			  new Function("obj",
				"var p=[],print=function(){p.push.apply(p,arguments);};" +
				"with(obj){p.push('" +
				
				str
				  .replace(/[\r\t\n]/g, " ")
				  .split("<%").join("\t")
				  .replace(/((^|%>)[^\t]*)'/g, "$1\r")
				  .replace(/\t=(.*?)%>/g, "',$1,'")
				  .split("\t").join("');")
				  .split("%>").join("p.push('")
				  .split("\r").join("\\'")
			  + "');}return p.join('');");
			  
			return data ? fn( data ) : fn;
		},
		ajax:function(url, type, data, successfunction, errorfunction){

			var dataArr = [];

			for( var i in data ){
				if( data[i] != null && data[i] != undefined ){
					dataArr.push(i + '=' + encodeURIComponent(data[i]));
				}
			}

			var xhr = new XMLHttpRequest();

			xhr.open(type, url+ (type == "get"? "?"+dataArr.join("&") : ""), true);
			xhr.withCredentials = true;
			xhr.onload = function(){
				//try{
					successfunction( JSON.parse( xhr.responseText ) ) ;
				//}catch(e){
				//	console.log(e);
					//errorfunction( xhr.responseText );
				//}
			};
			xhr.onerror = function(){
				errorfunction( xhr );
			};
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			//xhr.withCredentials = 'true';
			xhr.send( type == "post" ? dataArr.join("&") : null  );
		},

		get:function( url, data, successfunction, errorfunction ){
			this.ajax( url, "get", data || {}, successfunction || this.empty, errorfunction || this.empty);
		},

		post:function( url, data, successfunction, errorfunction ){
			this.ajax( url, "post", data || {}, successfunction || this.empty, errorfunction || this.empty);
		},
		empty:function(){}

	};

	//主
	win.__vchat = {
		user:null,
		room:null,
		isStart:0,
		ui:{},
		config:{},
		init:function(){

			this.setConfig();
			this.loadAkim();
			this.addMainUI();
		},
		loadAkim:function(){
			var link = document.createElement("link");
			link.setAttribute("rel", "stylesheet");
			link.setAttribute("type", "text/css");
			link.setAttribute("charset","utf-8");
			link.href=this.config.server+"/css/__chat.css";
			document.getElementsByTagName("head")[0].appendChild( link );
		},
		//和并用户配置
		setConfig:function(){

			this.config.server = win.__vchat_config.server;
			this.config.domain = win.__vchat_config.domain || document.domain;
			this.config.uid = win.__vchat_config.uid || "";
			this.config.uname = win.__vchat_config.uname || "匿名";
			this.config.uavatar = win.__vchat_config.uavatar || null;

		},
		addMainUI:function(){

			TOOL.appendHTML(document.body, HTML_TMPL.chat_main);
			this.ui.chat_main = TOOL.$('__vchat_main');
		},
		//打开或者关闭主UI
		openAndClose:function(){
			TOOL.toggleClassName( this.ui.chat_main,  "vchat-main-mini");
			if(this.isStart == 0){
				this.isStart = 1;

				this.userList.init();
				this.chat.init();

				this.createUser();

				//读取缓存
				//this.localStorage.init();	
				//this.userList.init();
			}
		},
		//创建用户
		createUser:function(){
			var self = this;
			this.api.create( this.config.domain, this.config.uid, this.config.uname, this.config.uavatar, function( data ){
				if(data.code == 0){
					self.user = data.result.user;
					self.userList.addMe( self.user );
					//self.userList.initList([self.user]);
					self.login();
				}else{
					alert(data.msg);
				}
			})
		},
		//获取server
		login:function(){
			var self = this;
			this.api.login( this.config.domain, function( data ){

				if(data.code == 0){
					self.room = data.result;
					self.socketController.init( self.room );
				}

			})
		}

	};


	__vchat.api = {
		server:__vchat_config.server,
		create:function( domain, uid, uname, uavatar, successfunction, errorfunction ){
			TOOL.post( this.server+"/sys/vchat-create", {domain:domain, uid:uid, uname:uname, uavatar:uavatar}, successfunction, errorfunction )
		},
		login:function( domain, successfunction, errorfunction ){
			TOOL.post( this.server+"/sys/vchat-login", {domain:domain}, successfunction, errorfunction );
		},
		postMessage:function(roomid, text, to, from, aim, successfunction, errorfunction){
			TOOL.post( this.server+"/sys/post", {roomid:roomid, text:text, to:to, from:from, aim:aim}, successfunction, errorfunction);

		},
		history:function( roomid, to, limit, successfunction, errorfunction ){
			TOOL.get( this.server+"/sys/vchat-history", {to:to, limit:limit || 10, roomid:roomid}, successfunction, errorfunction);
		}
	};

	//用户列表控制
	__vchat.userList = {
		list:[],
		ui:{},
		init:function(){
			this.ui.list = TOOL.$('__vchat_online_user');
			//console.log( this.ui.list );
		},
		initList:function( data ){


			var html = "";
			for(var i=0; i < data.length; i++){
				if(this.hasOnline(data[i]) == false){
					this.list.push( data[i] );
					if( data[i]._id != __vchat.user._id ){
						html += TOOL.tmpl(HTML_TMPL.user_card, data[i]);
					}
				}
			};
			TOOL.appendHTML( this.ui.list, html );
		},
		addMe:function( user ){
			TOOL.$('__vchat_self').innerHTML = TOOL.tmpl(HTML_TMPL.user_card, user);
		},
		getUser:function( id ){

			for(var i=0; i<this.list.length; i++){
				if( this.list[i]._id == id ){
					return this.list[i];
				}
			}

			return null;
		},
		online:function(data){
			if(data._id != __vchat.user._id && this.hasOnline(data) == false){
				this.initList([data])
			}else{
				console.log("on-line miss self", data._id);
			}
		},
		offline:function( data ){
			var isoff = 0;
			for(var i=0; i<this.list.length; i++){
				if(this.list[i]._id == data._id){
					this.list.splice(i, 1);
					isoff = 1;
					break;
				}
			}

			if(isoff){
				TOOL.removeElement( TOOL.$('__vchat_uid_'+data._id) );
			}
		},
		hasOnline:function( data ){
			for(var i=0; i<this.list.length; i++){
				if(this.list[i]._id == data._id){
					return true;
				}
			}
			return false;
		}
	};

	__vchat.socketController = {
		socket:null,
		weightTime:0,
		room:null,
		serverHost:__vchat_config.server.replace("http://",''),
		init:function( room ){

			if( !this.room && room ){
				this.room = room;
			};
			var roomid = this.room.id;
			var socket = this.socket = new WebSocket("ws://"+this.serverHost+"/s");
			var socketMessage = {
				"connection":function( data ){
					//登录到房间
					if( data.code == 0 ){
						socket.send( JSON.stringify({ type:"login", data:{roomid:roomid} }) );
					}else{
						console.log( data.msg );
					}
				},
				"on-line":function( data ){
					//console.log("on-line", data);
					//WE.pageChat.userlist.init( data );
					__vchat.userList.online( data );
				},
				"off-line":function( data ){
					//console.log("off-line", data);
					__vchat.userList.offline( data );
				},
				"user-list":function( data ){
					//console.log("user-list", data);
					__vchat.userList.initList( data );
					//__vchat.showOnlineList( data );
				},
				"new-chat":function( data ){
					//console.log("new-chat", data);
					__vchat.chat.newMessage( data );

				}
			};

			socket.onopen = function( e ){

				window.console && console.log("onopen");

			};
			
			socket.onmessage = function( e ){
				var data = JSON.parse(e.data);
				//console.log("onmessage", data);
				if( socketMessage[data.type] ){
					socketMessage[data.type]( data.data );
				}else{
					window.console && console.log("onmessage miss", data);
				}
			}

			socket.onclose = function(){
				__vchat.socketController.startDisconnectionWeightTraining();
			}

			//$('#socketConnectioning').show();
		},
		//开启断线重连
		startDisconnectionWeightTraining:function(){

			var _this = this;
			setTimeout(function(){

				console.log("重新连接"+ _this.weightTime/2000 +"次");
				_this.socket && _this.socket.close();
				_this.init();

			}, this.weightTime+= 2000 );

		}
	};	

	//对话控制
	
	__vchat.chat = function( user, roomid, ishistory ){

		this.roomid = roomid;
		this.ishistory = ishistory;
		this.chat_item = HTML_TMPL.chat_item;
		this.user = user;
		this.wrap = __vchat.chat.ui.wrap;
		this.ui = {};
		this.init();
	};

	

	__vchat.chat.prototype = {
		constructor:__vchat.chat,
		init:function(){

			this.addUI();
		},
		addUI:function(){

			var html = TOOL.tmpl(HTML_TMPL.chat_box, this.user);
			var btn = null;
			//TOOL.appendHTML( this.wrap, html );
			TOOL.insertHTML( this.wrap, html );
			this.ui.wrap = TOOL.$('__vchat_'+this.user._id);
			btn = this.ui.wrap.getElementsByClassName('vchat-chat-item-set');
			this.ui.mini = btn[0];
			this.ui.noraml = btn[1];
			this.ui.close = btn[2];
			this.ui.input = this.ui.wrap.getElementsByClassName('vchat-chat-input')[0];
			this.ui.list = this.ui.wrap.getElementsByClassName('vchat-chat-context')[0];

			this.regEvent();

			this.initChats();
		},
		regEvent:function(){
			var self = this;
			this.ui.mini.onclick = function(){
				self.setMini();
			}
			this.ui.noraml.onclick = function(){
				self.setNoraml();
			}
			this.ui.close.onclick = function(){
				self.setClose();
			}
			this.ui.input.onkeyup = function( e ){
				e = e || window.event;
				if(e.keyCode == 13 && this.value != ""){
					//console.log( "发送" );
					self.sendMessage( this.value );
					this.value = '';
				}
			}

			this.ui.input.focus();
		},
		initChats:function(){
			if(this.ishistory){
				this.getHistory();
			}
		},
		getHistory:function( ){
			var self = this;
			__vchat.api.history(this.roomid, this.user._id, 10, function( status ){

				var chats = status.result;
				if( status.code == "0" ){
					for(var i=0; i<chats.length; i++){
						self.addChat( chats[i] );
					}
				}
			});
		},
		addChat:function( chat ){ 
			
			chat.isSelf = (chat.from._id == __vchat.user._id);
			var html = TOOL.tmpl( this.chat_item, chat);
			TOOL.appendHTML(this.ui.list, html);
			this.ui.list.scrollTop = this.ui.list.scrollHeight;
			
		},
		//正在发送中的消息
		addMessage:function( message ){
			this.ui.list.appendChild( message.ui.wrap );
			this.ui.list.scrollTop = this.ui.list.scrollHeight;
		},
		setClose:function(){
			TOOL.removeElement( this.ui.wrap );
			__vchat.chat.close( this.user._id );
		},	
		setMini:function(){
			TOOL.addClassName(this.ui.wrap, 'vchat-chats-item-mini')
		},
		setNoraml:function(){
			TOOL.removeClassName( this.ui.wrap, 'vchat-chats-item-mini');
			this.ui.input.focus();
		},
		//接收一条消息，并且返回自己是否处理它
		newChat:function( data ){
			//我给当前对话框发出的信息
			if( data.to._id == this.user._id && data.from._id == __vchat.user._id ){
				return true;
			}

			//当前对话框发给我的
			if(data.from._id == this.user._id && data.to._id == __vchat.user._id){
				this.addChat( data );
				return true;
			}
			return false;
		},
		sendMessage:function( text ){
			var to = this.user;
			var roomid = this.roomid;
			var from = __vchat.user;
			var message = this.localMessage( text );
			
			this.addMessage( new __vchat.Message(roomid, to, from, text, null) );

			
			
		},
		localMessage:function(text){
			return {
				from:__vchat.user,
				to:this.user,
				text:text,
				time:parseInt(new Date().getTime()/1000)
			}
		}

	};

	__vchat.chat.list = [];
	__vchat.chat.ui = {};
	__vchat.chat.close = function( id ){
		for(var i=0; i<this.list.length; i++){
			if(this.list[i].user._id == id){
				this.list.splice(i, 1);
				return id;
			}
		}
	};
	__vchat.chat.open = function( id, ishistory ){

		var user = __vchat.userList.getUser( id );
		var chat = null;

		if( id == __vchat.user._id ){
			window.console && console.log("miss self");
			return false;
		}

		if( user ){

			for(var i=0; i<this.list.length; i++){
				if(this.list[i].user._id == id){
					this.list[i].setNoraml();
					return ;//已经存在这个ui了
				}
			}

			if(this.list.length > 6){
				this.list[0].setClose();
			}

			var chat = new __vchat.chat( user, __vchat.room.id, ishistory == undefined ? true : false );
			this.list.push( chat );
		}

	};

	__vchat.chat.newMessage = function( data ){

		//是对我说的 或者 我发出的
		var isReceive = 0;
		if((data.to && data.to._id == __vchat.user._id) || data.from._id == __vchat.user._id){

			for(var i=0; i<this.list.length; i++){
				if( this.list[i].newChat( data ) ){
					isReceive = 2;
					break;
				};
			}
		}else{

			isReceive = 1;
		}
		//没有任何打开窗口处理此消息
		/**
			打开与此人的聊天窗口
		*/
		if(isReceive == 0){
			this.open( data.from._id, false );
			this.newMessage( data );//重新发送这条信息
		}

	};


	__vchat.chat.init = function(){
		this.ui.wrap = TOOL.$('__vchat_chat_wrap');
	};



	/***
		一条信息

		_id 如果id为空为一条待发送的信息 Message应该调用发送程序，并处理结果
	*/

	__vchat.Message = function(roomid, to, from, text, _id){

		this.parentElement = null;
		this.chat_item = HTML_TMPL.chat_item;
		this.ui = {};
		this.data = {
			isSelf:from._id ==__vchat.user._id,
			roomid:roomid,
			to:to,
			from:from,
			text:text,
			_id:_id,
			time:parseInt(new Date().getTime()/1000)
		};
		this.interid = null;
		this.init();
	};
	__vchat.Message.prototype = {
		constructor:__vchat.Message,
		init:function(){
			//chat.isSelf = (chat.from._id == this.user._id);
			this.ui.wrap = TOOL.htmlToDom( TOOL.tmpl( this.chat_item, this.data) ).firstChild;
			this.ui.status = this.ui.wrap.getElementsByClassName('vchat-chat-status')[0];
			if(!this.data._id){
				//this.ui.status.innerHTML = "...";
				this.postMessage();
			}

		},
		appendTo:function( element ){
			element.appendChild( this.ui.wrap );
		},
		setTime:function( time ){
			this.data.time = time;
		},
		postMessage:function(){

			var self = this;
			var roomid = this.data.roomid;
			var text = this.data.text;
			var to = this.data.to._id;
			var from = this.data.from._id;

			self.showSendIngStatus();
			__vchat.api.postMessage(roomid, text, to, from, null, function( successData ){
				self.stopSendIngStatus();
				self.ui.status.innerHTML = "";
			}, function(){
				self.ui.status.innerHTML = "error";
			});
		},
		stopSendIngStatus:function(){
			clearInterval( this.interid );
		},
		showSendIngStatus:function(){
			var self = this;
			var i = 0;
			this.interid = setInterval(function(){
				self.ui.status.innerHTML = "...".slice(0, (++i%3)+1);
			},300);
		}
		
	};

	//自动初始化
	if(__vchat_config.init == undefined || __vchat_config.init){
		__vchat.init();
	}

})(window);
