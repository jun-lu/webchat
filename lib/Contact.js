/*	
	描述用户与另外一个用户之间的关系。

	Contact :
	{
		_id:"",
		sid:"", //记录人 id  send user id
		aid:"", //对方 id  accept user id
		thermograph:Number, //温度计
		time: parseInt( Date.now() / 1000 )
	}

*/

exports = module.exports = Contact;

function  Contact( from, to, thermograph ){

	this.from = from;
	this.to = to;
	this.thermograph =  thermograph || 1;
	this.time = parseInt( Date.now()/1000 );

}

// 所有key
Contact.KEY = {
	from:1,
	to:1,
	thermograph:1,
	time:1
};


Contact.prototype = {

	constructor:Contact,

	toJSON:function() {

		return {

			_id:this._id,
			from:this.from,
			to:this.to,
			thermograph:this.thermograph,
			time:this.time
		};


	}

}