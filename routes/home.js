/**
	
	home
	
	首页
*/
var API = require("../lib/api");

module.exports = {

	get:function(req, res){

		var user = req.session.user || null;
		var log = {};

		console.log("home", user);
		if( user ){

			API.getLog( String(user._id), function( logs ){

				console.log("logs", logs );
				//console.log("logs", logs );
				for(var i=0; i< logs.length; i++){

					if(log[logs[i].info.id] == undefined){

						log[logs[i].info.id] = logs[i].info;

					}
				}
				res.render('index', {user:user, log:log});
			} );
			return ;
		}

		res.render('index', {user:user, log:log});

	},
	post:null

};