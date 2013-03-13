
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
	this.width = options.width || 100;
	this.height = options.height || 50;

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


		//this.ui.context.html( this.html.replace("<%=title>", (this.title || "")) );
		document.body.appendChild( this.ui.wrap[0] );

		//this.updatePosition();
		this.ui.context.width( this.width );
		this.ui.context.height( this.height );
		this.updatePosition();
		
		this.ui.wrap.delegate('.out', 'click' , function(){
			_this.close( 1 );
		});

	},

	append:function( html ){

		this.ui.context.css({width:"auto", height:"auto"}).removeClass("we-loading");
		this.ui.context.html( html );
		this.width = this.ui.dialog.width();
		this.height = this.ui.dialog.height();
		this.updatePosition();

	},
	updatePosition:function(){

		this.ui.dialog.css({
			top:"30%",
			left:"50%",
			marginTop:-(this.height/2-10)+"px",
			marginLeft:-(this.width/2)+"px"
		});

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