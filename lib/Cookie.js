/**
	module.exports
	
	options
	{
		key:value,
		key2:value2
	}
	
*/
var config = require("../config");

module.exports = function( key, value ){
	if(key){
		this.key = key;
		this.value = value;
	}
	this.domain = config.domain;
	this.path = "/";
	this.Secure = true;
	this.HttpOnly = false;
	this.expires = new Date("2030"); 
};
module.exports.prototype = {
	constructor:module.exports,
	set:function(key, value){
		this[key] = value;
	},
	setDomain:function( domain ){
		this.domain = domain;
	},
	setPath:function( path ){
		this.path = path;
	},
	setSecure:function( secure ){
		this.Secure = secure || true;
	},
	setHttpOnly:function( httpOnly ){
		this.HttpOnly = httpOnly || false;
	},
	setExpires:function( date ){
		this.expires = date;
	},
	toJSON:function(){
		var json = {
			"domain":this.domain,
			"path":this.path,
			"expires":this.expires,
			"Secure":this.Secure,
			"HttpOnly":this.HttpOnly
		};
		json[this.key] = this.value;
		return json;
	},
	toString:function(){
		var json = this.toJSON();
		var string = "";

		string += this.key+"="+this.value+";";
		string += "expires="+this.expires+";";
		string += "domain="+this.domain+";";
		string += "path="+this.path+";";
		
		if(this.Secure){
			string += "Secure;";
		}
		if(this.HttpOnly){
			string += "HttpOnly;";
		}
		return string;
	}
}