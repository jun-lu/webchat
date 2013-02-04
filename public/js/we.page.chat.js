

WE.pageChat = {

	init:function(){

		this.ui = {
			header:$('#header'),
			postBox:$('#postbox'),
			postBoxIn:$('#postboxIn')
		};

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
	}
};


/**
	时间轴操作
*/

WE.pageChat.timeLine = {
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









