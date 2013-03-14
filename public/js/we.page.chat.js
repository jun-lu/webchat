

WE.pageChat = {

	isLoading:0,
	lastTime:null,
	postType:1, //快捷发送方式  默认 ctrl + enter 1  enter = 2
	init:function(){

		this.ui = {
			header:$('#header'),
			postBox:$('#postbox'),
			postBoxIn:$('#postboxIn')
		};
		// 设置全部事件绑定
		this.regEvent();

		this.setLocal();
		//聚焦
		$('#postText').focus();


		// 回复的注册 :ck
		WE.pageChat.reply.init();
	},
	/* 
		修改页面的主题和副标题

		topic: string
		directions： string
		isNotice: bl  //是否在时间轴执行通知
	 */
	setTopic:function( topic, directions, isNotice ){
		topic && $('#topic').text( topic );
		directions  && $('#directions').text(directions);
		isNotice && this.timeLine.noticeTopicUpdate( topic, directions );
	},
	
	regEvent:function(){

		var _this = this;

		$('#postForm').submit(function(){

			var text = $.trim($('#postText').val()).replace(/[\n\r]+$/g,"");
			var roomid = $('#roomid').val();
			//console.log( text, roomid );	
			if(text && roomid){

				//添加回复判断
				if( WE.pageChat.reply.isRelply ){
					var to = WE.pageChat.reply._id;
					console.log('to:',to);
					_this.post( roomid,text,to );
				}else{
					_this.post( roomid, text );
				}

			}else{
				$('#postText').val('').focus();
			}
			return false;
		});

		$('#postText').keydown(function( e ){

			if(_this.postType == 2 && e.keyCode == 13 && e.shiftKey == false){
				e.preventDefault();
				e.stopPropagation();
				$('#postForm').submit();
			}

			if(_this.postType == 1 && e.keyCode == 13 && e.ctrlKey == true){

				e.preventDefault();
				e.stopPropagation();
				$('#postForm').submit();

			}

		});

		//var isUpdateNameShow = 0;
		$('#username').click(function(){
			_this.setUserName( USER );
		});

		$('#setting').click(function(){
			_this.setRoomInfo( ROOM );
		});

		$('#viewRoom').click(function(){
			_this.viewRoomInfo( ROOM );
		});

		//匿名用户绑定用户名
		$('#bindmail').click(function(){
			_this.bindMail();
		});

		var changePostTypeisOpen = false;
		$('#changePostType').click(function(e){
			//onsole.log( e );
			e.preventDefault();
			e.stopPropagation();

			if(changePostTypeisOpen){
				$('#postTypeGroup').removeClass('open');
			}else{
				$('#postTypeGroup').addClass('open');
			}
			changePostTypeisOpen = !changePostTypeisOpen;

			
			
		});


		var postTypeMenuA = $('#postTypeMenu a');

		postTypeMenuA.click(function(e){
			e.stopPropagation();
			var type = $(this).attr('type');
			_this.postType = type;
			if( type == "1" ){
				postTypeMenuA.eq(1).addClass("on");
				postTypeMenuA.eq(0).removeClass("on");
			}else{
				postTypeMenuA.eq(0).addClass("on");
				postTypeMenuA.eq(1).removeClass("on");
			};

			_this.local.setItem("postType", type);
			$('#changePostType').click();
		});

		$(document.body).click(function(){
			changePostTypeisOpen = false;
			$('#postTypeGroup').removeClass('open');

		});

		$(window).bind("scroll", function(){

			if(_this.isLoading == 0){

				var isbottom = $(window).scrollTop() + $(window).height() + 100 > $(document.body).innerHeight();

				if( isbottom ){

					_this.isLoading = 1;
					_this.getMore();

				}

			}

		});
		//$('.searchFirends')

		//间隔1分钟刷新一次所有时间
		setInterval(function(){

			$('a.time').each(function(){


				var target = $(this);
				var time  = target.data("time") * 1000;
				time && target.text( WE.kit.weTime( time ) );

			});


		}, 1000 * 60);
		
	},

	//发送信息
	post:function(roomid, text, to){

		to = !to ? undefined : to;
		var _this = this;
		var model = new WE.api.ChatModel();//
		var ctrl = new WE.Controller();
		
		ctrl.update = function( e ){

			var data = e.data;
			if( data.code == 0 ){//post提交成功

				//_this.timeLine.prepend( data.r );
				$('#postText').val('').focus();
			}

		};

		model.addObserver( ctrl );

		model.postChat( roomid, text, to );

	},
	//设置或者修改用户昵称
	setUserName:function( user ){

		var dialog = new WE.Dialog({
				title:"修改昵称",
				id:"setUserName",
				width:400,
				height:200
		});
		dialog.show();

		WE.kit.getTmpl("update_user_name.ejs", function( data ){

			var html = WE.kit.tmpl( data, user );
			dialog.append( html );

			$('#setUserNameForm').submit(function(){

				var elenewUserName = $('#newUserName');
				var name = elenewUserName.val();
				if( name ){

					var model = new WE.api.ChatModel();
					var ctrl = new WE.Controller();
					ctrl.update = function( e ){

						var data = e.data;

						if( data.code == 0 ){

							dialog.close();
							setTimeout(function(){
								document.location.reload();
							}, 500)
						}

					};
					model.addObserver( ctrl );
					model.updateUserName( name );	

				}else{
					elenewUserName.focus();
				}

				return false;
			});

			$('#anonymous').click(function(){

				$('#newUserName').val("匿名");
				$('#setUserNameForm').submit();

			});
			
		});
	},
	bindMail:function(){

		var dialog = new WE.Dialog({
				title:"设置mail",
				id:"setMail",
				width:400,
				height:200
		});
		dialog.show();

		WE.kit.getTmpl("bind_mail.ejs", function( data ){

			//var html = WE.kit.tmpl( data, {});
			dialog.append( data );

			$('#bindMialForm').submit(function(){

				var mail = $.trim($('#updateMail').val());
				var pwd = $.trim($('#updatePwd').val());

				if( /^[\w._\-]+@[\w_\-]+\.\w+$/.test(mail) ){

					if(pwd.length>5){

						update( mail, pwd );

					}else{

						alert("密码长度至少6位");
					}

				}else{

					alert("mail, 格式不正确");
				}

				return false;

			});			
		});

		function update( mail, pwd ){

			var model = new WE.api.ChatModel();
			var ctrl = new WE.Controller();
			ctrl.update = function( e ){

				var data = e.data;

				if( data.code == 0 ){

					dialog.close();
					document.location.relaod();
				}

			};
			model.addObserver( ctrl );
			model.updateMailPwd( mail, pwd );
		}

	},
	viewRoomInfo:function( room ){

		var _this = this;
		WE.kit.getTmpl("view_room.ejs", function( data ){

			var dialog = new WE.Dialog( {
				id:"viewRoom",
				width:500,
				html:WE.kit.tmpl(data, room)
			});

			dialog.show();

		});


	},
	//修改房间信息
	setRoomInfo:function( room ){

		var dialog = new WE.Dialog( {
			id:"setRoom",
			width:500,
			height:300
		});
		dialog.show();

		WE.kit.getTmpl("set_room.ejs", function( data ){

			
			var html = WE.kit.tmpl( data,room );
			dialog.append( html );


			var eleRoomName = $('#roomName'),
				eleRoomTopic = $('#roomTopic'),
				eleRoomDes = $('#roomDes'),
				eleRoomid = $('#roomid'),
				eleFormRoom = $('#updateRoomForm');

			//修改访问地址
			eleRoomName.keyup(function(){
				var eleRoomNameTip = $('#roomName-tip'),
					strRoonNameTip = eleRoomNameTip.text(),
					strInput =  $.trim( eleRoomName.val()),
					host = document.location.host + '/';
				eleRoomNameTip.text( host + strInput);
			});

			//表单提交
			eleFormRoom.submit(function(){
				var id = eleRoomid.val(),
					name = eleRoomName.val(),
					topic = eleRoomTopic.val(),
					des = eleRoomDes.val();

				//如果并没有设置新的访问地址
				name = name == id ? "" : name;
				if( topic && des ){
					var model = new WE.api.ChatModel();
					var ctrl = new WE.Controller();
					ctrl.update = function( e ){
						var data = e.data;

						if( data.code == 0 ){

							dialog.close();
							setTimeout(function(){
								//console.log(window.location.host +"/"+ name);
								window.location.href = "http://"+window.location.host+"/"+(name || id);//reload();
							}, 500)
						}
					}
					model.addObserver( ctrl );
					model.updateRoom( id, name, topic, des );
				}
				return false;
			})
		
		});
	},
	getMore:function(){

		var _this = this;
		var model = new WE.api.ChatModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			var data = e.data;
			if(data.code == 0 && data.result.length){
				_this.isLoading = 0;
				WE.pageChat.timeLine.appends( data.result );
			}else{
				_this.isLoading = 2;//没有数据了
			}

		};
		model.addObserver( ctrl );
		model.getMore( ROOM.id , this.lastTime );	

	},
	setLocal:function(){

		var type = this.local.getItem("postType") || this.postType;
		var postTypeMenuA = $('#postTypeMenu a');
		this.postType = type;
		if( type == "1" ){
			postTypeMenuA.eq(1).addClass("on");
			postTypeMenuA.eq(0).removeClass("on");
		}else{
			postTypeMenuA.eq(0).addClass("on");
			postTypeMenuA.eq(1).removeClass("on");
		};

	},
	//保存 localStorage
	local:{

		setItem:function( key ,val){
			localStorage.setItem(key, val);
		},
		getItem:function( key ){
			return localStorage.getItem( key );
		}

	},
	selectAvatar:function(){

		var dialog = new WE.Dialog({
				title:"选择头像",
				id:"selectAvatar"
		});
		dialog.show();

		WE.kit.getTmpl("select_avatar.ejs", function( data ){
			//setTimeout(function(){

				dialog.append( data );
			//},1000);
		});

	}
};


/**
	时间轴操作
*/

WE.pageChat.timeLine = {
	/**
		{
	
			_id
			uid
			uname
			text
			uavatar
			time
			to:{
				_id:
				uid:
				uname:
				text
				uavatar
				to:""
			}
		}
	*/
	tmpl:'<div class="chat">\
		<div class="dot"></div>\
		<div class="photo">\
			<a href="#" data-uid="<%=uid%>" >\
				<img src="<%=uavatar%>" alt="<%=uname%>" />\
			</a>\
		</div>\
		<div class="info">\
			<div class="head">\
				<a href="#" class="name" data-uid="<%=uid%>" ><%=uname%></a>\
			</div>\
			<div class="context">\
				<%if(obj.to){%>\
				<div class="reply-quote"><%= markdown.makeHtml(to.text)%><a href="#"><%= to.uname%></a></div>\
				<%}%>\
				<div><%= markdown.makeHtml(text) %><a data-mid="<%=_id%>" class="chat-reply" href="javascript:void(0);">回复</a></div>\
			</div>\
		</div>\
	</div>',
	/**
		初始化时间轴数据
	*/
	init:function( datas ){
   		var i = 0;
		var len = datas.length;
		var html = "";

		for(; i<len; i++){
			//WE.kit.tmpl(WE.pageChat.timeLine.tmpl)
			html += WE.kit.tmpl( this.tmpl, datas[i] );
		}

		$('#timelineChats').html( html );

		if(len && datas[len-1].time){
			WE.pageChat.lastTime = datas[len-1].time;
		}else{
			WE.pageChat.isLoading = 2;
			WE.pageChat.lastTime = -1;
			//console.log( "lastTime 失败" );
		}
	},
	prepend:function( data ){

		$('#timelineChats').prepend( WE.kit.tmpl( this.tmpl, data ) );

	},

	appends:function( datas ){

		var i = 0;
		var len = datas.length;
		var html = "";

		for(; i<len; i++){
			//WE.kit.tmpl(WE.pageChat.timeLine.tmpl)
			html += WE.kit.tmpl( this.tmpl, datas[i] );
		}

		$('#timelineChats').append( html );

		if(datas[len-1].time){
			WE.pageChat.lastTime = datas[len-1].time;
		}else{

			console.log( "lastTime 失败" );
		}

	},
	/*
		通知时间抽主题或者副标题发生变化
		topic:
		directions：
	
	*/
	noticeTopicUpdate:function( topic, directions ){

	}
};



WE.pageChat.userlist = {

	tmpl:'<li id="uid_<%=_id%>"><a href="#" title="<%=name%>">\
	<img src="<%=avatar%>" width="32"/>\
	</a></li>',
	data:null,
	init:function( data ){

		var i = 0;
		var html = "";

		if(data){

			this.data = data;
			for(; i<data.length; i++){
				html += WE.kit.tmpl(this.tmpl, data[i]);	
			}

			$('#userlist').html( html );
		}

		//this.regEvent();
	},
	regEvent:function(){

		var _this = this;
		var at = new WE.At( $('#postText') );
		//console.log("regEvent");
		at.searchFirends = function( key ){
			//
			var list = [];
			var dataList = _this.data || [];
			var reg = new RegExp(key, "i");
			//console.log( key );
			for(var i=0; i<dataList.length; i++){

				if( reg.test( dataList[i] ) ){

					list.push( dataList[i] );

				};
				
			}
			this.showList( list );
		};

	},
	append:function( data ){
		//如果是自己就不加入到队列
		if(data._id != USER._id){
			if(this.data){
				this.data.push( data )
			}else{

				this.data = [data];
			}
			$('#userlist').append(  WE.kit.tmpl(this.tmpl, data) );
		}
	},
	remove:function( data ){
		var list = this.data;

		$('#uid_'+data._id).remove();

		for(var i=0; i<list.length; i++){

			if(list[i]._id == data._id){
				list.splice( i, 1 );
				break;
			}

		}
		

	}

};


WE.pageChat.reply = {

	init : function(){

		this.setUi();
		this.regEvent();
	},

	regEvent : function(){
		var _this = this;
		this.ui.listCon.delegate( _this.replyBtnClass,'click',function( e ){
			_this.ui.origCon.show();
			var $this = $(e.target),
				origText = $this.closest('.context').find('p').html(),
				origUser = $this.closest('.info').find('.head a').text();
			_this._id = $this.attr('data-mid');
			_this.setReply(origText,origUser);
		});
		this.ui.delBtn.click( _this.delOrig );
	},

	/*
	 * reply初始化时候设置UI对象
	 */
	setUi : function(){
		this.ui = {
			listCon : $('.chat-list'), //包含体
			origCon : $('#orig'),
			origText : $('#orig').find('.origText'), //原文内容
			origUser : $('#orig').find('.origUser'), //原文用户名
			delBtn : $('#orig').find('.origDel'), //删除按钮
			replyBtnClass : '.chat-reply'//回复按钮的Class名称
		}
	},

	/*
	 * 设置一个回复评论框
	 * @param [string] origText : 原文
	 * @param [string] origUser : 原文用户名
	 */
	setReply : function( origText,origUser ){
		var _this = WE.pageChat.reply;
		console.log('_this:',origText,origUser);
		_this.ui.origText.text( origText );
		_this.ui.origUser.text( origUser );
	},


	/*
	 * 删除原文
	 */
	delOrig : function(){
		var _this = WE.pageChat.reply;
		_this.ui.origText.text('');
		_this.ui.origUser.text('');
		_this.ui.origCon.hide();
	},

	isRelply : function(){

		if( !this.ui.origText.text() && !this.ui.origUser ){
			return true;
		}else{
			return false;
		}
	}
}


