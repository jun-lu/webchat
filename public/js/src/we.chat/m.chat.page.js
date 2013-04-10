WE.pageChat = {

	chatTmpl : '<% for(var i = 0;i<obj.length;i++){ %>\
					<div class="chat <% if(uid == USER._id){ %> my <% } %>">\
						<div class="avator">\
							<a href="/user/<%=uid%>">\
								<img src="<%=obj[i].uavatar%>" alt="<%=uname%>"/>\
							</a>\
						</div>\
						<div class="info">\
							<a class="name" href="/user/<%=uid%>"><%=uname%> :</a>\
							<div class="talk">\
								<i class="arrow"></i>\
								<% if( obj[i].review ){ %>\
								<div class="review-orig">\
									<span><%=WE.kit.chatFormate(to.text) %></span>\
									<a class="u-name" href="/user/<%=to.uid%>"><%=obj[i].to.uname%></a>\
								</div>\
								<% } %>\
								<p><%=WE.kit.chatFormate(text)%></p>\
								<p>\
									<a href="javascript:;">回复</a>\
									<span class="time"><%=WE.kit.format( new Date( time * 1000),"MM-dd hh:mm:ss")%></span>\
								</p>\
							</div>\
						</div>\
					</div>\
				<% } %>',

	init : function(){

		this.ui = {
			backBtn : $('#chat-title .back'),
			setBtn : $('#chat-title .setting'),
			container : $('#chat-container'),
			inputArea : $('#talk-input'),
			sendBtn : $('#send-btn')
		}
		this.regEvent();
	},
	regEvent : function(){
		var _this = this;

		this.ui.setBtn.click(function(){
			alert('设置的按钮');
		});

		$('#sendForm').submit(function(){
			var talk = _this.ui.inputArea.val(),
				photo = userInfo.photo;
			// console.log('data:',data);
			if( talk ){
				// var datas = [{photo:photo,talk:talk}];
				_this.prepend( datas );
			}
			return false;
		})
	},

	/*
	 	datas
	 	[
	 		{
				photo:photo,
				talk:talk
	 		},
	 		...
	 	]
	 */
	/*发表时候prepend数据*/
	prepend : function( datas ){
		var _this = this;
		var html = WE.kit.tmpl( _this.chatTmpl,datas );
		// console.log('html:',html,_this.ui.container);
		$( html ).prependTo( _this.ui.container );
	},
	append : function( datas ){
		var _this = this;
		var html = WE.kit.tmpl( _this.chatTmpl,datas );
		// console.log('html:',html,_this.ui.container);
		$( html ).appendTo( _this.ui.container );
	},

	clear : function(){
		this.ui.inputArea.val('');
	},

	post : function(roomid,text,to){

		var _this = this;
			_this.ui.sendBtn.attr('disabled','disabled').text('发送中...');

		to = !to ? undefined : to;

		var model = new WE.api.ChatModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			var data = e.data;
			if( data.code == 0 ){

				_this.ui.inputArea.val('');
				_this.ui.sendBtn.removeAttr('disabled').text('发送');
			}
		}
		model.addObserver( ctrl );
		model.postChat( roomid,text,to );
	}
}
