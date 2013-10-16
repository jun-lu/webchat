/**

	tool 类
*/


exports = module.exports = {
	removeHtmlTag:function(a){return String(a).replace(/<|>/g,function(a){return a=="<"?"&lt;":"&gt;"})},
	revertHtmlTag:function( text ){

		return String(text).replace(/\n/gi, "<br/>").replace(/http:\/\/[\w\.\/\:\?\&\=\#\-\_]+/gi, function( a ){
			return '<a href="'+a+'" target="_blank">'+a+'</a>'
		})

	},
	unique:function(array, uniqueFun){
		var tmpObject = {hasStored: {}, uniqueArray: []}, i;
		for(i = 0; i < array.length; i++){
			// 传进三个参数[当前元素,当前下标,数组本身]，并将this指向当前元素
			var uniqueKey = uniqueFun.apply(array[i], [array[i], i, array]);
			if(! tmpObject['hasStored'][uniqueKey]){
				tmpObject['hasStored'][uniqueKey] = true;
				tmpObject['uniqueArray'].push(array[i]);
			}
		}
		return tmpObject.uniqueArray;
	},
	trim:function( string ){
		//return string;
		return String(string).replace(/^\s+/, "").replace(/\s+$/);
	},
	pad:function(string, length, pad){
		var len = length - String(string).length
		if(len < 0){
			return string;
		}
		var arr = new Array( length - String(string).length || 0 )
		arr.push(string); 
		return arr.join(pad || '0');
	},
	format:function(source, pattern){
		source = new Date(source);
		var pad = this.pad,
			date = {
			yy		: String(source.getFullYear()).slice(-2),
			yyyy	: source.getFullYear(),
			M		: source.getMonth() + 1,
			MM		: pad(source.getMonth()+1, 2, '0'),
			d		: source.getDate(),
			dd		: pad(source.getDate(), 2, '0'),
			h		: source.getHours(),
			hh		: pad(source.getHours(), 2, '0'),
			m		: source.getMinutes(),
			mm		: pad(source.getMinutes(), 2, '0'),
			s		: source.getSeconds(),
			ss		: pad(source.getSeconds(), 2, '0')
			};
		return (pattern || "yyyy-MM-dd hh:mm:ss").replace(/yyyy|yy|MM|M|dd|d|hh|h|mm|m|ss|s/g, function(v){ return date[v];});

	},
	weFormat : function( time ){

		var output = '';
		var date = new Date( time );
		var now = new Date();

		var nYear = now.getFullYear(),
			nMonth = now.getMonth() + 1,
			nDate = now.getDate();

		var gYear = date.getFullYear(),
			gMonth = date.getMonth() + 1,
			gDate = date.getDate();

		var dateArr = [gYear, gMonth, gDate];
		var timeArr = [date.getHours(), date.getMinutes(), date.getSeconds()];

		if( gYear == nYear  ){

			if( gMonth == nMonth ){

				if( gDate == nDate ){

					output = 'Today' + ' ' + timeArr.join(':');
				}else if( (gDate - nDate) == 1 ){

					output = 'Yesterday' + ' ' + timeArr.join(':');
				}else{

					output = dateArr.splice(1,3).join('-') + ' ' + timeArr.join(':');
				}

			}else if( gMonth != nMonth ){

				output = dateArr.splice(1,3).join('-') + ' ' + timeArr.join(':');
			}
			
		}else{

			output = dateArr.join('-') + ' ' + timeArr.join(':');
		}

		return output;
	},
	cutOff:function( text, length ){

		if( text.length > length ){
			return text.slice(0, length)+"...";
		}

		return text;

	},
	serialization:function( object ){
		var string = "";	
		for( var key in object){
			//referer=%2F&email=idche%40qq.coom&pwd=l123456
			string += key+"=" + encodeURIComponent(object[key])+"&";

		}
		return string.slice(0, string.length-1);
	},
	mix:function(a, b){
		for(var key in b){
			if( b.hasOwnProperty( key ) ){
				a[key] = b[key];
			}
		}
	},
	cloneObject:function( object, keys ){

		var json = {};
		for(var i in keys){

			json[i] = object[i];
		}

		return json;

	}

};
