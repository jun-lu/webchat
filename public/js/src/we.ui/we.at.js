
/**

	mx.at
	
	textarea textarea域 或者 input域
	
	options{
		maxLimit:10,最大显示
		offsetTop:2,
		offsetLeft:0
	}
	
	
	工厂方法
	
	WE.at.create(List);
	
	为list所包含的 textarea 或者 input 创建提示
	
*/
WE.api  = WE.api || {};
WE.api.AtModel = function(){
	this.searchURL = "/main/search.php";
};
WE.api.AtModel.prototype = new WE.BaseModel();
WE.extend(WE.api.AtModel.prototype, {
	searchFirends:function( key ){
		/**
		this.notice([
			{
				mx_id:789,
				mx_name:"helloworld"
			},
			{
				mx_id:789,
				mx_name:"Jun_0ooo"
			},
			{
				mx_id:789,
				mx_name:"鲁军"
			},
			{
				mx_id:789,
				mx_name:"Jun_0ooo"
			},
			{
				mx_id:789,
				mx_name:"鲁军"
			}
		]);
		*/
		//return ;
		//{"mx_id":1656,"mx_name":"PUBLIC"}
		//action=search_name&search_value=a
		this.get(this.searchURL, {action:"search_name", search_value:key});
	}
});


WE.At = function(textarea, options){
	
	this.textarea = textarea;
	this.offsetTop = 2;
	this.offsetLeft = 0;
	this.width = 0;
	this.status = 0;//0 未显示 1 显示
	this.currentIndex = -1;
	this.key = "";
	WE.extend(this, options || {});
	
	this.init();
};
WE.At.isinit = 0;
WE.At.status = 0;
WE.At.regEvent = function(){
	$(window).click(function(){
		WE.At.status = 0;
		WE.At.ui.box.addClass('hidden');
	});
};
WE.At.create = function( list ){
	
	for(var i=0; i<list.length; i++){
		//console.log(list[i]);
		new WE.At( $(list[i]) );
	}
};
WE.At.prototype = {
	constructor:WE.At,
	tmpl:'<div class="mx-at-box hidden" id="mxatbox">\
		<div class="mx-at">\
			<div class="mx-at-title">选择</div>\
			<div class="mx-at-list"></div>\
		</div>\
	</div>',
	listTmpl:'<ul>\
		<%for(var i=0; i<data.length; i++){%>\
			<li data-index="<%=i%>"><a href="javascript:void(0);"><%=data[i].name%></a></li>\
		<%}%>\
	</ul>',
	init:function(){
		var html = "";
		var ui = {};
		if( WE.At.isinit == 0 ){
		
			html = WE.kit.tmpl(this.tmpl, {});
			$(document.body).append( html );
			ui.box = $('#mxatbox');
			ui.title = ui.box.find('.mx-at-title');
			ui.list = ui.box.find('.mx-at-list');
			WE.At.ui = ui;
			WE.At.regEvent();
		};
		WE.At.isinit++;
		this.ui = WE.At.ui;
		this.regEvent();
	},
	regEvent:function(){
		var _this = this;
		
		this.textarea.keyup(function(e){
			if(WE.At.status == 1 && (e.keyCode == 40 || e.keyCode == 38 || e.keyCode == 13)){
				return ;
			}
			_this.textEventHandle(e);
		});
		
		this.textarea.click(function(e){
			_this.textEventHandle(e);
			return false;
		});
		this.textarea.blur(function(){
			setTimeout(function(){
				_this.hide();
			}, 1000);
		});
		
		this.textarea.keydown(function(e){
			//当 at 提示在显示的情况下对 回车 向上 向下 键特殊处理
			if(WE.At.status == 1 && (e.keyCode == 40 || e.keyCode == 38 || e.keyCode == 13)){
				//e.preventDefault();
				//e.stopPropagation();
				if(e.keyCode == 40){//上
					_this.keyCode40();
				}
				
				if(e.keyCode == 38){//下
					_this.keyCode38();
				}
				
				if(e.keyCode == 13){//回车
					_this.keyCode13();
				}
				return false;
			}
		});
		
		
	},
	selfRegEvent:function(){
		
		var _this = this;
		this.ui.list.find('li').mouseover(function(){
			var index = $(this).attr('data-index');
			_this.selectIndex( index );
		});
		
		this.ui.list.find('li').click(function(){
			_this.currentIndex =  $(this).attr('data-index');
			_this.keyCode13();
		});
		
	},
	keyCode38:function(){//38 下
		var len = this.listData.length - 1;
		var index = this.currentIndex-1;
		index = index > len ? 0 : index;
		index = index < 0 ? len : index;
		this.selectIndex( index );
	},
	keyCode40:function(){//40 上
		var len = this.listData.length - 1;
		var index = this.currentIndex+1;
		index = index > len ? 0 : index;
		index = index < 0 ? len : index;
		this.selectIndex( index );
	},
	keyCode13:function(){//13 回车

		if(this.currentIndex != -1){
			var user = this.listData[this.currentIndex];
			this.key.length > 0 && WE.kit.textarea.del(this.textarea[0], this.key.length);
			WE.kit.textarea.add(this.textarea[0], user.name+" ");
			this.hide();
		}
		
		
	},
	selectIndex:function(index){
		var liList = this.ui.list.find('li');
		liList.eq( this.currentIndex ).removeClass('on');
		liList.eq( index ).addClass('on');
		this.currentIndex = index;
	},
	textEventHandle:function(e){

		var pos = WE.kit.textarea.getPos( this.textarea[0] );
		var val = this.textarea.val();
		var key = val.slice(pos-20 < 0 ? 0 : pos-20, pos);
		var len = String(key).length;
		var regexparr = String(key).match(/@([^@\s]{0,20})$/);

		if(len && regexparr){
			this.searchFirends( regexparr[1] || "" );
		}else{
			this.hide();
		}
	},
	showList:function( data ){
		
		if(WE.At.lastFoucsTextarea != this.textarea){//如果激活的文本框有改变 就重新计算位置
			this.updatePosition();
		};
		/**
		if(!data || data.length == 0){// data没有值
			
			return ;
		}
		*/
		if(this.key == ""){
			this.ui.title.text("选择最近联系人");
		}else{
			this.ui.title.text("选择想要AT的人，空格完成输入");
		}
		
		data = data.slice(0, 10);
		
		var html = WE.kit.tmpl(this.listTmpl, {data:data});
		this.ui.list.html( html );
		this.listData = data;
		this.show();
		this.selectIndex( 0 );
		this.selfRegEvent();//绑定事件
	},
	hide:function(){
		WE.At.status = 0;
		this.ui.box.addClass('hidden');
	},
	show:function(){
		WE.At.status = 1;
		this.ui.box.removeClass('hidden');
	},
	updatePosition:function(){

		WE.At.lastFoucsTextarea = this.textarea;
		var offset = this.textarea.offset();
		var width = this.textarea.innerWidth();
		var height = this.textarea.innerHeight();
		
		var top = offset.top + height + this.offsetTop +"px";
		var left = offset.left + this.offsetLeft +"px";
		
		//以200width作为一个基准 也可以直接指定width
		width = this.width ? this.width : (width<150 || width > 200)  ? 200 :  width+2;
		
		this.ui.box.css({
			left:left,
			top:top,
			width:width+"px"
		});
	},
	searchFirends:function( key ){
		this.key = key;
		var _this = this;
		var model = new WE.api.AtModel();
		var ctrl = new WE.Controller( model );
		ctrl.update = function(e){
			var data = e.data;
			_this.showList( data );
		};
		model.addObserver( ctrl );
		model.searchFirends( key || "" );
		
	}
};