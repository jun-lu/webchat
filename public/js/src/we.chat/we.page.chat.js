WE.pageChat = {

	isLoading:0,
	lastTime:null,
	replyTo:null,
	isPosting:0,
	eleId:1,
	postList:[],
	isPostInputFocus:true,
	init: function(){

		this.ui = {
			postBox: $('#post-box'),
			replayBox: $('#replay-box')
		};


		WE.pageChat.tabSelect.init();

		this.regEvent();
	},

	regEvent: function(){

		var _this = this;

		this.ui.postBox.find('.text-box input').keyup(function( e ){

			if( e.keyCode == 13 ){

				var text = $.trim( $(this).val() );

				if( text !="" && !_this.isPosting ){
					_this.post( ROOM.id, text, _this.replyTo );

					_this.postList.push(_this.eleId);

					WE.pageChat.timeLine.append( {
						eleId:'my-talk-' + _this.eleId,
						_id: "",
						aim: null,
						del: 0,
						from:{
							_id: USER._id,
							avatar: USER.avatar,
							name: USER.name,
							summary: USER.summary
						},
						roomid: ROOM.id,
						text: text,
						time: '...',
						to: "*"
					} );



					_this.eleId++;
				}
				
			}

		});


		$('#timeline-bar').bind('scroll', function(){

			var $this = $(this);

			if( _this.isLoading == 0 ){

				if( $this.scrollTop() == 0 ){

					if( WE.pageChat.timeLine.leave_count > 0 ){
						_this.isLoading = 1;
						_this.getMore();
					}
				}
			}else if( _this.isLoading == 2 ){

				if( $this.scrollTop() == 0 ){
					_this.noMoreTips();
				}
			}
		});


		this.ui.postBox.find('.text-box input').focus(function(){

			_this.isPostInputFocus = true;

		}).blur(function(){
			_this.isPostInputFocus = false;
		});


		$(window).keydown(function( e ){

			
			if( e.keyCode == 13 ){
				
				if( !_this.isPostInputFocus ){
					_this.ui.postBox.find('.text-box input').css('background','#FFF8C5');
					setTimeout(function(){
						_this.ui.postBox.find('.text-box input').css('background','none');
					},1500);
				}


				_this.ui.postBox.find('.text-box input').focus();
				_this.ui.postBox.find('.text-box input').keyup();
			}
				
		});
	},

	tipsTimeout:null,
	noMoreTips: function(){

		clearTimeout( this.tipsTimeout);

		$('#more-talks .tips').text('没有更多信息了...');
		$('#more-talks').fadeIn();

		this.tipsTimeout = setTimeout(function(){
			$('#more-talks').fadeOut();
		},2000);
		
	},


	/* 
		鼠标滚动获取更多信息 
	*/
	getMore: function(){

		//$('#more-talks').removeClass('hidden');

		$('#more-talks').fadeIn();


		var _this = this;
		var model = new WE.api.RoomModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){
			// $('#timelineLoading').addClass('hidden');
			
			var data = e.data;
			setTimeout(function(){
				if(data.code == 0 && data.result.length){

					_this.isLoading = 0;
					WE.pageChat.timeLine.leave_count =  WE.pageChat.timeLine.leave_count - data.result.length;
					WE.pageChat.timeLine.prepends( data.result );

					
				}else{
					_this.isLoading = 2;//没有数据了
				}
				//$('#more-talks').addClass('hidden');

				$('#more-talks').fadeOut();
			},500);
			

		};
		ctrl.error = function(){
			//$('#more-talks').addClass('hidden');

			$('#more-talks').fadeOut();
			//$('#timelineLoading').addClass('hidden');
		};
		model.addObserver( ctrl );
		model.getMore( ROOM.id , this.lastTime );	
	},


	/*
	 * 发布对话信息
	 * @param {string/num} roomid 当前对话房间的id
	 * @param {string} text 对话内容
	 * @param {string} [to] 原对话的id(回复功能需发送) 
	 */
	post: function(roomid, text, to){

		var _this = this;
		this.isPosting = true;

		aim = to == null ? undefined : to;
		var _this = this;
		var model = new WE.api.RoomModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			var data = e.data;
			if( data.code == 0 ){
				_this.ui.postBox.find('.text-box input').val('');

				_this.hideReply();
			}

			_this.replyTo = null;
			_this.isPosting = false;
		}
		model.addObserver( ctrl );
		model.postChat( roomid, text, aim );
	},

	setReply: function( chat ){
		var _this = this;
		this.replyTo = chat['_id'];
		this.ui.replayBox.html(  WE.kit.tmpl( this.replyTmpl,chat ) );
		this.ui.replayBox.removeClass('hidden');
		this.ui.replayBox.find('.close-btn').click(function(){
			_this.ui.replayBox.empty();
			_this.ui.replayBox.addClass('hidden');
		});
		this.ui.postBox.find('.text-box input').focus();
	},

	hideReply: function(){

		this.ui.replayBox.empty();
		this.ui.replayBox.addClass('hidden');
	},

	replyTmpl: '<div class="replay-box">\
					<div class="arrow"></div>\
					<span class="icon-close close-btn"></span>\
					<div>\
						<a href="/user/<%=from._id%>" target="_blank" class="name"><%=from.name == ""? "(暂无昵称)" : from.name %></a> : \
					</div>\
					<div class="context"><%=text %></div>\
				</div>'
};

/**
	房间的开启
*/
WE.pageChat.activation = {

	init: function(){

		this.ui = {
			openBtn: $('#activation-open-btn')
		}

		this.regEvent();
	},

	regEvent: function(){

		var _this = this;

		this.ui.openBtn.click(function(){

			_this.open();
		});
	},

	open: function(){

		var model = new WE.api.RoomModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			var data = e.data;

			if( data.result ){

				location.reload();
			}
		}
		model.addObserver(ctrl);
		model.setRoomOpen(ROOM.id);
	},

	close: function(){

		var model = new WE.api.RoomModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			var data = e.data;

			if( data.result ){

				location.reload();
			}
		}
		model.addObserver(ctrl);
		model.setRoomClose(ROOM.id);
	}
}

/**
	登录
*/
WE.pageChat.login = {

	isLogin:false,

	init: function( ){

		this.ui = {
			nickNameInput: $('#login-nickname-input'),
			nickNameBtn: $('#login-nickname-btn'),

			nickNameWall: $('#login-nickname-wall')
		}

		this.regEvent();
	},

	regEvent: function(){

		var _this = this;

		this.ui.nickNameInput.keyup(function(e){

			var value = $.trim( _this.ui.nickNameInput.val() );

			if( value != "" ){
				_this.ui.nickNameBtn.find('.icon-go').addClass('icon-go-click');
			}else{
				_this.ui.nickNameBtn.find('.icon-go').removeClass('icon-go-click');
			}

			if( e.keyCode == 13 ){
				var nickName = value;
				if( nickName != "" && !_this.isLogin ){
					_this.ui.nickNameBtn.find('.icon-go').removeClass('icon-go-click');
					_this.nickNameLogin( nickName );
				}	
			}
		});

		this.ui.nickNameBtn.click(function(){

			var nickName = $.trim( _this.ui.nickNameInput.val() );

			if( nickName != "" ){
				_this.ui.nickNameBtn.find('.icon-go').removeClass('icon-go-click');
				_this.nickNameLogin( nickName );
			}
		});

	},

	nickNameLogin: function( nickName ){
		var _this = this;
			_this.isLogin = true;
			_this.ui.nickNameBtn.find('.icon-go').addClass('hidden');
			_this.ui.nickNameBtn.find('.icon-loading').removeClass('hidden');
		var model = new WE.api.UserModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			var data = e.data;

			if( data.code == 0 ){
				$('#wall-room').removeClass('login-style');


				location.reload();	
			}else{

			}

			setTimeout(function(){
				_this.isLogin = false;
				_this.ui.nickNameBtn.find('.icon-go').removeClass('hidden');
				_this.ui.nickNameBtn.find('.icon-loading').addClass('hidden');
			},1000)

		};
		model.addObserver( ctrl );
		model.updateUserName( nickName );
	}
};

/**
	时间轴操作
*/
WE.pageChat.timeLine = {
	/**
		{
			from
			{
				_id
			},
			aim
		}
	*/
	tmpl:  '<div class="talk <% if( from._id == USER._id ){ %> me <% } %>" <% if( typeof obj.eleId != "undefined" ){ %> id="<%=obj.eleId %>" <% } %>>\
				<div class="photo">\
					<a href="/user/<%=from._id%>" target="_blank" data-uid="<%=from._id%>">\
						<img src="<%=from.avatar%>">\
					</a>\
				</div>\
				<div class="info">\
					<div class="head">\
						<a href="/user/<%=from._id%>" target="_blank" class="name <% if(from.name==""){ %> no-name <% } %>"><%= from.name == ""? "(暂无昵称)" : from.name %></a>\
						<a target="_blank" href="/d/<%=_id%>" class="time">\
							<% if( time == "..." ){ %>\
								...\
							<% }else{ %>\
								<%=WE.kit.weFormat( time*1000 ) %>\
							<% } %>\
						</a>\
					</div>\
					<% if(obj.aim){ %>\
					<div class="reply"><%=aim.text%></div>\
					<% } %>\
					<div class="context">\
						<%=WE.markdown.format(text)%><a href="javascript:;" data-mid="<%=_id%>" class="icon-reply chat-reply" title="回复"></a>\
					</div>\
				</div>\
			</div>',
	mapData:{},
	/**
		初始化时间轴数据
	*/
	init: function( datas,chats_count ){
		var _this = this;
   		var i = 0;
		var len = datas.length;

		_this.chats_count = chats_count;
		_this.leave_count = chats_count > 30 ? chats_count - 30  : 0 ;

		for(; i<len; i++){
			//WE.kit.tmpl(WE.pageChat.timeLine.tmpl)
			this.mapData[ datas[i]._id ] = datas[i];
		}

		this.appends( datas );

		if(len && datas[0].time){
			WE.pageChat.lastTime = datas[0].time;
		}else{
			WE.pageChat.isLoading = 2;
			WE.pageChat.lastTime = -1;
			//console.log( "lastTime 失败" );
		}

		$('#timeline-talks').delegate('.chat-reply','click',function(){

			var id = $(this).attr('data-mid');
			chat = _this.mapData[id];
			if(chat){
				// do replay
				WE.pageChat.setReply( chat );
			}
		});
	},

	/*
	 * 用户发送对话Ajax提交后更新页面数据
	 * @param {object} data : 对话数据
	 */
	append:function( data ){

		if( this.mapData[ data._id ] != "" ){

			this.mapData[ data._id ] = data;
		}
		
		$('#timeline-talks').append( WE.kit.tmpl( this.tmpl, data ) );
		$('#timeline-bar').scrollTop(99999);
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
			this.mapData[ datas[i]._id ] = datas[i];
			html += WE.kit.tmpl( this.tmpl, datas[i] );
		}

		$('#timeline-talks').append( html );

		if(datas[0] && datas[0].time){
			WE.pageChat.lastTime = datas[0].time;
		}else{

			console.log( "lastTime 失败" );
		}

		$('#timeline-bar').scrollTop(99999);
	},

	prepends: function( datas ){

		var i = 0;
		var len = datas.length;
		var html = "";

		for(; i<len; i++){
			//WE.kit.tmpl(WE.pageChat.timeLine.tmpl)
			this.mapData[ datas[i]._id ] = datas[i];
			html += WE.kit.tmpl( this.tmpl, datas[i] );
		}

		//$('#timeline-talks .more-talks').insertAfter( html );
		var  wall = $( html );
		wall.insertAfter( $('#more-talks') );

		var topPx = 0;
		$.each(wall,function(i,item ){
			topPx += item.offsetHeight;
		});

		$('#timeline-bar').scrollTop(topPx-20);
		
		if(datas[0].time){
			WE.pageChat.lastTime = datas[0].time;
		}else{

			console.log( "lastTime 失败" );
		}

	},

	updatePost: function( id, data ){

		this.mapData[ data._id ] = data;


		var talk = $('#my-talk-'+id);
			talk.find('.chat-reply').attr('data-mid',data._id);
			talk.find('.time').text( WE.kit.weFormat( data.time*1000 ) );
	}
};


WE.pageChat.tabSelect = {

	init: function(){

		this.ui = {

			tab: $('#tab-select'),
			content: $('#tab-content')
		}

		this.regEvent();
	},

	regEvent: function(){

		var _this = this;

		this.ui.tab.find('a').click(function(){

			_this.ui.content.find('.tab-wall-cell').hide();
			_this.ui.tab.find('a').removeClass('select');
			$(this).addClass('select');
		});
	}
}

/**
	用户在线列表
*/
WE.pageChat.userlist = {

	tmpl:  '<li id="uid_<%=_id%>" class="<% if( _id == USER._id){ %> me <% } %><% if( typeof obj.online != "undefined" ){ %> insert-li <% } %>" >\
				<a href="/user/<%=_id%>" target="_blank"  class="name <% if(name == ""){ %>no-name<% } %>" >\
					<img src="<%=avatar%>"><%= name == ""? "(暂无昵称)" : name%>\
				</a>\
			</li>',
	data: null,
	init: function(data){

		var i = data.length-1;
		var html = "";

		if(data){

			this.data = data;

			html += WE.kit.tmpl(this.tmpl, USER);
			for(; i>=0; i--){

				if( this.data[i]._id != USER._id ){
					html += WE.kit.tmpl(this.tmpl, data[i]);	
				}	
				
			}

			$('#user-list').empty().html( html );
		}

		this.ui = {
			onlineBtn: $('#online-btn'),
			content: $('#online')
		};
		
		this.regEvent();
	},

	regEvent: function(){

		var _this = this;

		this.ui.onlineBtn.click(function(){

			_this.ui.content.show();
		});


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

			data.online = true;
			var html = WE.kit.tmpl(this.tmpl, data);
			setTimeout(function(){
				$( '#uid_'+data._id ).removeClass('insert-li');
			},300);
			$('#user-list li').eq(0).after(  html );
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
	}
};


/**
	历史在线用户列表
*/
WE.pageChat.historylist = {

	isLoadData: false,

	tmpl:  '<li>\
			    <a href="/user/<%=_id%>" target="_blank" title="<%=name%>">\
					<img src="<%=avatar%>">\
				</a>\
		    </li>',

	init: function(){

		this.ui = {
			wall: $('#history'),
			list: $('#history-list'),
			activeBtn: $('#history-btn')
		}

		this.regEvent();
	},

	regEvent: function(){

		var _this = this;

		this.ui.activeBtn.click(function(){

			_this.displayHistory();
		});
	},

	displayHistory: function(){

		var _this = this;


		if( !this.isLoadData ){

			var model = new WE.api.RoomModel();
			var ctrl = new WE.Controller();
			ctrl.update = function( e ){
				
				var data = e.data,
					html = "";
				if( data.code == 0 ){

					_this.isLoadData = true;

					for(var i = 0; i<data.result.length; i++){
						html += WE.kit.tmpl(_this.tmpl, data.result[i]);	
					}
					_this.ui.list.empty().html( html );


				}
			}
			model.addObserver(ctrl);
			model.historyList( ROOM.id );
		}


		this.ui.wall.show();
	}
};




/**
	邀请
*/
WE.pageChat.invite = {

	selectList:{
		mail:[],
		user:[]
	},
	datas:[],
	isGetData:false,
	isSending:false,
	mailInputList:[],

	init: function(){


		var inviteWall = $('#invite');

		this.ui = {
			wall: $('#wall-room'),
			inviteWall: inviteWall,
			boot: $('#invite-btn'),
			close: inviteWall.find('.js-close-btn'),
			usersList: $('#users-list'),
			emailInput: inviteWall.find('.email-input'),
			emailTips: inviteWall.find('.email-input .error-tips'),
			submit: $('#invite-submit')
		};

		this.regEvent();
	},

	regEvent: function(){

		var _this = this;

		this.ui.boot.click(function(){

			_this.ui.wall.addClass('invite-style');
			_this.ui.close.find('i').addClass('animate');

			if( !_this.isGetData ){
				_this.getUserList();
			}else{
				_this.addUsers(_this.datas);
			}
		});

		this.ui.close.click(function(){

			_this.ui.wall.removeClass('invite-style');
			_this.ui.usersList.empty();
			_this.ui.emailInput.find('input').val('');
			_this.selectList.mail = [];
			_this.selectList.user = [];
			_this.ui.close.removeClass('animate');
		});

		this.ui.usersList.find('.cell').click(function(){

			var $this = $(this);
			var index = $this.index();
			

			var isSelect = $this.hasClass('select-cell');

			isSelect ? $this.removeClass('select-cell') : $this.addClass('select-cell');
			isSelect ? $this.find('.select').addClass('hidden') : 
					   $this.find('.select').removeClass('hidden');
			isSelect ? $this.find('.invite').show() :
					   $this.find('.invite').hide();

		});

		this.ui.emailInput.find('input').keyup(function( e ){

			var value = $.trim( _this.ui.emailInput.find('input').val() );

			if( e.keyCode == 13 && value != "" ){

				if( !/^[^@]+@[^@]+$/.test( value ) ){

					_this.ui.emailTips.text("Please input email").show();
						setTimeout(function(){
							_this.ui.emailTips.hide();
						},2000);
					return false;
				}

				var len = _this.selectList.mail.length;
				var list = _this.selectList.mail;
				var flag = false;

				for( var i=0;i<len; i++ ){

					if( list[i].mail == value ){
						flag = true;
						_this.ui.emailTips.text('邮箱已经存在').show();
						setTimeout(function(){
							_this.ui.emailTips.hide();
						},2000);
						break;
					}
				}

				if( !flag ){
					_this.addUser( {mail:value},true );
					
				}

				_this.ui.emailInput.find('input').val('');	
			}
		});

		this.ui.emailInput.find('input').focus(function(){
			_this.ui.emailTips.hide();
		});


		this.ui.submit.click(function(){

			if( _this.selectList.mail.length ||
				_this.selectList.user.length  ){

				if( !_this.isSending ){
					_this.invitePost();
				}
				
			}
		});
	},


	addUser: function( data,select ){

		var user = new WE.pageChat.inviteCell( data,select );
			user.prepend( this.ui.usersList );

	},


	addUsers: function( datas ){

		var len = datas.length;

		for( var i=0; i<len; i++){

			this.addUser(datas[i].to,false);
		}
	},


	getUserList: function(){

		var _this = this;
		var model = new WE.api.UserModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			var data = e.data;

			if( data.code == 0 ){
				_this.isGetData = true;
				_this.datas = data.result;
				_this.addUsers(_this.datas);
			}
			
		}
		model.addObserver(ctrl);
		model.getContactList();
	},


	invitePost: function(){

		var _this = this;

		this.isSending = true;

		this.ui.submit.text('发送中...');

		var model = new WE.api.RoomModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			_this.isSending = false;
			_this.ui.submit.text('发送邀请');
			_this.ui.emailInput.find('input').val('');
			_this.selectList.user = [];
			_this.selectList.mail = [];

			var data = e.data;

			if( data.code == 0 ){
				_this.ui.emailInput.find('.invite-tips').text('已经成功发送邀请').show();
			}else{
				_this.ui.emailInput.find('.invite-tips').text('发送邀请失败').show();
			}

			_this.ui.usersList.empty();
			setTimeout(function(){

				_this.ui.emailInput.find('.invite-tips').hide();
				_this.addUsers(_this.datas);
			},3000);
		}
		model.addObserver(ctrl);
		model.inviteChat(_this.selectList.user, _this.selectList.mail, ROOM.id );

	}
};


WE.pageChat.inviteCell = function( data,select ){

	this.data = data;
	this.select = select || false;


	this.isUserList = typeof data.name != "undefined" ? true : false;

	this.list = this.isUserList ? WE.pageChat.invite.selectList.user :
							WE.pageChat.invite.selectList.mail ;

	

	this.listIndex = this.list.length;


	var html = WE.kit.tmpl(this.itemTmpl,{
		user:this.data,
		select:select
	});

	


	wall = $(html);

	this.ui = {
		wall: wall,
		invite: wall.find('.invite-js-btn'),
		cell: wall.find('.cell')
	}


	if( this.select ){
		this.addUser();
	}

	this.init();
};

WE.pageChat.inviteCell.prototype = {

	itemTmpl:'<li>\
				<div class="cell <% if( select ){ %> select-cell <% } %>">\
					<% if( typeof user.avatar != "undefined" ){ %>\
					<img src="<%=user.avatar %>">\
					<% } %>\
					<% if( typeof user.name != "undefined" && user.name == "" ){ %>\
						<% user.name = "(未设置昵称的小伙伴)"; %>\
					<% } %>\
					<%=user.name || user.mail %>\
					<% if( select ){ %>\
						<div class="invite-js-btn">\
							<span class="select select-type">√</span>\
							<span class="btn invite-type invite" style="display:none;">邀请</span>\
						</div>\
					<% }else{ %>\
						<div class="invite-js-btn">\
							<span class="select select-type hidden">√</span>\
							<span class="btn invite-type invite">邀请</span>\
						</div>\
					<% } %>\
				</div>\
			</li>',

	init: function(){

		this.regEvent();
	},

	regEvent: function(){

		var _this = this;

		this.ui.cell.click(function(){

			_this.select = _this.select == true ? false : true;

			if( _this.select ){

				_this.ui.invite.find('.select-type').removeClass('hidden');
				_this.ui.invite.find('.invite-type').hide();

				_this.ui.cell.addClass('select-cell');

				_this.addUser();
			}else{

				_this.ui.invite.find('.select-type').addClass('hidden');
				_this.ui.invite.find('.invite-type').show();

				_this.ui.cell.removeClass('select-cell');

				_this.removeUser();
			}
		});
	},

	prepend: function( jDom ){
		jDom.prepend( this.ui.wall );
	},

	addUser: function(){

		this.isUserList ? this.list.push(this.data._id) : this.list.push(this.data.mail);
		
	},

	removeUser: function(){

		var len = this.list.length;
		for(var i=0; i<len; i++){

			if( this.isUserList ){
				if( this.data._id && this.data._id == this.list[i] ){

					this.list.splice(i,1);
				}
			}else{
				if( this.data.mail && this.data.mail == this.list[i] ){

					this.list.splice(i,1);
				}
			}
			
		}

	}
}



/* room edit */
WE.pageChat.roomEdit = {

	isEditType: false,
	init: function(){

		this.ui = {
			boot: $('#room-edit-boot'),
			box: $('#room-edit-box'),
			titleBox: $('#title-box'),
			checkpwd: $('#checkpwd'),
			password: $('#password'),
			topic: $('#topic-name'),
			form: $('#room-edit-form')
		}

		this.regEvent();
	},


	regEvent: function(){

		var _this = this;

		this.ui.boot.click(function(){

			if( _this.isEditType ){

				_this.isEditType = false;

				_this.ui.boot.text('编辑');
				_this.ui.box.find('.close-btn').click();

			}else{

				_this.isEditType = true;


				_this.ui.boot.text('取消');
				_this.clear();

				_this.ui.titleBox.height('100%');
				_this.ui.topic.focus();
				_this.ui.box.show();
			}
			
		});

		this.ui.box.find('.close-btn').click(function(){

			_this.ui.titleBox.height('auto');
			_this.ui.box.hide();
		});

		this.ui.box.find('.topic-edit-submit').click(function(){


			var topic = $.trim( _this.ui.topic.val() );
			var password = $.trim( _this.ui.password.val() );

			if( topic != "" ){
				_this.post( ROOM.id, topic, password );
				return false;
			}
		});

		this.ui.checkpwd.change(function(){

			var value = _this.ui.checkpwd.is(':checked');

			if( !value ){

				_this.ui.password.hide();
				_this.ui.password.val('');
				return false;
			}

			_this.ui.password.show();
		});
	},

	post: function( id, topic, password ){

		var _this = this;

		var model = new WE.api.RoomModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			var data = e.data;
			if( data.code == 0 ){
				location.reload();
			}
		}
		model.addObserver(ctrl);
		model.updateRoomBase( id, topic, password );
	},

	clear: function(){

		ROOM.password == null ? this.ui.password.hide() 
							  : this.ui.password.show();

		ROOM.password != null ? this.ui.checkpwd.attr('checked','checked')
							  : this.ui.checkpwd.removeAttr('checked');

		this.ui.password.val( ROOM.password == null ? "" : ROOM.password );
		this.ui.topic.val( ROOM.topic )
	}


}


/* video chat */
WE.pageChat.videoChat = {

	init: function(){

		this.ui = {

			boot: $('#video-chat'),
			roomWall: $('#wall-room'),
			videoWall: $('#video-wall')
		}

		this.regEvent();
	},

	regEvent: function(){

		var _this = this;

		this.ui.boot.click(function(){

			_this.boot();
			_this.setOnVideoBoot();
		});	
	},

	boot: function(){

		var _this = this;

		this.ui.roomWall.addClass('video-style');
		this.ui.videoWall.show();

		var videoChat = new WE.pageChat.VideoModule( 'video-wall' );
			videoChat.onClose = function(){
				_this.ui.roomWall.removeClass('video-style');
				_this.setOffVideoBoot();
				_this.ui.videoWall.hide();
			}
	},

	setOnVideoBoot: function(){

		this.ui.boot.find('i').addClass('video-active').attr('title','视频已经开启');

	},

	setOffVideoBoot: function(){

		this.ui.boot.find('i').removeClass('video-active').attr('title','点击开启视频聊天');
	}
};

WE.pageChat.VideoModule = function( parentId ){

	var _this = this;

	this.parentId = parentId;

	WE.kit.getTmpl('video-chat.ejs',function( tmpl ){

		var wall = $( tmpl );

		_this.ui = {

			wall: wall,
			close: wall.find('.js-close'),
			view: wall.find('.js-view'),
			list: wall.find('.js-list')
		};

		_this.setList();
		_this.html( _this.parentId );

		_this.regEvent();
	});
}

WE.pageChat.VideoModule.prototype = {


	itemTmpl: '<div class="item <% if( typeof isMe != "undefined" ){ %> item-me <% } %>">\
					<video></video>\
					<div class="tabs">\
						<i class="arrow"></i>\
						<a class="name" target="_blank" title="CK.Ming" href="http://www.baidu.com">( Me )</a>\
						<% if( typeof isMe != "undefined" ){ %>\
							<span class="js-mike mike">\
								<i class="icon-onmike"></i>\
							</span>\
						<% }else{ %>\
							<span class="js-sound sound">\
								<i class="icon-onsound"></i>\
							</span>\
						<% } %>\
					</div>\
				</div>',

	regEvent: function(){

		var _this = this;

		_this.ui.close.click(function(){
			_this.close();
		});
	},

	close: function(){

		this.ui.wall.remove();
		this.onClose();
	},

	onClose: function(){},

	html: function( id ){

		$( '#'+id ).html( this.ui.wall );
	},

	setList: function(){

		var html = '';
			html += WE.kit.tmpl( this.itemTmpl,{isMe:true} );

		for(var i=0; i<3;i++){

			html += WE.kit.tmpl( this.itemTmpl,{} );
		}
		this.ui.list.html( html );
	}
}
