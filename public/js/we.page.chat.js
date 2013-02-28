

WE.pageChat = {

	isLoading:0,
	lastTime:null,
	postType:1, //快捷发送方式  默认 ctrl + enter 1  enter= 2
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

		this.setLocal();
		//聚焦
		$('#postText').focus();
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

			var text = $.trim($('#postText').val()).replace(/[\n\r]+$/g,"");
			var roomid = $('#roomid').val();	
			if(text && roomid){

				_this.post( roomid, text );

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

		})

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
	post:function(roomid, text){

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

		model.postChat( roomid, text );

	},
	//设置或者修改用户昵称
	setUserName:function( user ){


		WE.kit.getTmpl("update_user_name.ejs", function( data ){

			var dialog = new WE.Dialog( {
				id:"setUserName",
				width:400,
				html:WE.kit.tmpl(data, user)
			});

			dialog.show();


			if(dialog.isRepeat == undefined){
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
			}
		});
	},
	viewRoomInfo:function( room ){

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

		WE.kit.getTmpl("set_room.ejs", function( data ){

			var dialog = new WE.Dialog( {
				id:"setRoom",
				width:500,
				html:WE.kit.tmpl(data, room)
			});

			dialog.show();

			// 第2次弹出 isRepeat 为 true
			if(dialog.isRepeat == undefined){
				$('#updateRoomForm').submit(function(){

					var eleRoomName = $('#roomName');
					var eleRoomTopic = $('#roomTopic');
					var eleRoomDes = $('#roomDes');
					var eleRoomid = $('#roomid');

					var id = eleRoomid.val();
					var name = eleRoomName.val();
					var topic = eleRoomTopic.val();
					var des = eleRoomDes.val();

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

						};
						model.addObserver( ctrl );
						model.updateRoom( id, name, topic, des );	

					}else{
						elenewUserName.focus();
					}

					return false;
				});
			}
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
			<a href="#" class="user-name"><%=Uname%></a> <a href="<%=window.location.href+"#"+obj.index%>" target="_blank" class="time" title="<%=WE.kit.format( time*1000 )%>" data-time="<%=time%>" ><%=WE.kit.weTime(time*1000)%></a>\
			<a href="#<%=obj.index%>" class="post-id" >#<%=obj.index%></a>\
		</div>\
		<div class="markdown-body" >\
			<%= markdown.makeHtml(text) %>\
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

	tmpl:'<li id="uid_<%=_id%>"><a href="#"><%=name%></a></li>',
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









