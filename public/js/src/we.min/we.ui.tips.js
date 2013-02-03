
/**
	#lujun
	#2012-08-08
	
	需求
		Jquery.js
		DragElement.js
	
	WE.ui.ok(context, timeout);
	WE.ui.alert(context, callback);
	WE.ui.confirm(context, callback);
	WE.ui.tip(option);
		option
			title:"tip",
			context:"hello world",
			callback:function( type ){}, "close" | "ok" | "cancel" | "auto"
			type: "notice" | "success" | "none"
			timeout:0,
			okbtn:true,
			cancelbtn:true,
			closebtn:true,
*/
WE.extend(WE.ui, {
	ok:function(context, timeout){
		timeout  = timeout || 3000;
		var tip = this.tip({
			context:context,
			okbtn:false,
			cancelbtn:false,
			//closebtn:true,
			type:"success",
			timeout:timeout,
			title:WE_LANG.lj_234
		});
		tip.ui.close.focus();
		return tip;
	},
	alert:function(context, callback){
	
		if(this.alert.tip){//第2次弹出会清除第一次  防止多次弹出
			this.alert.tip.option.callback = null;
			this.alert.tip.close();
		}
		
		var tip = this.tip({
			context:context,
			cancelbtn:false,
			//closebtn:false,
			type:"notice",
			callback:callback,
			title:WE_LANG.lj_234
		});
		tip.ui.ok.focus();
		
		this.alert.tip = tip;
		return tip;
	},
	confirm:function(context, callback){
		if(this.confirm.tip){
			return this.confirm.tip;
		}
		var _this = this;
		var tip = this.tip({
			context:context,
			closebtn:false,
			type:"notice",
			callback:function(action){
				_this.confirm.tip = null;
				action = action == "ok" ? true : false;
				callback && callback(action);
			},
			title:WE_LANG.lj_234
		});
		
		this.confirm.tip = tip;
		tip.ui.ok.focus();
		return tip;
	},
	tip:(function(){
	
		var lang = {
			title:"提示",
			close:"关闭",
			ok:"确定",
			cancel:"取消"
		};

		var HTMLTMPL = '<div class="moxian-ui-tip">\
				<div class="ui-tip-wrapper">\
					<div class="ui-tip-main">\
						<div class="ui-tip-title">\
							<h1><%=title%></h1>\
							<%if(closebtn){%>\
							<input type="button" class="ui-btn-close pngbg" title="'+lang.close+'" />\
							<%}%>\
						</div>\
						<div class="ui-tip-context">\
							<%if(type){%>\
							<p class="p">\
								<span class="ui-tip-icon ui-tip-<%=type%>"></span><span><%=context%></span>\
							</p>\
							<%}else{%>\
								<%=context%>\
							<%}%>\
						</div>\
						<div class="ui-tip-btn">\
							<%if(okbtn){%>\
								<input type="button" title="'+lang.ok+'" class="btn-primary js_ok" value="'+lang.ok+'" />\
							<%}%>\
							<%if(cancelbtn){%>\
								<input type="button" title="'+lang.cancel+'" class="btn marl10 js_cancel" value="'+lang.cancel+'" />\
							<%}%>\
						</div>\
					</div>\
				</div>\
				<div class="ui-tip-bg">背景</div>\
			</div>';
		
		function tip( option ){
			
			this.option = {
				title:WE_LANG.lj_234,
				context:"hello world",
				callback:function(){},
				timeout:0,
				okbtn:true,
				cancelbtn:true,
				closebtn:true,
				type:"notice"
			};
			
			$.extend(this.option, option);
			
			this.init();
		}
		tip.prototype = {
			
			init:function(){
				//console.log(HTMLTMPL);
				var html = WE.kit.tmpl(HTMLTMPL, this.option);
				var div = $('<div></div>').append( html );
				
				this.ui = {
					wrapper:div.find('.moxian-ui-tip'),
					title:div.find('.ui-tip-title'),
					close:div.find('.ui-btn-close'),
					ok:div.find('.js_ok'),
					cancel:div.find('.js_cancel')
				};
				
				$(document.body).append( div.find('.moxian-ui-tip') );
				
				this.regEvent();
				
				if(this.option.timeout){
					this.setTimeout(this.option.timeout);
				};

				new WE.kit.DragElement({
					dragElement:this.ui.title,
					moveElement:this.ui.wrapper,
					isRange:false,
					isResize:false,
					offsetTop:0
				}).init();
				
				
				this.updatePos();
			},
			regEvent:function(){
				var _this = this;
				
				this.ui.close.click(function(){
					_this.close( "close" );
				});
				
				this.ui.ok.click(function(){
					_this.close( "ok" );
				});
				
				this.ui.cancel.click(function(){
					_this.close( "cancel" );
				});
				
				function esc(e){
					if(e.keyCode == 27){// esc
						_this.close("close");
						$(window).unbind("keyup", esc);
					}
				};
				
				$(document).keyup(esc);
				
			},
			close:function(action){
				this.ui.wrapper.remove();
				this.option.callback && this.option.callback(action);
			},
			updatePos:function(){
				var height = $(window).height();
				var width = $(window).width();
				this.setPos((height-this.ui.wrapper.height()) / 2, (width-this.ui.wrapper.width()) / 2);
			},
			"setTimeout":function( time ){
				var _this = this;
				setTimeout(function(){
					_this.close("auto");
				}, time);
			},
			setPos:function(top, left){
				this.ui.wrapper.css({
					top:top+"px",
					left:left+"px"
				})
			}
			
		};
		
		return function(option){
			return new tip(option);
		}
		
	})()
});