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

		//聚焦
		$('#postText').focus();


		// 回复的注册 :ck
		WE.pageChat.reply.init();

		// 初始化History用户列表
		WE.pageChat.userlist.historyList(ROOM.id);

		this.initSendType();
	},

	
	regEvent:function(){

		var _this = this;


		$('#postForm').submit(function(){

			var text = $.trim($('#postTextArea').val());
			var roomid = $('#roomid').val();
			$('#postText').val('');
			//console.log( text, roomid );	
			if(text && roomid){
				_this.post( roomid, text, WE.pageChat.reply._id); // null
				
			}else{
				$('#postText').focus();
			}
			return false;
		});


		/*可以通过ctrl+enter发送*/
		$('#postText').keydown(function( e ){

			if( (e.keyCode == 13 && _this.postType == 2) || 
				(e.ctrlKey && e.keyCode == 13 && _this.postType == 1) ){
				$('#postForm').trigger('submit');
				return false;
			}

		});

		$('#postText').keyup(function(){
			var text = $(this)[0].innerText.replace(/<\/div>/g,"").replace(/<div>/g,"\n").replace(/<br>/g, "\n");
			$('#postTextArea').val( text );
		});

	

		$('#setting').click(function(){
			_this.setRoomInfo( ROOM );
		});

		$('#user-Avator').click(function(){
			_this.selectAvatar( USER );
		})

	

		$(window).bind("scroll", function(){

			if(_this.isLoading == 0){

				var isbottom = $(window).scrollTop() + $(window).height() + 100 > $(document.body).innerHeight();

				if( isbottom ){

					_this.isLoading = 1;
					_this.getMore();

				}

			}
		});


		$('#toggleSendSelect').click(function(){

			$(this).parent().toggleClass("open");
			return false;	
		});
		//postType
		$('#selectSendType a').click(function(){

			localStorage.setItem("sendType", $(this).attr("data-type"));
			$('#toggleSendSelect').parent().removeClass("open");
			_this.initSendType();

		});
	},

	initSendType:function(){

		this.postType = localStorage.getItem("sendType") || 1;
		$('#selectSendType .dui').hide().eq( this.postType == 1 ? 1 : 0 ).show();

	},


	/*
	 * 发布对话信息
	 * @param {string/num} roomid 当前对话房间的id
	 * @param {string} text 对话内容
	 * @param {string} [to] 原对话的id(回复功能需发送) 
	 */
	post:function(roomid, text, to){

		$('#postTypeGroup button').attr('disabled','disabled').text('发送中...');

		to = !to ? undefined : to;
		var _this = this;
		var model = new WE.api.ChatModel();//
		var ctrl = new WE.Controller();
		
		ctrl.update = function( e ){

			var data = e.data;
			if( data.code == 0 ){//post提交成功

				//_this.timeLine.prepend( data.r );
				$('#postText').html('').focus();
				$('#postTypeGroup button').removeAttr('disabled').text('发送');

				WE.pageChat.reply.delOrig();
			}

		};
		model.addObserver( ctrl );

		model.postChat( roomid, text, to );
	},
	
	/*
	 * 修改房间信息
	 * @param {ROOM} room : 当前房间信息
	 */
	setRoomInfo:function( room ){

		var dialog = new WE.Dialog( {
			title:"修改房间信息",
			id:"setRoom",
			width:500,
			height:300
		});
		dialog.show();

		WE.kit.getTmpl("set_room.ejs", function( data ){

			var canForm = true;
			
			var html = WE.kit.tmpl( data,room );
			dialog.append( html );


			var eleRoomName = $('#roomName'),
				eleRoomTopic = $('#roomTopic'),
				eleRoomDes = $('#roomDes'),
				eleRoomid = $('#roomid'),
				eleRoomPwd = $('#roomPwd'),
				eleRoomIsSetLimit = $('#isSetLimit'),
				eleFormRoom = $('#updateRoomForm');

			//设置房间权限的显示
			eleRoomIsSetLimit.change(function(){
				var status = $("input[type='checkbox']").is(':checked');
				if( !status ){
					eleRoomPwd.val('');
					eleRoomPwd.hide();
				}else{
					eleRoomPwd.show();
				}
			});

			//修改访问地址
			eleRoomName.keyup(function(){
				var eleRoomNameTip = $('#roomName-tip'),
					strRoonNameTip = eleRoomNameTip.text(),
					strInput =  $.trim( eleRoomName.val()),
					host = document.location.host + '/';
				eleRoomNameTip.text( host + strInput);
			});

			//检测key是否唯一
			eleRoomName.blur(function(){

				var name = $.trim( eleRoomName.val() );

				if( name != ROOM.name && name != "" ){
					var model = new WE.api.ChatModel();
					var ctrl = new WE.Controller();
					ctrl.update = function(e){
						var data = e.data;
						eleRoomName.removeClass('error');
						if( data.code == 0 ){
							canForm = true;
							eleFormRoom.find('.keyerror').hide();
							eleRoomName.removeClass('error');
						}else{
							canForm = false;
							eleFormRoom.find('.keyerror').text( data.msg ).show();
							eleRoomName.addClass('error');
						}
					}
					model.addObserver( ctrl );
					model.uniqueKey( name );
				}else if( name == "" ){
					canForm = false;
					eleFormRoom.find('.keyerror').text("访问地址不能为空").show();
					eleRoomName.addClass('error');
				}else{
					canForm = true;
					eleFormRoom.find('.keyerror').hide();
					eleRoomName.removeClass('error');
				}			
			});

			//表单提交
			eleFormRoom.submit(function(){
				var id = eleRoomid.val(),
					name = eleRoomName.val(),
					topic = eleRoomTopic.val(),
					des = eleRoomDes.val(),
					password = eleRoomPwd.val();

				//如果并没有设置新的访问地址
				name = name == id ? "" : name;
				if( topic && des && canForm ){
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
					model.updateRoom( id, name, topic, des,password );
				}
				return false;
			});


		
		});
	},

	/*
	 * 鼠标下滚获取更多对话信息
	 */
	getMore:function(){

		$('#timelineLoading').removeClass('hidden');
		var _this = this;
		var model = new WE.api.ChatModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){
			$('#timelineLoading').addClass('hidden');
			var data = e.data;
			if(data.code == 0 && data.result.length){
				_this.isLoading = 0;
				WE.pageChat.timeLine.appends( data.result );
			}else{
				_this.isLoading = 2;//没有数据了
			}

		};
		ctrl.error = function(){
			$('#timelineLoading').addClass('hidden');
		};
		model.addObserver( ctrl );
		model.getMore( ROOM.id , this.lastTime );	

	},

	/*
	 * 修改头像
	 */
	selectAvatar:function( user ){

		var hexMail = user.hexMail;
		var dialog = new WE.Dialog({
				title:"选择头像",
				id:"selectAvatar"
		});
		dialog.show();

		WE.kit.getTmpl("select_avatar.ejs", function( data ){

			dialog.append( data );

			$( '#'+user.gravatarDefault ).attr('checked','checked');

			$('#setAvator').submit(function(){
				submitForm();
				return false;
			});
			$('#setAvator li img').each(function(){
				$(this).attr("src", WE.kit.getAvatar( hexMail, 48, $(this).data("avatar")));
			});
		});

		function submitForm(){

			var gravatarDefault = WE.kit.getRadioValue('gravatarAvatar');

			var model = new WE.api.ChatModel();
			var ctrl = new WE.Controller();
			ctrl.update = function( e ){
				var data = e.data;

				if( data.code == 0 ){
					
					document.location.reload();
				}
			}
			model.addObserver( ctrl );
			model.updateAvator( gravatarDefault );
		}
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
	tmpl:'<div class="chat <% if(uid == USER._id){ %> my <%}%>">\
		<input name="uid" type="hidden" value="<%=uid%>"/>\
		<input name="txt" type="hidden" value="<%=text%>"/>\
		<input name="uname" type="hidden" value="<%=uname%>"/>\
		<input name="mid" type="hidden" value="<%=_id%>"/>\
		<div title="查看其全部对话" class="dot"></div>\
		<div class="photo">\
			<a href="/user/<%=uid%>" target="_blank" data-uid="<%=uid%>" >\
				<img src="<%=uavatar%>" alt="<%=uname%>" class="avatar" />\
			</a>\
		</div>\
		<div class="info">\
			<div class="head">\
				<a href="/user/<%=uid%>" target="_blank" class="name"><%=uname%></a>\
				<span class="time"><%=WE.kit.format( new Date( time*1000 ),"MM-dd hh:mm:ss" )%></span>\
			</div>\
			<div class="context">\
				<%if(obj.to){%>\
				<div class="reply-quote"><%=to.text%> <a href="#"><%= to.uname%></a></div>\
				<%}%>\
				<div class="reply-mine"><%=WE.kit.chatFormate(text)%> <a class="chat-reply" href="javascript:;">回复</a></div>\
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

	/*
	 * 用户发送对话Ajax提交后更新页面数据
	 * @param {object} data : 对话数据
	 */
	prepend:function( data ){

		$('#timelineChats').prepend( WE.kit.tmpl( this.tmpl, data ) );
	},

	/*
	 * 页面初始化加载添加到页面的对话数据
	 * @param {object} datas : 对话数据
	 */
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
	}
};


/**
	用户在线列表
*/
WE.pageChat.userlist = {

	tmpl:'<li id="uid_<%=_id%>"><a href="/user/<%=_id%>" target="_blank" title="<%=name%>">\
	<img src="<%=avatar%>" width="32" class="avatar" />\
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

			$('#userlist').empty().html( html );
		}

		//this.regEvent();
	},
	regEvent:function(){

		var _this = this;
	},

	/*
	 * 用户上线之后添加该用户头像
	 * @param {USER} data : 用户信息 
	 */
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

	/*
	 * 用户下线之后添加该用户头像
	 * @param {USER} data : 用户信息 
	 */
	remove:function( data ){
		var list = this.data;

		$('#uid_'+data._id).remove();

		for(var i=0; i<list.length; i++){

			if(list[i]._id == data._id){
				list.splice( i, 1 );
				break;
			}

		}	
	},


	/*
	 * 房间历史访客
	 * @param {ROOM.id} roomid : 房间id 
	 */
	historyList : function( roomid ){
		var _this = this;

		var model = new WE.api.ChatModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){
			
			var data = e.data,
				html = "";
			if( data.code == 0 ){

				

				for(var i = 0; i<data.result.length; i++){
					html += WE.kit.tmpl(_this.tmpl, data.result[i]);	
				}
				$('#history-list').empty().html( html );
			}
			
			//console.log('data:',data);
		}
		model.addObserver(ctrl);
		model.historyList(roomid);
	}

};


/**
	用户回复功能
*/
WE.pageChat.reply = {
	_id:null,//针对次ID回复

	init : function(){

		this.setUi();
		this.regEvent();
	},

	regEvent : function(){
		var _this = this;
		this.ui.listCon.delegate( _this.ui.replyBtnClass,'click',function( e ){
			_this.ui.origCon.show();
			var $this = $(e.target),
				$chat = $(this).closest('.chat'),
				origText = $chat.find('input[name="txt"]').val(),
				origUser = $chat.find('input[name="uname"]').val();
			_this._id = $chat.find('input[name="mid"]').val();
			_this.ui.to.val( _this._id );
			_this.setReply(origText,origUser);
			$('body').animate({scrollTop:0},600);
			_this.ui.inputText.focus();
			
		});
		this.ui.delBtn.click( _this.delOrig );
	},

	/*
	 * reply初始化时候设置UI对象
	 */
	setUi : function(){
		var container = $('#quote');
		this.ui = {
			listCon : $('#timelineChats'), //包含体
			origCon : container,
			origText : container.find('.quote-text'), //原文内容
			origUser : container.find('.quote-user'), //原文用户名
			delBtn : container.find('.quote-del'), //删除按钮
			replyBtnClass : '.chat-reply',//回复按钮的Class名称
			to : $('#to'), //input hidden to
			inputText : $('#postText')
		}
	},

	/*
	 * 设置一个回复评论框
	 * @param {string} origText : 原文
	 * @param {string} origUser : 原文用户名
	 */
	setReply : function( origText,origUser ){
		var _this = WE.pageChat.reply;
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
		_this.ui.to.val('');
		_this._id = null;
		_this.ui.origCon.hide();
	}
}


