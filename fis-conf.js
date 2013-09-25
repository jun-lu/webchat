
// add .ejs

fis.config.merge({
	project:{
		fileType:{
			text:"ejs"
		}
	}
});

fis.config.merge({
	project:{
		exclude:/^\/(node_modules|psd|dataRecovery|autobuild|html)/i
	}
});


fis.config.merge({

	roadmap:{
		path:[
			{
				reg:"**.ejs",
				isHtmlLike:true,
				release:'$&'
			},
			{
				reg:"lib/**.js",
				useHash:false
			},
			{
				reg:"ssl/**.**",
				useHash:false
			},
			{
				reg:"app.js",
				useHash:false
			},
			{
				reg:"config.js",
				useHash:false
			},
			{
				reg:"package.json",
				useHash:false
			},
			{
				reg:"upgrade.js",
				useHash:false
			},
			{
				reg:"css/**.css",
				release:"$&",
				url:"/css/$&"
			},
			{
				reg:"js/**.js",
				release:"$&"
			}
		]
	}

});