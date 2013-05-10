WE.extend( WE.markdown,{

	defaultPrefix : '```',

	format : function( text ){

		if( String(text).length > 0 ){
			//var html = '';
			text = WE.kit.removalHtmlTag( text );
			text = this.lineFormat( text );
			text = this.preFormat( text );
			text = this.urlFormat( text );
			return text;
		}else{
			return text;
		}
		
	},
	preFormat : function( text ){

		var _this = this;

		if( text.length > 0 ){

			var prefixLen = text.split( _this.defaultPrefix ).length - 1;

			if( prefixLen != 0 && prefixLen % 2 == 0 ){

				var index = 0;
				var html = text.replace( new RegExp( _this.defaultPrefix,'g' ),function( a ){ index++; return index % 2 == 0 ? '</pre>' : '<pre>' ;});
				return html;		
			}else{
				return text;
			}

		}else{

			return false;
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