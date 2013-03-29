
/**
	修复chat表的 
	update	Uid->uid   
			Uname->uname
	add		uavatar
	del 	index


*/
var users = db.user.find();
var chats = db.chat.find();
while(chats.hasNext()){
	var item = chats.next();
	//xxxxxxx
	//print(item.Uid)
	
	if(typeof item.Uid == "string"){
		item.Uid = ObjectId( item.Uid );
	}

	if(item.Uid){
		item.uid = item.Uid;
		item.uname = item.Uname;
		var hexmail = db.user.findOne({_id:item.Uid}).hexMail;
		item.uavatar = "http://www.gravatar.com/avatar/{hash}.jpg?s=48&d=monsterid".replace('{hash}', hexmail);
		delete item.Uid;
		delete item.Uname;
		delete item.index;
		db.chat.save(item);
	}
}



/**
	修复room表数据
*/
var rooms = db.room.find();
while(rooms.hasNext()){
	var item = rooms.next();
	var masterid = item.masterId;
	
	if(masterid.length > 10 && typeof masterid == "string"){
		print(masterid);

		var user_ = db.user.findOne({_id:ObjectId(masterid)});
		//print(user_);
		
		if(user_ && user_.name){
			//var name = db.user.findOne({_id:item.masterId}).name;
			item.masterName = user_.name;
			delete item.onlineUser;
			db.room.save(item);
		}
	}
}



