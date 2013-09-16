;;(function(win){


	var tmpl_vchat_min = '<div class="vchat-wrapper">\
							<div class="vchat-chats-wrapper" id="__vchat_chat_wrap"></div>\
							<div class="vchat-main vchat-main-mini" id="__vchat_main" >\
								<div class="vchat-user-title">Vchat</div>\
								<div class="vchat-user-list" id="__vchat_online_user"></div>\
								<div class="vchat-user-init" id="__vchat_init">V - Chat</div>\
							</div>\
					</div>';

	var tmpl_chat_box = '<div class="vchat-chats-item" >\
					<div class="vchat-chats-item-in">\
						<div class="vchat-chat-title">\
							<span class="#">李佳怡</span>\
							<div class="vchat-chat-item-setting">\
								<span class="vchat-chat-item-set vchat-chat-item-set-mini" title="最小化" >＿</span>\
								<span class="vchat-chat-item-set vchat-chat-item-set-noraml" title="还原" >￣</span>\
								<span class="vchat-chat-item-set vchat-chat-item-set-close" title="关闭" >ㄨ</span>\
							</div>\
						</div>\
						<div class="vchat-chat-context"></div>\
						<div class="vchat-chat-enter" z-index="0">\
							<div class="vchat-chat-enter-in">\
								<input type="text" class="vchat-chat-input" placeholder="发消息" />\
							</div>\
						</div>\
					</div>\
				</div>';

	var tmpl_chat_item = '<div class="vchat-chat-right">\
							<div class="vchat-chat-avatar"><img src="http://www.gravatar.com/avatar/e3238e39e72fdb588d6e5bb360fa90b0.jpg?s=24&d=mm&r=g" alt="" /></div>\
							<div class="vchat-chat-info">hello</div>\
						</div>';
						
	var tmpl_user_card = '<div class="vchat-user-card" data-uid="<%=_id%>" onclick="__vchat.showChatBox(\'<%=_id%>\')" >\
						<div class="vchat-user-avatar">\
							<img src="<%=avatar%>" alt="<%=name%>" />\
						</div>\
						<div class="vchat-user-info">\
							<span class="vchat-user-name"><%=name%></span>\
							<div class="vchat-user-talk"><%=summary%></div>\
						</div>\
					</div>';


	function $( id ){
		return document.getElementById( id );		
	}

	function htmltodom( html ){
		var div = document.createElement('DIV');
		div.innerHTML = html;
		return div.firstElementChild;
	}


	function toggleClassName( element, className ){

		var classnames = element.className;
		var hasWin = classnames.indexOf( className ) == -1 ? 0 : 1;
		if( hasWin ){
			element.className = classnames.replace(className, "");
		}else{
			element.className = classnames + " " +className;
		}
	}

	function removeElement( element ){

		element.parentElement.removeChild( element );

	}


	function ajax(url, type, data, successfunction, errorfunction){

		var dataArr = [];

		for( var i in data ){
			if( data[i] != null && data[i] != undefined ){
				dataArr.push(i + '=' + encodeURIComponent(data[i]));
			}
		}

		var xhr = new XMLHttpRequest();

		xhr.open(type, url+ (type == "get"? "?"+dataArr.join("&") : ""));
		xhr.onload = function(){
			try{
				successfunction( JSON.parse( xhr.responseText ) ) ;
			}catch(e){
				errorfunction( xhr.responseText );
			}
		};
		xhr.onerror = function(){
			errorfunction( xhr );
		};
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); 
		xhr.send( type == "post" ? dataArr.join("&") : null  );
	}

	function tmpl(str, data){
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
	}

	function empty(){}

	function get( url, data, successfunction, errorfunction ){
		ajax( url, "get", data || {}, successfunction || empty, errorfunction || empty);
	}

	function post( url, data, successfunction, errorfunction ){
		ajax( url, "post", data || {}, successfunction || empty, errorfunction || empty);
	}


	win.__vchat = {
		user:[],
		isInit:0,
		init:function(){

			this.appendMainUI();

		},
		appendMainUI:function(){

			document.body.appendChild( htmltodom( tmpl_vchat_min ) );

			this.ui = {

				vchat_main:$('__vchat_main'),
				vchat_online_user:$('__vchat_online_user'),
				vchat_init:$('__vchat_init'),
				vchat_chat_wrap:$('__vchat_chat_wrap')

			}

			this.regEvent();

		},
		regEvent:function(){

			var _this = this;
			this.ui.vchat_init.onclick = function(){
				toggleClassName( _this.ui.vchat_main, "vchat-main-mini" );
				if(_this.isInit == 0){
					_this.loginVchat();
				}
			}
		},

		loginVchat:function(){
			var _this = this;
			this.isInit = 1;
			this.api.create(__vchat_config.domain, __vchat_config.uid, __vchat_config.uname, __vchat_config.uavatar, function( data ){
				//console.log( data );
				if( data.code == 0 ){
					_this.api.login(__vchat_config.domain, function(data){

						if(data.code == 0){
							connectionSocketServer.init( data.result.id );
						}
					});
				}else{

					alert(data.msg);
				}
			})

		},


		showOnlineList:function( data ){

			var html = "";
			for(var i=0; i < data.length; i++){
				this.user.push( data[i] );
				html += tmpl(tmpl_user_card, data[i]);
			};

			this.ui.vchat_online_user.innerHTML = html;
		},
		onlienUser:function( data ){
			this.user.push( data );
			this.ui.vchat_online_user.innerHTML += tmpl(tmpl_user_card, data);;
		},
		offlineUser:function( data ){
			var list = this.ui.vchat_online_user.getElementsByClassName('vchat-user-card');
			for(var i=0; i<list.length; i++){
				if( list[i].getAttribute("data-uid") == data._id ){
					removeElement( list[i] );
					break;
				}
			}
		},
		showChatBox:function( id ){
			for(var i=0; i<this.user.length; i++){
				if( this.user[i]._id == id ){
					this.openChatBox( this.user[i] );
					break;
				}
			}

		},
		openChatBox:function( user ){

			var html = tmpl(tmpl_chat_box, user);
			this.ui.vchat_chat_wrap.innerHTML += html;

		}

	};

	__vchat.api = {
		host:"http://vchat.com:3000",
		create:function( domain, uid, uname, uavatar, successfunction, errorfunction ){	
			post( this.host+"/sys/vchat-create", {domain:domain, uid:uid, uname:uname, uavatar:uavatar}, successfunction, errorfunction )
		},
		login:function( domain, successfunction, errorfunction ){
			post( this.host+"/sys/vchat-login", {domain:domain}, successfunction, errorfunction );
		}

	}

	var connectionSocketServer = {
		socket:null,
		weightTime:0,
		init:function( server ){

			var socket = this.socket = new WebSocket("ws://vchat.com:3000");
			var socketMessage = {
				"connection":function(){
					//登录到房间
					socket.send( JSON.stringify({ type:"login", data:{roomid:server} }) );

				},
				"on-line":function( data ){
					console.log("on-line", data);
					//WE.pageChat.userlist.init( data );
				},
				"off-line":function( data ){
					console.log("off-line", data);
				},
				"user-list":function( data ){
					console.log("user-list", data);
					__vchat.showOnlineList( data );
				},
				"new-chat":function( data ){
					console.log("new-chat", data);
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
				connectionSocketServer.startDisconnectionWeightTraining();
			}

			$('#socketConnectioning').show();
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

	

})(window)