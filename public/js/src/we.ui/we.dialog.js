
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

	this.html = options.html;
	this.width = options.width || 0;
	this.height = options.height || 0;

	this.wrap = $(WE.Dialog.html);

	this.ui = {
		wrap:this.wrap,
		dialog:this.wrap.find('.we-dialog'),
		content:this.wrap.find(".we-dialog-context")

	};

	this.init();
	
};

WE.Dialog.html = '<div class="we-dialog-box">\
		<div class="we-mask"></div>\
		<div class="we-dialog">\
			<div class="we-dialog-title">\
				<h1>Hello</h1>\
				<a href="javascript:;" class="we-dialog-close out"></a>\
			</div>\
			<div class="we-dialog-context"></div>\
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
		this.ui.content.html( this.html );
		document.body.appendChild( this.ui.wrap[0] );

		if(this.width != 0){
			this.ui.dialog.width( this.width );
		}else{
			this.width = this.ui.dialog.width();	
		}

		if(this.height != 0){
			this.ui.dialog.height( this.height );
		}else{
			this.height = this.ui.dialog.height();
		}

		//console.log( this.width );
		this.ui.dialog.css({

			top:-this.height+"px",
			left:"50%",
			marginLeft:-(this.width/2)+"px"

		});

		this.ui.wrap.find('.out').click(function(){
			_this.close( 1 );
		});

	},
	show:function(){
		this.ui.dialog.animate({top:0});
	},
	/**
		用户主动取消 type == 1
	*/
	close:function( type ){
		var _this = this;
		this.ui.dialog.animate({top:-this.height+"px"}, function(){
			_this.ui.wrap.remove();
			WE.Dialog.remove( _this.id );	
		});
	},
	onclose:function(){ return true; }
};