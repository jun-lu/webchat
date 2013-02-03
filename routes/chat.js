
/*
 * GET chat page.
 */

var ejs = require('ejs');

exports.chat = function(req, res){

	//console.log( ejs );
	//var html = new EJS({url:'chat.ejs'}).render( {} );
	//var html = ejs.renderFile("chat.ejs", {});

	//res.send( html );

	//res.render('index', { title: 'Express' });
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
}