
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
		domain:{

			"**.css":"https://www.vchat.co"

		},
		path:[
			{
				reg:"**.ejs",
				isHtmlLike:true,
				release:'$&'
			},
			{
				reg:"lib/**.js",
				useCompile:false,
				useHash:false,
				useMap:false
			},
			{
				reg:"routes/**.js",
				useCompile:false,
				useHash:false,
				useMap:false
			},	
			{
				reg:"ssl/**.**",
				useCompile:false,
				useHash:false,
				useMap:false
			},
			{
				reg:"app.js",
				useCompile:false,
				useHash:false,
				useMap:false
			},
			{
				reg:"config.js",
				useCompile:false,
				useHash:false,
				useMap:false
			},
			{
				reg:"package.json",
				useCompile:false,
				useHash:false,
				useMap:false
			},
			{
				reg:"upgrade.js",
				useCompile:false,
				useHash:false,
				useMap:false
			},
			{
				reg:/public\/css\/(.*\.css)/i,
				release:"$&",
				url:"/css/$1"
			},
			{
				reg:/public\/bootstrap\/(.*\.css)/i,
				release:"$&",
				url:"/bootstrap/$1"
			},
			{
				reg:/public\/js\/(.*\.js)/i,
				release:"$&",
				url:"/js/$1"
			},
			{
				reg:/public\/images\/(.*\..*)/i,
				release:"$&",
				url:"/images/$1"
			}
		]
	}

});