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
						<input name="mid" type="hidden" value="<%=obj[i]._id%>"/>\
						<div class="avator">\
							<a href="/user/<%=obj[i].uid%>">\
								<img width="32" height="32" src="<%=obj[i].uavatar%>" alt="<%=obj[i].uname%>"/>\
							</a>\
						</div>\
						<div class="info">\
							<div class="talk">\
								<i class="arrow"></i>\
								<div class="talk-cont">\
									<% if( obj[i].to ){ %>\
									<div class="review-orig">\
										<span><%=WE.kit.chatFormate(obj[i].to.text) %></span>\
										<a class="u-name" href="/user/<%=obj[i].to.uid%>"><%=obj[i].to.uname%></a>\
									</div>\
									<% } %>\
									<a class="name" href="/user/<%=obj[i].uid%>"><%=obj[i].uname%> : </a><%=WE.kit.chatFormate(obj[i].text)%>\
								</div>\
								<p class="review-time">\
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
		WE.pageChat.lazyloadData.init();
	},
	regEvent : function(){
		var _this = this;

		this.ui.setBtn.click(function(){
			alert('设置的按钮');
		});



		$('#sendForm').submit(function(){
			var text = _this.ui.inputArea.val();

			if( text ){
				// var datas = [
				// 				{
									
				// 					uid : USER._id,
				// 					uname : USER.uname,
				// 					uavatar : USER.uavatar,
				// 					time : new Date().valueOf() / 1000,
				// 					text : talk
				// 				}
				// 			];
				console.log(WE.pageChat.review._id);
				_this.post( ROOM.id,text, WE.pageChat.review._id );
				// _this.prepend( datas );

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

		if( datas ){
			var html = WE.kit.tmpl( _this.chatTmpl,datas );
			// console.log('html:',html,_this.ui.container);
			$( html ).appendTo( _this.ui.container );
		}

		var len = datas.length;
		if( len && datas[len-1].time ){
			WE.pageChat.lazyloadData.lastTime = datas[len-1].time;
		}else{
			WE.pageChat.lazyloadData.isLoading = 2;
			WE.pageChat.lazyloadData.lastTime = -1;
		}
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

				_this.review._id = null;
				//_this.prepend( data.result );
				_this.ui.inputArea.val('');
				_this.ui.sendBtn.removeAttr('disabled').text('发送');	
			}
		}
		model.addObserver( ctrl );
		model.mpostChat( roomid,text,to );
	}
}


WE.pageChat.lazyloadData = {

	isLoading : 0,
	lastTime : null,

	init : function(){
		this.regEvent();
	},

	regEvent : function(){
		var _this = this;

		$(window).bind('scroll',function(){
			if( _this.isLoading == 0 ){

				var isbottom = $(window).scrollTop() + $(window).height() + 50 > $(document.body).height();

				if( isbottom ){

					_this.isLoading = 1;
					_this.getMore();

				}
			}
		});
	},

	getMore : function(){
		
		var _this = this;


		$('#timeline-loading').show();

		var model = new WE.api.ChatModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			$('#timeline-loading').hide();
			
			var data = e.data;
			if( data.code == 0 && data.result.length ){
				_this.isLoading = 0;
				WE.pageChat.append( data.result );
			}else{
				_this.isLoading = 2;
			}
		
		};
		ctrl.error = function(){
			// $('#timelineLoading').addClass('hidden');
		};
		model.addObserver( ctrl );
		model.getMore( ROOM.id , this.lastTime );
	}
}


WE.pageChat.review = {

	_id : null,
	init : function(){
		this.regEvent();
	},

	reviewOrigTmpl : '<p>\
						<span class="review-cont"><%=text%></span>\
						<a class="review-uname" href="/user/<%=uid%>"><%=uname%></a>\
						<a class="review-del" href="javascript:;" style="margin-left:10px;font-weight:bold;">×</a>\
					  </p>',

	regEvent : function(){

		var _this = this;
		$('#chat-container').delegate('.review-btn','click',function(){
			var chatBox = $(this).closest('.chat'),
				uid = chatBox.find('input[name=uid]').val();
				uname = chatBox.find('input[name=uname]').val(),
				text = chatBox.find('input[name=txt]').val(),
				mid = chatBox.find('input[name=mid]').val();
				_this._id = mid;
				_this.setOrigData( text,uname,uid );

		});

		$('#review-box').delegate('.review-del','click',function(){
			_this._id = null;
			_this.clear();
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
