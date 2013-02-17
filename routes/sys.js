
/*
 * GET home page.
 */

var WebStatus = require('../lib/WebStatus');
var RoomModel = require('../lib/RoomModel');

exports.sys = {

	login: function(req, res){

		res.render('sys/login', new WebStatus().toJSON() );

	},
	reg:function(req, res){

		res.render('sys/reg',  new WebStatus().toJSON() );
	},
	/** 创建对话 */
	create:function(req, res){

		var model = new RoomModel();
		if(req.body.topic){

			model.on( model.oninsert , function(err, room){
				console.log(model.oninert, room);
				res.redirect('/'+room.id);
			});


			model.create(req.body.topic, req.body.des, "");
		}

		//res.end("请正确提交表单");
	},
	//登出
	out:function(req, res){

		req.session.user = null;
		res.redirect('/sys/login');

	}
};
