/*
 * pageTop的接口
 */
WE.pageTop = {

	/*
	 * 设置用户名
	 * @param [USER] user
	 */
	setUserName : function( user ){

		var dialog = new WE.Dialog({
			title : "修改昵称",
			id : "setUserName",
			width : 400,
			height : 200
		});

		dialog.onclose = function(){
			console.log('What');
		}
		
		dialog.show();


		

		WE.kit.getTmpl("update_user_name.ejs", function( data ){

			var html = WE.kit.tmpl( data, user );
			dialog.append( html );

			$('#setUserNameForm').submit(function(){

				var elenewUserName = $('#newUserName');
				var name = elenewUserName.val();
				if( name ){

					$('#setUserNameForm input[type=submit]').attr('disabled','disabled').val('提交中...');

					var model = new WE.api.ChatModel();
					var ctrl = new WE.Controller();
					ctrl.update = function( e ){

						var data = e.data;

						if( data.code == 0 ){

							$('#setUserNameForm input[type=submit]').removeAttr('disabled').val('提交');
							dialog.close();
							setTimeout(function(){
								document.location.reload();
							}, 500)
						}

					};
					model.addObserver( ctrl );
					model.updateUserName( name );	

				}else{
					elenewUserName.focus();
				}

				return false;
			});


			$('#anonymous').click(function(){

				$('#newUserName').val("匿名");
				$('#setUserNameForm').submit();
			});
		});
	},

	/*
	 * 邮箱绑定
	 */
	bindEmail : function(){

		var dialog = new WE.Dialog({
				title:"设置mail",
				id:"setMail",
				width:400,
				height:200
		});
		dialog.show();

		WE.kit.getTmpl("bind_mail.ejs", function( data ){

			//var html = WE.kit.tmpl( data, {});
			dialog.append( data );

			$('#bindMialForm').submit(function(){

				var mail = $.trim($('#updateMail').val());
				var pwd = $.trim($('#updatePwd').val());

				if( /^[\w._\-]+@[\w_\-]+\.\w+$/.test(mail) ){

					if(pwd.length>5){

						update( mail, pwd );

					}else{

						alert("密码长度至少6位");
					}

				}else{

					alert("mail, 格式不正确");
				}

				return false;

			});			
		});

		function update( mail, pwd ){

			$('#bindMialForm input[type=submit]').attr('disabled','disabled').val('提交中...');

			var model = new WE.api.ChatModel();
			var ctrl = new WE.Controller();
			ctrl.update = function( e ){

				var data = e.data;

				if( data.code == 0 ){

					$('#bindMialForm input[type=submit]').removeAttr('disabled').val('提交');
					dialog.close();
					setTimeout(function(){	
						document.location.reload();
					},600);
					
				}

			};
			model.addObserver( ctrl );
			model.updateMailPwd( mail, pwd );
		}
	},

	/*
	 * 查看历史记录
	 * @param [string] id : 用户id
	 */
	getHistory : function(){

		var dialog = new WE.Dialog({
				title:"参与过的对话",
				id:"getHistory",
				width:200,
				height:200
		});
		dialog.show();

		WE.kit.getTmpl("history_chat.ejs", function( tmpl ){

		
			var model = new WE.api.TopModel();
			var ctrl = new WE.Controller();
			ctrl.update = function( e ){
				var data = e.data;

				if( data.code == 0 ){

					var html = WE.kit.tmpl( tmpl,data.result );
					dialog.append( html );
				}
			}
			model.addObserver( ctrl );
			model.historyChats();
			
		});
	}
}

WE.pageTop.init = function(){

	var _this = this;

	$('#username').click(function(){
		_this.setUserName( USER );
	});

	$('#bindmail').click(function(){
		_this.bindEmail();
	});

	$('#chatme').click(function(){
		_this.getHistory();
	})
}


$(document).ready(function(){

	WE.pageTop.init();
})
