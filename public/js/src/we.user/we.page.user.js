WE.userPage = {};


/** 
	edit account
*/
WE.userPage.editAccount = {

	init: function(){


		this.ui = {
			itemWall: $('#edit-info').find('.edit-item'),
			nickNameWall: $('#nickname-wall'),
			desWall: $('#des-wall'),

			nameClose: $('#close-name'),
			nameSubmit: $('#submit-name'),

			desClose: $('#close-des'),
			desSubmit: $('#submit-des'),

			nameInput: $('#name-input'),
			desInput: $('#des-input')
		}

		this.regEvent();
	},

	regEvent: function(){

		var _this = this;

		this.ui.nickNameWall.find('.display').click(function(){
			
			_this.viewName();
		});

		this.ui.desWall.find('.display').click(function(){
			
			_this.viewDes();
		});


		// close
		this.ui.nameClose.click(function(){

			_this.hideName();
		});

		this.ui.desClose.click(function(){

			_this.hideDes();
		});

		// submit
		this.ui.nameSubmit.click(function(){

			var value = $.trim( _this.ui.nameInput.val() );
			if( value != "" ){
				_this.updateUserName(value);
			}
		});

		this.ui.nameInput.keyup(function( e ){

			if( e.keyCode == 13 ){
				_this.ui.nameSubmit.click();
			}

		});

		this.ui.desSubmit.click(function(){

			var value = $.trim( _this.ui.desInput.val() );
			if( value != "" ){
				_this.updateUseDes(value);
			}
		});

		this.ui.desInput.keyup(function( e ){

			if( e.keyCode == 13 ){
				_this.ui.desSubmit.click();
			}
		})
	},

	viewName: function(){
		this.ui.nickNameWall.addClass('edit-item-select');
		this.ui.nickNameWall.find('.edit').removeClass('hidden');
		this.ui.nickNameWall.find('.icon-user')
			.removeClass('color-user-dark')
			.addClass('color-user-white');
	},

	viewDes: function(){
		this.ui.desWall.addClass('edit-item-select');
		this.ui.desWall.find('.edit').removeClass('hidden');
		this.ui.desWall.find('.icon-list').addClass('color-list-white');
	},

	hideName: function(){
		this.ui.nickNameWall.removeClass('edit-item-select');
		this.ui.nickNameWall.find('.edit').addClass('hidden');
		this.ui.nickNameWall.find('.icon-user')
			.addClass('color-user-dark')
			.removeClass('color-user-white');
	},

	hideDes: function(){
		this.ui.desWall.removeClass('edit-item-select');
		this.ui.desWall.find('.edit').addClass('hidden');
		this.ui.desWall.find('.icon-list').removeClass('color-list-white');
	},


	updateUserName: function( name ){

		var _this = this;

		var model = new WE.api.UserModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			var data = e.data;
			if( data.code == 0 ){

				_this.ui.nickNameWall.find('.display .info')
					.text(name)
					.removeClass('no-info');
				_this.hideName();
			}
		}
		model.addObserver( ctrl );
		model.updateUserName( name );
	},

	updateUseDes: function( des ){

		var _this = this;

		var model = new WE.api.UserModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			var data = e.data;
			if( data.code == 0 ){

				_this.ui.desWall.find('.display .info')
					.text(des)
					.removeClass('no-info');
				_this.hideDes();
			}
		}
		model.addObserver( ctrl );
		model.updateUserSummery( des );
	}
}


/**
	edit avatar
*/
WE.userPage.editAvatar = {

	init: function(){

		this.ui = {
			submit: $('#avatar-submit'),
			radios: $('#select-item')
		}

		this.regEvent();
	},

	regEvent: function(){

		var _this = this;

		this.ui.submit.click(function(){

			var type = _this.ui.radios.find('input[type=radio]:checked').val();
			_this.updateAvatar( type );
		});
	},

	updateAvatar: function( type ){


		var _this = this;

		var model = new WE.api.UserModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			location.reload();
		}
		model.addObserver( ctrl );
		model.updateAvator( type );
	}
}



/**
	bind mail
*/
WE.userPage.bindMail = {

	init: function(){

		this.ui = {
			submit: $('#bindMail-submit'),
			input: $('#bindMail-input'),
			pwd: $('#pwd-input'),
			tips: $('#bindMail-tip')
		};

		this.regEvent();
	},

	regEvent: function(){

		var _this = this;

		this.ui.submit.click(function(){

			var value = $.trim( _this.ui.input.val() );
			var pwd = $.trim( _this.ui.pwd.val() )

			if( value != "" && pwd != "" ){

				if( /^[^@]+@[^@]+$/.test(value) ){

					_this.verifMail( value,pwd, _this.updateMail, _this.errorTip );

				}else{

					_this.errorTip('Please enter a valid email');
					//wrong
				}
			}

		});
	},

	verifMail: function( mail,pwd,succCallback,errorCallback ){

		var _this = this;

		var model = new WE.api.UserModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			var data = e.data;
			if( data.code == 0 ){

				succCallback && succCallback( mail,pwd );
			}else{

				errorCallback && errorCallback("Email is exit! please try others");
			}
		}
		model.addObserver( ctrl );
		model.verifMail( mail );
	},

	updateMail: function( mail,pwd ){


		var _this = this;

		var model = new WE.api.UserModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			var data = e.data;

			if( data.code == 0 ){
				loaction.reload();
			}
			//console.log(data);
		}
		model.addObserver( ctrl );
		model.updateMail( mail );

	},

	errorTip: function( tip ){

		var _this = this;

		this.ui.tips.text(tip).removeClass('hidden');

	}
}



/**
	home
*/
WE.userPage.home = {

	tmpl: '<li>\
				<div class="avatar pull-left">\
					<a href="/user/<%=_id %>">\
						<img src="<%=avatar %>">\
					</a>\
				</div>\
				<div class="info pull-left">\
					<a href="/user/<%=_id %>"><%= name == "" ? "(未设置昵称)" : name %></a>\
					<span><%=summary == "" ? "(No description)" : WE.kit.cutOff(summary,30)  %></span>\
				</div>\
			</li>',

	noTmpl: '<li>\
				<span>No contects...</span>\
			</li>',

	init: function(){

		this.ui = {
			list: $('#contacts')
		}
		this.loadContacts();
	},	


	loadContacts: function(){

		var _this = this;

		var model = new WE.api.UserModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			var data = e.data;

			if( data.code == 0 ){

				if( data.result.length > 0 ){

					_this.appends( data.result );

				}else{

					$( _this.noTmpl ).appendTo( _this.ui.list );
				}
			}
		}
		model.addObserver(ctrl);
		model.getContactList();
	},

	appends: function( datas ){

		var html = '';
		var i = 0;

		if( datas.length > 0 ){

			var len = datas.length;
			for(; i<len; i++){

				html += WE.kit.tmpl(this.tmpl,datas[i].to );
			}

			$( html ).appendTo( this.ui.list );
		}

	}
}