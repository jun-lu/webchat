/**
	
	/p/upload_photo
	
*/

module.exports = {
		
	get:function( req, res ){
		

		res.render("p/upload_photo");
		

	},
	post:function( req, res ){

		//console.log("req", req);
		console.log("req.files", req.files );
		//res.write(JSON.stringify( req.files ));
		res.end();
	}	

}