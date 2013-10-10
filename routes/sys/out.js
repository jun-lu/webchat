/**
	
	login
	
	登录
*/
var config = require("../../config");
module.exports = {
	get:function(req, res){
		//req.session.user = null;
		res.setHeader("Set-Cookie", ["sid=0|0|0;path=/;domain="+config.domain+";expires="+new Date("2000")]);
		res.redirect('/login');
	},
	post:null
};