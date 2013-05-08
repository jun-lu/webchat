
/**

	we.Dialog();

	options
		width: 可选
		height: 可选
		html:"" 必选
*/



WE.Dialog = function( options ){
	
	var dialog = null;
	this.id = options.id;//不能同时弹出2个同样ID的框

	//不允许重复弹出
	if( this.id && WE.Dialog.getItem( this.id ) ){
		dialog = WE.Dialog.getItem( this.id );
		dialog.isRepeat = true;//重复弹出标识
		return dialog.isRepeat;
	}
	this.title = options.title || "";
	this.html = options.html;
	this.width = options.width || 200;
	this.height = options.height || 60;

	this.wrap = $(WE.Dialog.html.replace("<%=title%>", this.title));

	this.ui = {
		wrap:this.wrap,
		mask:this.wrap.find(".we-mask"),
		dialog:this.wrap.find('.we-dialog'),
		context:this.wrap.find(".we-dialog-context")
	};

	this.init();
	
};

WE.Dialog.html = '<div class="we-dialog-box">\
		<div class="we-mask" style="opacity:0" ></div>\
		<div class="we-dialog" style="opacity:0">\
			<div class="we-dialog-title">\
				<h1><%=title%></h1>\
				<a href="javascript:;" class="we-dialog-close out"></a>\
			</div>\
			<div class="we-dialog-context we-loading"></div>\
		</div>\
	</div>';


WE.Dialog.list = {};

WE.Dialog.getItem = function( id ){

	return this.list[id];
};

WE.Dialog.setItem = function(id, dialog){

	this.list[id] = dialog;

};
WE.Dialog.remove = function( id ){
	this.list[id] = null;
};
WE.Dialog.prototype = {
	constructor:WE.Dialog,
	
	init:function(){


		var _this = this;
		if( this.id ){
			WE.Dialog.setItem(this.id, this);
		}

		document.body.appendChild( this.ui.wrap[0] );

		this.updatePosition();
		
		this.ui.wrap.delegate('.out', 'click' , function(){
			_this.close( 1 );
		});

	},

	append:function( html ){

		var _this = this;
		this.ui.context.html( html ).removeClass("we-loading");
		this.updatePosition();

	},
	updatePosition:function(){
		
		this.width = this.ui.dialog.width();
		this.height = this.ui.dialog.height();
		this.ui.dialog.css({

			top:(($(window).height() - this.height)/2*0.6)+"px",
			left:($(window).width() - this.width)/2+"px"

		})

	},
	show:function(){
		this.ui.mask.animate({opacity:1}, 300);
		this.ui.dialog.animate({marginTop:"+=10px", opacity:1}, 300);
	},
	/**
		用户主动取消 type == 1
	*/
	close:function( type ){
		var _this = this;
		this.ui.mask.animate({opacity:0}, 300);
		this.ui.dialog.animate({marginTop:"-=10px",opacity:0}, 300, function(){
			_this.ui.wrap.remove();
			WE.Dialog.remove( _this.id );	
		});
	},
	onclose:function(){ return true; }
};



/*
	ui:
		box: #id,
			form:
			textarea:
			.sendbtn	

	WE.PostUI
		.onpost(text, roomid, to);
		
		.setReply( chat ); //设置回复 
		.setClear();//清空文本
		.setFoucs();//获取焦点
		
		.removeReply();//取消回复状态
		
		.setLock();
		.removeLock();
		
*/




WE.ui.Post = function( dom ){
		
	this.quotetmpl = '<span class="quote-text"><%=text%></span>\
				<a href="/user/<%=uid%>" class="quote-user"><%=uname%></a>\
				<a class="quote-del pull-right" href="javascript:;">×</a>';
	
	this.islock = false;
	this.dom = $(dom);
	this.postType = 1;// 1 ctrl+enter  2 enter
	this.isFullscreen = false;
	this.init();
};
WE.ui.Post = function( dom ){
		
	this.quotetmpl = '<span class="quote-text"><%=text%></span>\
				<a href="/user/<%=uid%>" class="quote-user"><%=uname%></a>\
				<a class="quote-del pull-right" href="javascript:;">×</a>';
	
	this.islock = false;
	this.dom = $(dom);
	this.postType = 1;// 1 ctrl+enter  2 enter
	this.isFullscreen = false;
	this.init();
};

WE.ui.Post.prototype = {
	construcotr:WE.ui.Post,
	init:function(){
		var dom = this.dom;
		this.ui = {
			form:dom.find("form:first"),
			to:dom.find(".jsto"),
			roomid:dom.find(".jsroomid"),
			textarea:dom.find("textarea:first"),
			fullscreen:dom.find('.icon-fullscreen'),
			btnGroup:dom.find('.btn-group'),
			quote:dom.find('.quote'),
			postSendBtn:dom.find('.postSendBtn'),
			modeEdit:dom.find('.jsmodeEdit'),
			modePreview:dom.find('.jsmodePreview'),
			jspreviewbox:dom.find('.jspreviewbox')

		};
		this.regEvent();
		this.initSendType();
		this.setFoucs();
		//this.autoHeight();
	},
	initSendType:function(){
		var type = localStorage.getItem("sendType") || 1;
		this.postType = type;

		var dropdownMenuA = this.ui.btnGroup.find('.dropdown-menu a')
		dropdownMenuA.find("span:first").hide();
		dropdownMenuA.eq( type == 2 ? 0 : 1 ).find("span:first").show();

	},
	regEvent:function(){
		var _this = this;
		this.ui.form.submit(function(){
			var text = $.trim( _this.ui.textarea.val() );
			var to = _this.ui.to.val();
			var roomid = _this.ui.roomid.val();
			if(text && _this.islock == false){
				_this.onpost(roomid, text, to);
			}
			return false;
		});
		this.ui.fullscreen.click(function(){
			_this.dom.toggleClass("fullscreen");
			_this.isFullscreen = _this.isFullscreen ? false : true;
			_this.updateTextareaHeight();
		});
		
		this.ui.btnGroup.find('.dropdown-toggle').click(function(){
			_this.ui.btnGroup.toggleClass("open");
			return false;
			
		});
		
		var dropdownMenuA = this.ui.btnGroup.find('.dropdown-menu a')
		dropdownMenuA.click(function(){
			//dropdownMenuA.find("span:first").hide();
			//$(this).find("span:first").show();
			_this.ui.btnGroup.toggleClass("open");
			_this.postType = $(this).data("type");
			localStorage.setItem("sendType", _this.postType);
			_this.initSendType();
		});
		
		this.ui.textarea.keydown(function( e ){
			//回车发送
			if(e.keyCode == 13 && _this.postType == 2 && _this.isFullscreen == false && e.shiftKey == false){
				_this.ui.form.trigger('submit');
				return false;
			}
			//ctrl + enter
			if(e.keyCode == 13 && _this.postType == 1 && _this.isFullscreen == false && e.ctrlKey == true){
				_this.ui.form.trigger('submit');
				return false;
			}
		});

		this.ui.modeEdit.click(function(){
			_this.ui.jspreviewbox.hide();
			_this.ui.textarea.show();
			_this.ui.modePreview.removeClass("active");
			_this.ui.modeEdit.addClass("active");
		});
		
		this.ui.modePreview.click(function(){
			//alert(1);
			_this.ui.textarea.hide();
			_this.ui.jspreviewbox.show();
			_this.ui.jspreviewbox.html( WE.markdown.format(_this.ui.textarea.val()) );
			_this.ui.modeEdit.removeClass("active");
			_this.ui.modePreview.addClass("active");
		});


		$(window).resize(function(){
			if( _this.isFullscreen ){
				_this.updateTextareaHeight();
			}
		}).keydown(function( e ){

			if(e.keyCode == 27){
				_this.setMini();
			}			
		});

	},
	updateTextareaHeight:function(){
		//updateTextareaHeight
		if( this.isFullscreen ){
			var height = $(window).height();
			this.ui.textarea.css("minHeight", (height-48-26)+"px");
			this.ui.jspreviewbox.css("minHeight", (height-48-26)+"px");
		}else{
			this.ui.textarea.css("minHeight", "45px");
			this.ui.jspreviewbox.css("minHeight", "45px");
			this.ui.jspreviewbox.hide();
			this.ui.textarea.show();
		}
	},
	onpost:function(roomid, text , to){
		//text, roomid, to
	},
	setMini:function(){

		this.isFullscreen = false;
		this.dom.removeClass("fullscreen");
		this.updateTextareaHeight();
	},
	setReply:function( chat ){
		
		var _this = this;
		var html = WE.kit.tmpl(this.quotetmpl, chat);
		this.ui.to.val( chat._id );
		this.ui.quote.html( html ).show();
		this.ui.quote.find(".quote-del").click(function(){
			_this.removeReply();
		});
		this.setFoucs();
		
	},
	setClear:function(){
		this.ui.textarea.val('');
		this.removeReply();
	},
	setLock:function(){
		this.islock = true;
		this.ui.postSendBtn.attr("disabled",true);
	},
	setFoucs:function() {
		this.ui.textarea.focus();
	},
	removeLock:function(){
		this.islock = false;
		this.ui.postSendBtn.attr("disabled",false);
	},
	removeReply:function(){
		this.ui.to.val('');
		this.ui.quote.hide();
	}
};