
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