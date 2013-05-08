WE.extend( WE.markdown,{

	defaultPrefix : '````',

	format : function( text ){

		var html = '';
		html = this.preFormat( text );
		html = this.urlFormat( text );
		return html;
	},

	preFormat : function( text ){

		var _this = this;

		if( text.length > 0 ){

			var prefixLen = text.split( _this.defaultPrefix ).length - 1;

			if( prefixsLen != 0 && prefixsLen % 2 == 0 ){

				var index = 0;
				var html = text.replace( new RegExp( _this.defaultPrefix,'g' ),function( a ){ index++; return index % 2 == 0 ? '</pre>' : '<pre>' ;});
				return html;		
			}

		}else{

			return false;
		}
	},

	urlFormat : function( text ){
		return text.replace(/\n/gi, "<br/>").replace(/(http|https):\/\/[\w\.\/\:\?\&\=\#\-\_]+/gi, function( a ){
			return '<a href="'+a+'" target="_blank">'+a+'</a>'
		});
	}
})