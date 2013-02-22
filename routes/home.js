/**
	
	home
	
	首页
*/
var LogModel = require("../lib/LogModel");

module.exports = {

	get:function(req, res){

		var user = req.session.user || null;
		var log = {};

		if( user ){

			LogModel.getLog( String(user._id), function( status  ){

				if(status.code == "0"){
					var logs = status.result;
					for(var i=0; i< logs.length; i++){

						if(log[logs[i].info.id] == undefined){
							log[logs[i].info.id] = logs[i].info;
						}
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