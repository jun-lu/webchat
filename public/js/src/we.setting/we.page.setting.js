WE.pageSetting = {

	init : function() {
		this.regEvent();
	},
	regEvent : function(){
		var _this = this;
		var form = $('#modifyForm');

		this.ui = {
			modifyBtn : $('#modify'),
			modifyForm : form,
			unModifyBtn : form.find('.out'),
			des : $('#des'),
			modifyInput : $('#modifyInput'),
			summery : $('#summery')
		}

		this.summery = this.ui.summery.text();

		this.ui.modifyBtn.click(function(){
			_this.ui.modifyInput.val( _this.summery );
			_this.ui.modifyForm.show();
			_this.ui.des.hide();
		});

		this.ui.unModifyBtn.click(function(){
			_this.ui.modifyForm.hide();
			_this.ui.des.show();
		});

		this.ui.modifyForm.submit(function(){

			var summery = _this.ui.modifyInput.val();
			if( _this.ui.modifyInput.val().length < 300 && summery != _this.summery ){
				_this.postForm( summery );
			}
			return false;
		})
	},
	postForm : function( summery ){
		var _this = this;
		var model = new WE.api.SettingModel();
		var ctrl = new WE.Controller();

		ctrl.update = function( e ){

			var data = e.data;
			if( data.code == 0 ){
				_this.ui.summery.html( WE.kit.chatFormate( summery ) );
				_this.summery = summery;
				_this.ui.modifyForm.hide();
				_this.ui.des.show();
			}
		};
		model.addObserver( ctrl );

		model.updateUserSummery( summery );
	}
}