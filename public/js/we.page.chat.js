

WE.pageChat = {

	init:function(){

		this.ui = {
			header:$('#header'),
			postBox:$('#postbox'),
			postBoxIn:$('#postboxIn')
		};
		// 设置全部事件绑定
		this.regEvent();
		// 设置发言框滚动
		this.setPostBoxFixed();
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
	//控制 postbox fixed 效果
	setPostBoxFixed:function(){
		var _this = this;
		var headerHeight = this.ui.header.height();
		var isFixed = false;
		$(window).scroll(function(){

			var scrollTop = $(this).scrollTop();
			if( scrollTop > headerHeight && !isFixed){
				isFixed = true;
				_this.ui.postBox.addClass('post-box-fixed');
				_this.ui.postBox.height( _this.ui.postBoxIn.height() ) ;
			}
			if( scrollTop < headerHeight && isFixed){
				isFixed = false;
				_this.ui.postBox.removeClass('post-box-fixed');
				_this.ui.postBox.css('height', 'auto');
			}	
		})
	},
	regEvent:function(){

		var _this = this;

		$('#postForm').submit(function(){

			var text = $('#postText').val();
			var roomid = $('#roomid').val();	
			if(text && roomid){

				_this.post( roomid, text );

			}
			return false;
		});

		var at = new WE.At( $('#postText') );
		at.searchFirends = function( key ){
			//
			var list = [];
			var dataList = WE.pageChat.onlineUserList;
			var reg = new RegExp(key, "i");
			for(var i=0; i<dataList.length; i++){

				if( reg.test( dataList[i] ) ){

					list.push( dataList[i] );

				};
				
			}
			this.showList( list );
		};
		//$('.searchFirends')
	},
	post:function(roomid, text){

		var _this = this;
		var model = new WE.api.ChatModel();//
		var ctrl = new WE.Controller();
		
		ctrl.update = function( e ){

			var data = e.data;
			if( data.code == 0 ){//post提交成功

				_this.timeLine.prepend( data.r );
				$('#postText').val('');
			}

		};

		model.addObserver( ctrl );

		model.postChat( roomid, text );

	}
};


/**
	时间轴操作
*/

WE.pageChat.timeLine = {
	tmpl:'<div class="chat">\
		<span class="lj-in lj-right"><span class="lj-in lj-span"></span></span>\
		<span class="lj-dot"><span class="lj-d"></span></span>\
		<div class="chat-header">\
			<a href="#" class="user-name"><%=Uname%></a> <span class="time" title="<%=WE.kit.format( time * 1000 )%>" ><%=WE.kit.weTime(time*1000)%></span>\
			<a href="#<%=obj.index%>" class="post-id" >#<%=obj.index%></a>\
		</div>\
		<div>\
			<p><%=text%></p>\
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
	},
	prepend:function( data ){

		$('#timelineChats').prepend( WE.kit.tmpl( this.tmpl, data ) );

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

	tmpl:'<li id="uid_<%=id%>"><a href="#"><%=name%></a></li>',

	init:function( data ){

		var i = 0;
		var html = "";

		if(data){

			for(; i<data.length; i++){
				html += WE.kit.tmpl(this.tmpl, data[i]);	

			}

			$('#userlist').html( html );
		}


	},
	regEvent:function(){

	}

};









