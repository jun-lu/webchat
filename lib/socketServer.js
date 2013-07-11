/** 
 

  socketServer

*/
var WebSocketServer = require('ws').Server;
var wss = null;

var socketHashList = {
	add:add,
	remove:remove,
	distribute:distribute
};



module.exprts = {
	//wss:null,
	init:function( server ){

		wss = new WebSocketServer({port:8080,server:server});		

		wss.on('connection', this.connection);
	},
	connection:function( ws ){

		ws.on('message', function( message ){

		});

		ws.on('close', function(code, data){


		});

		ws.send("hello world")	
	}

};



//添加到队列
function add( id, socket){

	var list = this[id];

	if( list ){
		list.push( socket );
	}else{
		this[id] = [socket];
	}

}

//从队列中删除
function remove(id, socket){

	var list = this[id];
	for(var i=0; list && i<list.length; i++){

		if(list[i] == socket){
			list.splice(i, 1);
			break;
		}

	}

}


//消息分发
function distribute( id, event, chat ){

	var list = this[id];

	for(var i=0; list && i<list.length; i++){

		list[i].emit(event, chat);//.toString()

	}


}

