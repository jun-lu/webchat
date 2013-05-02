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
	}
}

WE.pageTop.notice = {

	isShowContent : false,

	noticeCount : 0,

	init : function(){

		var _this = this;
		var box = $('#notice-box')
		_this.ui = {
			box : box,
			circle : box.find('.circle'),
			list : box.find('.notice-list'),
			title : box.find('.notice-title'),
			content : box.find('.notice-content'),
			loading : box.find('.we-loading')
		}
		_this.setNoticeCount();
		_this.regEvent();
	},

	regEvent : function(){
		var _this = this;
		_this.ui.title.click(function(){
			if( _this.isShowContent ){
				_this.ui.content.hide();
				_this.isShowContent = false;
			}else{
				_this.isShowContent = true;
				_this.ui.content.show();
				_this.getNoticeList();
			}
		});

		$('body').click(function(){
			_this.isShowContent = false;
			_this.ui.content.hide();
		});

		_this.ui.box.click(function(evt){
			evt.stopPropagation();
		});
	},

	/*
	 * 通知信息项模版
	 */
	noticeItemTmpl : '<li>\
						<span><%= from.name %></span>在<a target="_blank" data-mid="<%= _id %>" class="notice-item" href="/d/<%= what %>#<%= response %>"><%= where.topic %></a>回复了你\
					  </li>',


	/*
	 * 没有通知信息项模版
	 */
	noNoticeTmpl : '<p>最近没有收到新提醒...</p>',

	/*
	 * 没有更多的通知信息模版
	 */


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

			_this.noticeCount = data.result;
			if( data.result ){
				_this.ui.circle.show();
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
			if( data.code === 0 && data.result.length ){

				var html = '<ul>';
				for( var i = 0;i < data.result.length;i++ ){
					html += WE.kit.tmpl( _this.noticeItemTmpl,data.result[i] );
				}
				html += '</ul>';

				_this.ui.loading.remove();
				_this.ui.list.empty();
				$( html ).appendTo( _this.ui.list );
				
				// _this.ui.list.delegate('.notice-item','click',function(){
				// 	var mid = $(this).data('mid');
				// 	_this.setNoticeStatus( mid );
				// });
				
			}else{

				_this.ui.content.html( data.msg );
			}
		}
		model.addObserver( ctrl );
		model.noticeList();
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


	/*通知信息*/
	_this.notice.init();

}


$(document).ready(function(){

	WE.pageTop.init();
})
