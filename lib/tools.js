/**

	tool 类
*/


exports = module.exports = {

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
		return string;
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
		// Jun.com.format(new Date(),"yyyy-MM-dd hh:mm:ss");
		//Jun.com.format(new Date(),"yyyy年MM月dd日 hh时:mm分:ss秒");
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

	}

};
