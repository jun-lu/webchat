/**

	系统邮件
	向某一个用户发送邮件

*/

var WebStatus = require('./WebStatus');
var nodemailer = require("nodemailer");
var smtpTransport = null;
var systemMailConfig = {
	service:"Gmail",
	user:"jelle.lu@gmail.com",
	pass:"che123456789"
};


module.exports = {
	mail:systemMailConfig.user,
	initSMTP:function(){

		return nodemailer.createTransport("SMTP",{
		    service: "Gmail",
		    auth: {
		        user: "vchatserver@gmail.com",
		        pass: "vchat_co"
		    }
		});

	},


	replyremind:function(to, subject, html,  callback){

		this.send( systemMailConfig.user, to,  subject, "", html, callback);

	},

	send:function( from, to, subject, text, html, callback){


		if( !smtpTransport ){

			smtpTransport = this.initSMTP();
		}
		// setup e-mail data with unicode symbols
		var mailOptions = {
		    from: from, // sender address
		    to: to, // list of receivers
		    subject: subject, // Subject line
		    text: text, // plaintext body
		    html: html // html body
		}

		// send mail with defined transport object
		smtpTransport.sendMail(mailOptions, function(error, response){

			var status = new WebStatus();

			if( error ){
				status.setCode("500");
				status.setResult( error );
			}

			callback( status );
		});


	}

};
