/**
	number:6
		获取我参与过,我创建的对话
	
	url: "/sys/ichats"
	method : get
	param:null
	return:{
		code:0, //(0, -1),
		msg:"正确"  //("正确"，"参数错误"),
		result:{
			intos:[room, room, ....] //我参与过的对话倒序
			creates:[room, room, ....] //我创建的对话倒序
		}
	}
	
*/

var LogModel = require("../../lib/LogModel");
var tools = require("../../lib/tools");

module.exports = function( req, res ){

	var user = req.session.user;
	
	if(user == null){
		res.write( new WebStatus("-3").toString() );
		res.end();
		return ;
	}

	LogModel.getLog( user._id, 10000, function( status ){

		if(status.code == "0"){

			var logs = status.result;
			//进入过
			var intos = [];
			//创建过
			var creates = [];

			for(var i=0; i< logs.length; i++){

				if(logs[i].location == "into_room"){

					intos.push( logs[i].info );
				}

				if(logs[i].location == "create_room"){

					creates.push( logs[i].info );
				}
			}

			status.setResult({
				intos:tools.unique(intos, function(item){  return item.id; }),
				creates:creates
			});
		}

		res.write( status.toString() );
		res.end();

	});

}