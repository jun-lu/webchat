
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

	this.wrap = $('<div class="we-dialog"><div class="we-dialog-in"></div></div>');
	this.ui = {
		wrap:this.wrap,
		content:this.wrap.find(".we-dialog-in")

	};

	this.init();
	
};
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
			this.ui.wrap.width( this.width );
		}else{
			this.width = this.ui.wrap.width();	
		}

		if(this.height != 0){
			this.ui.wrap.height( this.height );
		}else{
			this.height = this.ui.wrap.height();
		}

		//console.log( this.width );
		this.ui.wrap.css({

			top:-this.height+"px",
			left:"50%",
			marginLeft:-(this.width/2)+"px"

		});

		this.ui.wrap.find('.out').click(function(){

			_this.close();
		});

	},
	show:function(){
		this.ui.wrap.animate({top:0});
	},
	close:function(){
		var _this = this;
		this.ui.wrap.animate({top:-this.height+"px"}, function(){
			_this.ui.wrap.remove();
			WE.Dialog.remove( _this.id );
		});
		
	}
};