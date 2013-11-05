WE.extend( WE.cookie,{

	getCookie: function( name ){

		var cookies = document.cookie.split(';');
		var i = 0,
			len = cookies.length,
			item = null,
			result = null;

		for(; i<len; i++){

			item = cookies[i].split('=');
			if( name == item[0].replace(/(^\s*)|(\s*$)/g, "") ){
				result = item[1];
				break;
			}
		}

		return result;
	},

	setCookie: function( name, value ){

		var cookieStr = name + '=' + escape(value);
		document.cookie = cookieStr;
	}
});