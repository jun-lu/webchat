/**
	
	login
	
	登陆
*/
var config = require('../../config');
var url = require("url");
var https = require("https");
var http = require("http");
var User = require("../../lib/User");
var WebStatus = require("../../lib/WebStatus");
var UserModel = require("../../lib/UserModel");
var tool = require("../../lib/tools");
var ServerRequest = require("../../lib/ServerRequest");


var qq_access_token_url = "https://graph.qq.com/oauth2.0/token";
var qq_openid_url = "https://graph.qq.com/oauth2.0/me";
var AppKey = "100415858";
var AppSecret = "3caa885df49bfb315909290b8b1ed55b";
var redirect_uri = "http://www.vchat.co/sys/qq_login";


function getQQUserInfo(access_token, oauth_consumer_key, openid, callabck){
	var url = "https://graph.qq.com/user/get_user_info";
	ServerRequest.get(url, {access_token:access_token, openid:openid, oauth_consumer_key:oauth_consumer_key}, callabck);
}

module.exports = {

	
		get:function( req, res ){
			
			var code = req.query.code;
			var state = req.query.state;
			var formBody = {
				client_id:AppKey,
				client_secret:AppSecret,
				redirect_uri:redirect_uri,
				code:code,
				grant_type:"authorization_code"
			};
			//res.end("ok");

			ServerRequest.get(qq_access_token_url, formBody, function( oauthInfoString ){

				var oauthInfo = url.parse("?"+oauthInfoString, true).query;
				//console.log("oauthInfo", );
				if( oauthInfo.access_token ){
					ServerRequest.get(qq_openid_url, {access_token:oauthInfo.access_token}, function( openidInfoString ){
						//openidInfo = callback( {"client_id":"100415858","openid":"C2EDC6FD8800DBE6686B243A6ADFB249"} );
						console.log("openidInfoString", openidInfoString);
						var openidInfo = JSON.parse(openidInfoString.slice(openidInfoString.indexOf("{"), openidInfoString.lastIndexOf("}")+1));
						//console.log( openidInfo );
						if(openidInfo.openid){
							UserModel.findOauth("qq", String(openidInfo.openid), function( status ){
								//用户未注册过
								
								if( status.code == "404" ){

									oauthInfo.from = "qq";
									//console.log("oauthInfo.access_token,  AppKey, openidInfo.openid", oauthInfo.access_token,  AppKey, openidInfo.openid);
									getQQUserInfo( oauthInfo.access_token,  AppKey, openidInfo.openid, function( datastr ){
										
										//console.log("data", datastr );
										//console.log("data", JSON.parse(datastr));
										var data = JSON.parse(datastr);

										if(data.ret == 0){
											var user = User.factoryRandom();

											user.setAvatar( data.figureurl_2 );
											user.setName( data.nickname );
											user.setSummary( "" );
											user.setOauth( openidInfo.openid, oauthInfo.access_token, oauthInfo.expires_in, oauthInfo );

											UserModel.createOauthUser(user, function( status ){
												var user = status.result;
												res.setHeader("Set-Cookie", [
													"sid=0|0|0;path=/;expires="+new Date("2000"),
													"sid="+user.toCookie()+";path=/;domain="+config.domain+";expires="+new Date("2030")
												]);
												res.render("sys/sina_login", {state:state, user:user.getInfo()} );
												res.end();	
											});
										}else{

											res.end("get qq user info error"+ datastr);
										}

									});

										
								//用户已经注册过
								}else{

									var user = status.result;
									res.setHeader("Set-Cookie", [
										"sid=0|0|0;path=/;expires="+new Date("2000"),
										"sid="+user.toCookie()+";path=/;domain="+config.domain+";expires="+new Date("2030")
									]);
									res.render("sys/sina_login", {state:state, user:user.getInfo()} );
									res.end();
								}

							});
						}else{

							res.end("error:"+openidInfoString);
						}
					});

				}else{
					
					res.end("error:" + oauthInfoString );

				}

			});

			
		},
		// 登录
		post:function(req, res ){

			
		}
};