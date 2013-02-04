
/*
 * GET chat page.
 * \d+
 */

var ChatRoomDB = require('../lib/ChatRoomDB');

exports.chat = function(req, res){

	var roomkey = req.params.key;
	console.log( roomkey );
	ChatRoomDB.query( Number(roomkey), function(err, roomData ){

		if( roomData ){

			res.render('chat', roomData);
		}else{
			//没有查到到房间
			res.send(404);
			res.end();
		}

	});

	/*

	var chatsData = {
		topic:"周六骑行计划讨论小组",
		des:"关于明天骑行，大家可以讨论下细节，组织者是鲁军",
		onlineUser:[
			{
				id:1234,
				name:"鲁军"
			},
			{
				id:4545,
				name:"nihao"
			}
		]

	};
	
	res.render('chat', chatsData);
	*/
}