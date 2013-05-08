var WE = {
	extend:$.extend,
	ui:{},
	kit:{},
	api:{},
	page:{},
	markdown:{},
	Observer : {
		notice:function(){//通知方法
			Array.prototype.unshift.call(arguments, {target:this, data:arguments[0]} );
			for(var i=0; this.observers && i<this.observers.length; i++){
				try{
					this.observers[i].update.apply(this.observers[i], arguments);
				}catch(e){
					window.console && console.log( e );
				}
			}
		},
		addObserver:function( observer ){//添加观察者
			if(observer && observer.update){
				if(!this.observers){
					this.observers = [];
				}
				this.observers.push(observer);
			}else{
				console.error("observer.update not fucntion ");
			}
		},
		removeObserver:function( observer ){
			for(var i=0; this.observers && i<this.observers.length; i++){
			
				if(observer === this.observers[i]){
					this.observers.splice(i,1);
					i--;
				}
			}
		}
	}
};


/*** Controller */
WE.Controller = function( options ){

	this.msg = {
		"-99":"服务器错误"
	};
	options && WE.extend( this, options );
	
};
WE.Controller.prototype = {
	constructor:WE.Controller,
	update:function( data ){
		if(data.code == 0){
			/**执行*/
		}else{
			WE.ui.alert( this.getCodeMsg(data.code) );
		}
	},
	error:function(xhr){
		window.console && console.log("xhr 错误", xhr.status);
		//WE.ui.alert(WE_LANG.lj_127+"<br/>:"+xhr.status);
	},
	getCodeMsg:function( code ){
		
		if( this.msg ){
			msg = this.msg[code];
		}
		var msg = this.msg ? this.msg[code] : null;
		if(msg){
			return msg;
		}
		return "错误代码:"+code;//建议 msg 没有定义可以再检索全局错误定义
	}
};

/** WE.BaseModel */
WE.BaseModel = function( options ){
	this.init( options );
};
WE.BaseModel.prototype = {
	constructor:WE.BaseModel,
	init:function( options ){
		options && WE.extend(this, options);
	},
	error:function(a, b){
		var observers = this.observers;
		for(var i = 0; observers && i<observers.length; i++){
			observers[i].error && observers[i].error(a, b);
		}
	},
	post:function(url, data){
		var _this = this;
		$.ajax({
			url:url,
			type:"post",
			data:data,
			dataType:"json",
			error:function(a, b){
				_this.error(a, b);
			},
			success:function(data){
				_this.notice(data);
			}
		});
	},
	get:function(url, data){
		var _this = this;
		$.ajax({
			url:url,
			type:"get",
			data:data,
			dataType:"json",
			error:function(a, b){
				_this.error(a, b);
			},
			success:function(data){
				_this.notice(data);
			}
		});
	}
};

WE.extend(WE.BaseModel.prototype, WE.Observer);
