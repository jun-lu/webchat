
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
		exclude:/^\/(node_modules|psd|lib|dataRecovery|autobuild|html|app.js)/i
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
				reg:"css/**.css",
				release:"$&"
			},
			{
				reg:"js/**.js",
				release:"$&"
			}
		]
	}

});