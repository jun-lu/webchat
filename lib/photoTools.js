
/**
	
	photoTools
	图片处理
		
*/

var gm = require('gm');
var WebStatus = require('./WebStatus');

module.exports = {
	/***
	
		获取最合适的正比例缩放比例
			当前 width, height, 目标sw, sh

		根据当前的width ，height
		计算出最适合的目标 sw , sh 的缩放比例（正比例）

		例如
			width = 600
			height = 300

			sw = 170;
			sh = 170;

		return width/sw > height/sh ? width/sw : height/sh;
		return 3.5 > 1.7 ? 3.5 : 1.7;

		swdith = 600/3.5 = 170
		sheight = 300/3.5 = 85

	*/
	getScaling:function(width, height, sw, sh){
		return width > sw || height > sh ? Math.max(width/sw, height/sh) : 1;
	},

	resize:function(srcPath, toPath, width, height, callback){

		gm(srcPath).resize(width, height)
		.noProfile()
		.write(toPath, function (err) {
			callback( new WebStatus(err ? 500 : 0) );
		});

	}





};