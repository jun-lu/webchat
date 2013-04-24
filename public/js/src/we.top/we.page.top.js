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

						$('#setUserNameForm input[type=submit]').removeAttr('disabled').val('提交');
						if( data.code == 0 ){

							dialog.close();
							setTimeout(function(){
								document.location.reload();
							}, 500)
						}else{

							alert(data.msg);
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

				$('#bindMialForm input[type=submit]').removeAttr('disabled').val('提交');
				if( data.code == 0 ){

					dialog.close();
					setTimeout(function(){	
						document.location.reload();
					},600);
					
				}else{

					alert(data.msg);
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
	},



	/*
	 * 通知信息项模版
	 */
	noticeItemTmpl : '<% for(var i=0;i < obj.length;i++ ){ %>
					  <li>\
						<span><%=obj[i].from.name%></span> 在 \
						<a data-mid="<%=obj[i]._id%>" class="notice-item" href=""><%=obj[i].where.topic%></a>回复了你\
					  </li>\
					  <% } %>',


	/*
	 * 初始化通知信息，获取是否有未读信息
	 * @ #notice-count : 设置多少条未读信息数
	 */
	setNoticeCount : function(){
		var _this = this;
		var model = new WE.api.NoticeModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){
			var data = e.data;

			if( data.result ){
				$('#notice-conut').text( data.result );
				$('#notice-box').click(function(){
					_this.getNoticeList();
				});
			}
			
		};
		model.addObserver( ctrl );
		model.noticeCount();
	},



	/*
	 * 获取未读信息
	 * 
	 */
	getNoticeList : function(){
		var _this = this;
		var model = new WE.api.NoticeModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			var data = e.data;
			if( data.result.length ){

				var html = WE.tmpl( _this.noticeItemTmpl,data );
				$( html ).appendTo( $('#notice-list-box') );
				$('#notice-list-box').delegate('.notice-item','click',function(){
					var mid = $(this).data('mid');
					$(this).closest('li').remove();
					_this.setNoticeStatus( mid );

				});
			}
		}
		model.addObserver( ctrl );
		model.noticeList();
	},

	/*
	 * 修改未读信息状态
	 * 
	 */
	setNoticeStatus : function( mid ){

		var model = new WE.api.NoticeModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){
			var data = e.data;
		}
		model.addObserver( ctrl );
		model.noticeStatus( mid );
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
	});


	/*初始化设置多少已读条数*/
	_this.setNoticeCount();

}


$(document).ready(function(){

	WE.pageTop.init();
})
