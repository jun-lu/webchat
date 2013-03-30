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
	}

};
