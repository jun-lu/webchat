WE.pageChat = {
	
	/*
		{
			uid
			uname
			review
			uavatar
			to {
					text
					uname
					uid
			   }
			time,
			text

		}
	 */

	chatTmpl : '<% for(var i = 0;i<obj.length;i++){ %>\
					<div class="chat <% if(obj[i].uid == USER._id){ %> my <% } %>">\
						<input name="uid" type="hidden" value="<%=obj[i].uid%>"/>\
						<input name="txt" type="hidden" value="<%=obj[i].text%>"/>\
						<input name="uname" type="hidden" value="<%=obj[i].uname%>"/>\
						<div class="avator">\
							<a href="/user/<%=obj[i].uid%>">\
								<img src="<%=obj[i].uavatar%>" alt="<%=obj[i].uname%>"/>\
							</a>\
						</div>\
						<div class="info">\
							<a class="name" href="/user/<%=obj[i].uid%>"><%=obj[i].uname%> :</a>\
							<div class="talk">\
								<i class="arrow"></i>\
								<% if( obj[i].review ){ %>\
								<div class="review-orig">\
									<span><%=WE.kit.chatFormate(obj[i].to.text) %></span>\
									<a class="u-name" href="/user/<%=to.uid%>"><%=obj[i].to.uname%></a>\
								</div>\
								<% } %>\
								<p><%=WE.kit.chatFormate(obj[i].text)%></p>\
								<p>\
									<a class="review-btn" href="javascript:;">回复</a>\
									<span class="time"><%=WE.kit.format( new Date( obj[i].time * 1000),"MM-dd hh:mm:ss")%></span>\
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

		WE.pageChat.review.init();
	},
	regEvent : function(){
		var _this = this;

		this.ui.setBtn.click(function(){
			alert('设置的按钮');
		});



		$('#sendForm').submit(function(){
			var talk = _this.ui.inputArea.val();

			if( talk ){
				var datas = [
								{
									
									uid : USER._id,
									uname : USER.uname,
									uavatar : USER.uavatar,
									time : new Date().valueOf() / 1000,
									text : talk
								}
							];
				_this.prepend( datas );

				WE.pageChat.review.clear();
				$('#talk-input').val('');
			}
			return false;
		})
	},

	
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


WE.pageChat.review = {

	init : function(){
		this.regEvent();
	},

	reviewOrigTmpl : '<p>\
						<span class="review-cont"><%=text%></span>\
						<a class="review-uname" href="/user/<%=uid%>"><%=uname%></a>\
					  </p>',

	regEvent : function(){

		var _this = this;
		$('#chat-container').delegate('.review-btn','click',function(){
			var chatBox = $(this).closest('.chat'),
				uid = chatBox.find('input[name=uid]').val();
				uname = chatBox.find('input[name=uname]').val(),
				text = chatBox.find('input[name=txt]').val();
				console.log( chatBox.find('input[name=uid]') );
				_this.setOrigData( text,uname,uid );
		});
	},
	setOrigData : function( text,uname,uid ){

		var _this = this,
			reviewBox = $('#review-box');
			reviewBox.empty();
		var html = WE.kit.tmpl( _this.reviewOrigTmpl,{text:text,uid:uid,uname:uname});
		
		$( html ).appendTo( reviewBox );
	},
	clear : function(){
		$('#review-box').empty();
	}

	
}
