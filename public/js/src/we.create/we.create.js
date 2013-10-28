WE.pageCreate = {
	init: function(){

		var form = $('#create');
		this.ui = {
			form: form,
			topic: $('#topic'),
			desBox: $('#des-box'),
			pwdBox: $('#pwd-box'),
			infoBox: $('#info-box')
		};

		this.regEvent();
	},

	regEvent: function(){

		var _this = this,
			isSettimeout = null;

		this.ui.desBox.find('.des-btn').click(function(){

			if( _this.ui.desBox.find('.input-content').is(':hidden') ){
				_this.ui.desBox.find('.input-content').removeClass('hidden');
				$(this).find('.icon-pen').removeClass('icon-pen').addClass('icon-close');

			}else{
				_this.ui.desBox.find('.input-content').addClass('hidden');
				$(this).find('.icon-close').addClass('icon-pen').removeClass('icon-close');


			}
			return false;
			
		});

		this.ui.pwdBox.find('.pwd-btn').click(function(){

			if( _this.ui.pwdBox.find('.input-content').is(':hidden') ){

				_this.ui.pwdBox.find('.input-content').removeClass('hidden');
				_this.ui.pwdBox.find('.header').css({'border-bottom':'#F0E02F solid 1px'});
				$(this).find('.icon-pen').removeClass('icon-pen').addClass('icon-close');

			}else{

				_this.ui.pwdBox.find('.input-content').addClass('hidden');
				_this.ui.pwdBox.find('.header').css({'border-bottom':'0'});
				$(this).find('.icon-close').addClass('icon-pen').removeClass('icon-close');

			}
			
			return false;
		});

		this.ui.form.submit(function( e ){

			e.preventDefault();
			var topic = $.trim( _this.ui.topic.val() );

			if( topic == "" ){
				return false;
				
			}
			
			_this.createTopic();
			
		});
	},

	createTopic: function(){

		var topic = $.trim( this.ui.topic.val() );
		var des = $.trim( this.ui.desBox.find('textarea').val() );
		var pwd = $.trim( this.ui.pwdBox.find('input').val() );

		var model = new WE.api.RoomModel();
		var ctrl = new WE.Controller();
		ctrl.update = function(e){
			var data = e.data;

			if( data.code == 0 ){
				location.href = "/t/"+data.result.id;
			}
		}
		model.addObserver( ctrl );
		model.create(topic, des, pwd);	
	}
}