WE.top = {

	init: function(){

		var box = $('#search-box');

		this.ui = {
			box: box,
			input: box.find('.search-input'),
			result: box.find('.result-box')
		}

		this.regEvent();
	},

	regEvent: function(){

		var _this = this;

		_this.ui.input.keyup(function( e ){

			var value = $.trim( _this.ui.input.val() );

			if( value != "" ){
				_this.search(value);
			}
		});
	},

	search: function( key ){

		var _this = this;
		var model = new WE.api.RoomModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			var data = e.data;
			console.log('data',data);
		}
		model.addObserver( ctrl );
		model.search( key );
	}
}