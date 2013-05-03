WE.boxCaht = {

	replyId : null,

	init : function(){
		this.regEvent();
	},
	regEvent : function(){

		var _this = this;
		/*可以通过ctrl+enter发送*/
		$('#postText').keydown(function( e ){

			if( (e.keyCode == 13 && _this.postType == 2) || 
				(e.ctrlKey && e.keyCode == 13 && _this.postType == 1) ){
				$('#postForm').trigger('submit');
				return false;
			}

		});


		$('#postText').keyup(function(){
			var div = $(this)[0];
			var text = div.innerText || div.textContent;		
			text = String(text).replace(/<\/div>/g,"").replace(/<div>/g,"\n").replace(/<br>/g, "\n");
			$('#postTextArea').val( text );
		});


		$('#postForm').submit(function(){

			var text = $.trim($('#postTextArea').val());
			var roomid = $('#roomid').val();
			//$('#postText').val('');
			$('#postTextArea').val('');
			//console.log( text, roomid );	
			if(text && roomid){
				_this.post( roomid, text, WE.boxCaht.replyId); // null
				location.reload();
				
			}else{
				$('#postText').focus();
			}
			return false;
		});

	},
	/*
	 * 发布对话信息
	 * @param {string/num} roomid 当前对话房间的id
	 * @param {string} text 对话内容
	 * @param {string} [to] 原对话的id(回复功能需发送) 
	 */
	post:function(roomid, text, to){

		$('#postTypeGroup button').attr('disabled','disabled').text('发送中...');

		to = !to ? undefined : to;
		var _this = this;
		var model = new WE.api.ChatModel();//
		var ctrl = new WE.Controller();
		
		ctrl.update = function( e ){

			var data = e.data;
			if( data.code == 0 ){//post提交成功

				//_this.timeLine.prepend( data.r );
				$('#postText').html('').focus();
				$('#postTypeGroup button').removeAttr('disabled').text('发送');

				//WE.pageChat.reply.delOrig();
			}

		};
		model.addObserver( ctrl );

		model.postChat( roomid, text, to );
	}
}