/**
	
	login
	
	登陆
*/
var https = require("https");
var http = require("http");
var User = require("../../lib/User");
var WebStatus = require("../../lib/WebStatus");
var UserModel = require("../../lib/UserModel");
var tool = require("../../lib/tools");
var ServerRequest = require("../../lib/ServerRequest");

var weibo_req_options = {

	hostname:"api.weibo.com",
	port: 443,
	path: '/oauth2/access_token',
	method: 'POST',
	headers:{
		"Content-Type":"application/x-www-form-urlencoded"
	}

};

var weibo_access_token_url = "https://api.weibo.com/oauth2/access_token";
var AppKey = "2330339834";
var AppSecret = "f678d757870797833a391f27f36ecfdf";
var redirect_uri = "http://www.vchat.co/sys/weibo_access_token";


function getSinaUserInfo(access_token, uid, callabck){
	var url = "https://api.weibo.com/2/users/show.json";
	ServerRequest.get(url, {access_token:access_token, uid:uid}, callabck);
}

module.exports = {

	
		get:function( req, res ){
			
			var ress = res;
			var code = req.query.code;
			var state = req.query.state;
			
			var formBody = {
				client_id:AppKey,
				client_secret:AppSecret,
				redirect_uri:redirect_uri,
				code:code,
				grant_type:"authorization_code"
			};
			//https://api.weibo.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_REGISTERED_REDIRECT_URI
			//https://api.weibo.com/oauth2/authorize?client_id=2330339834&redirect_uri=http://www.vchat.co&response_type=code
			ServerRequest.post(weibo_access_token_url, formBody, function( oauthInfo ){

				//{"access_token":"2.002nFDqB3qrhXC9abdf9b5a002_HoW","remind_in":"157679999","expires_in":157679999,"uid":"1685239567"}
				//oauthInfo = {"access_token":"2.002nFDqB3qrhXC9abdf9b5a002_HoW","remind_in":"157679999","expires_in":157679999,"uid":"1685239567"}
				
				if( oauthInfo.access_token ){
	
					UserModel.findOauth("sina", String(oauthInfo.uid), function( status ){
						//用户未注册过
						if( status.code == "404" ){

							oauthInfo.from = "sina";
							delete oauthInfo.remind_in;

							getSinaUserInfo( oauthInfo.access_token,  oauthInfo.uid, function( data ){
								
								//data
								var user = User.factoryRandom();

								user.setAvatar( data.avatar_large );
								user.setName( data.name );
								user.setSummary( data.description );
								user.setOauth( oauthInfo.uid, oauthInfo.access_token, oauthInfo.expires_in, oauthInfo );

								UserModel.createOauthUser(user, function( status ){
									var user = status.result;
									res.setHeader("Set-Cookie", ["sid="+user.toCookie()+";path=/;expires="+new Date("2030") ]);
									res.render("sys/sina_login", {state:state, user:user.getInfo()} );
									res.end();	
								});

							});

								
						//用户已经注册过
						}else{

							var user = status.result;
							res.setHeader("Set-Cookie", ["sid="+user.toCookie()+";path=/;expires="+new Date("2030") ]);
							res.render("sys/sina_login", {state:state, user:user.getInfo()} );
							res.end();
						}

					});

				}else{
					
					res.end("error:" + JSON.stringify(oauthInfo) );

				}


			});

			
		},
		// 登录
		post:function(req, res ){

			
		}
};