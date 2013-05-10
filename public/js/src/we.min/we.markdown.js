WE.extend( WE.markdown,{

	defaultPrefix : '```',

	preInnerTxt : null,

	preOutTxt : null,

	splitText : function( text ){

		var _this = this;
		var splitRegExp = new RegExp( _this.defaultPrefix + "[\\s\\S]*?" + _this.defaultPrefix,"g" );
		_this.preOutTxt = text.split( splitRegExp );
		_this.preInnerTxt = text.match( splitRegExp );
	},

	join : function(){

		var _this = this;
		_this.fullTxt = _this.preOutTxt;
		if( _this.preInnerTxt != null ){
			for( var i = 0;i < _this.fullTxt.length;i++ ){
				var pos = ( 2 * i ) + 1;
				_this.fullTxt.splice(pos,0,_this.preInnerTxt[i]);
			}
		}
		
		return _this.fullTxt.join("");
	},

	format : function( text ){

		var _this = this;
		if( String(text).length > 0 ){
			
			text = WE.kit.removalHtmlTag( text );

			//分割内容
			_this.splitText( text );

			//替换换行符 pre 外的内容
			if( _this.preOutTxt != null ){
				for( var i = 0;i < _this.preOutTxt.length;i++ ){
					_this.preOutTxt[i] = _this.lineFormat( _this.preOutTxt[i] );
				}
			}
			
			
			// 替换pre
			if( _this.preInnerTxt != null ){
				for( var i = 0;i < _this.preInnerTxt.length;i++ ){
					_this.preInnerTxt[i] = _this.preFormat( _this.preInnerTxt[i] );
				}
			}
			

			text = _this.join();
			text = _this.urlFormat( text );
			// text = this.lineFormat( text );
			// text = this.preFormat( text );
			// text = this.urlFormat( text );
			return text;
		}else{
			return text;
		}
		
	},
	preFormat : function( text ){

		var _this = this;
		if( text.length > 0 ){

			var index = 0;
			var html = text.replace( new RegExp( _this.defaultPrefix,'g' ),function( a ){ index++; return index % 2 == 0 ? '</pre>' : '<pre>' ;});
			return html;
		}else{
			return text;
		}
	},
	urlFormat : function( text ){
		return text.replace(/(http|https):\/\/[\w\.\/\:\?\&\=\#\-\_]+/gi, function( a ){
			return '<a href="'+a+'" target="_blank">'+a+'</a>'
		});
	},

	lineFormat : function( text ){
		return text.replace(/\n/gi, "<br/>");
	} 
})