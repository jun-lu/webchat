WE.pageChat = {

	isLoading:0,
	lastTime:null,
	replyTo:null,
	init: function(){

		this.ui = {
			postBox: $('#post-box'),
			replayBox: $('#replay-box')
		};

		this.regEvent();
	},

	regEvent: function(){

		var _this = this;

		this.ui.postBox.find('.text-box input').keyup(function( e ){

			if( e.keyCode == 13 ){

				var text = $.trim( $(this).val() );
				_this.post( ROOM.id, text, _this.replyTo );
			}

		});


		$('#timeline-bar').bind('scroll', function(){

			var $this = $(this);

			if( _this.isLoading == 0 ){

				if( $this.scrollTop() == 0 && WE.pageChat.timeLine > 0 ){

					_this.isLoading = 1;
					_this.getMore();
				}
			}
		});
	},


	/* 
		鼠标滚动获取更多信息 
	*/
	getMore: function(){

		$('#timeline-talks .more-talks').removeClass('hidden');

		var _this = this;
		var model = new WE.api.ChatModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){
			// $('#timelineLoading').addClass('hidden');
			$('#timeline-talks .more-talks').addClass('hidden');
			var data = e.data;
			if(data.code == 0 && data.result.length){

				_this.isLoading = 0;
				WE.pageChat.timeLine.leave_count =  WE.pageChat.timeLine.leave_count - data.result.length;
				WE.pageChat.timeLine.prepends( data.result );
			}else{
				_this.isLoading = 2;//没有数据了
			}

		};
		ctrl.error = function(){
			$('#timeline-talks .more-talks').addClass('hidden');
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

		aim = to == null ? undefined : to;
		var _this = this;
		var model = new WE.api.ChatModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			var data = e.data;
			if( data.code == 0 ){
				_this.ui.postBox.find('.text-box input').val('');

				_this.hideReply();
			}
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
	},

	hideReply: function(){

		this.ui.replayBox.empty();
		this.ui.replayBox.addClass('hidden');
	},

	replyTmpl: '<div class="replay-box">\
					<div class="arrow"></div>\
					<span class="icon-close close-btn"></span>\
					<div>\
						<a href="/user/<%=from._id%>" class="name"><%=from.name == ""? "(暂无昵称)" : from.name %></a>\
					</div>\
					<div class="context"><%=text %></div>\
				</div>'
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
	tmpl:  '<div class="talk <% if( from._id == USER._id ){ %> me <% } %>">\
				<div class="photo">\
					<a href="/user/<%=from._id%>" target="_blank" data-uid="<%=from._id%>">\
						<img src="<%=from.avatar%>">\
					</a>\
				</div>\
				<div class="info">\
					<div class="head">\
						<a href="/user/<%=from._id%>" target="_blank" class="name <% if(from.name==""){ %> no-name <% } %>"><%= from.name == ""? "(暂无昵称)" : from.name %></a>\
						<a target="_blank" href="/d/<%=_id%>" class="time">\
							<%=WE.kit.format( new Date( time*1000 ),"MM-dd hh:mm:ss" )%>\
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

		if(len && datas[len-1].time){
			WE.pageChat.lastTime = datas[len-1].time;
		}else{
			WE.pageChat.isLoading = 2;
			WE.pageChat.lastTime = -1;
			//console.log( "lastTime 失败" );
		}

		$('#timeline-talks').delegate('.chat-reply','click',function(){

			console.log('_this.mapData[id]',_this.mapData[id]);
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
		this.mapData[ data._id ] = data;
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

		if(datas[len-1].time){
			WE.pageChat.lastTime = datas[len-1].time;
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

		$('#timeline-talks').prepend( html );

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

	tmpl:  '<li id="uid_<%=_id%>" class="<% if( _id == USER._id){ %> me <% } %><% if( typeof obj.online != "undefined" ){ %> insert-li <% } %>" >\
				<a href="/user/<%=_id%>" target="_blank"  class="name <% if(name == ""){ %>no-name<% } %>" >\
					<img src="<%=avatar%>"><%= name == ""? "(暂无昵称)" : name%>\
				</a>\
				<% if( _id != USER._id ){ %>\
				<a href="javascript:;" title="邀请加入私密聊天" class="icon-talk"></a>\
				<% } %>\
			</li>',
	data: null,
	init: function(data){

		var i = 0;
		var html = "";

		if(data){

			this.data = data;
			for(; i<data.length; i++){
				html += WE.kit.tmpl(this.tmpl, data[i]);	
			}

			$('#user-list').empty().html( html );
		}
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
			$('#user-list').append(  html );
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
			activeBtn: $('#history-btn'),
			hideBtn: $('#history-hide')
		}

		this.regEvent();
	},

	regEvent: function(){

		var _this = this;

		this.ui.activeBtn.click(function(){

			_this.displayHistory();
		});

		this.ui.hideBtn.click(function(){

			_this.hideHistory();
		});
	},

	displayHistory: function(){

		var _this = this;


		if( !this.isLoadData ){

			var model = new WE.api.ChatModel();
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

		setTimeout(function(){
			_this.ui.hideBtn.css('top','0px');
		},500);
		this.ui.wall.css('top','0px');
	},

	hideHistory: function(){
		var _this = this;
		this.ui.hideBtn.css('top','-30px');
		setTimeout(function(){
			_this.ui.wall.css('top','100%')
		},500);
	}
}

