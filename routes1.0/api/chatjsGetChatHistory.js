

var Promise = require('../../lib/Promise');
var WebStatus = require('../../lib/WebStatus');
var ChatModel = require('../../lib/ChatModel');


module.exports = function( req, res ){

	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
	
	var user = req.session.user;
	var to = req.query.to;
	var limit = parseInt(req.query.limit) || 10;
	var roomid = req.query.roomid;
	var promise = new Promise();

	if( !user ){

		res.end(new WebStatus("304").toString());
		return ;

	};

	if( !roomid ){
		res.end(new WebStatus("-1"));
		return ;
	}
	promise.add(function(){

		ChatModel.findLimitSort({
			roomid:roomid,
			time:{"$lt":parseInt(Date.now()/1000)},
			from:{"$in":[to, user._id]}, 
			to:{"$in":[user._id, to]},
		}, limit, {time:-1}, function( status ){
			promise.ok( status );
		})

	});

	promise.then(function( status ){

		if(status.code == 0){
			ChatModel.serialization( status, function( status ){

				promise.ok( status );

			})
		}else{
			promise( status );
		}

	});

	promise.then(function( status ){
		status.result && status.result.reverse();
		res.end( status.toString() );
	})

	

	promise.start();
	

}