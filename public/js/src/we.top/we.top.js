WE.top = {};

WE.top.init = function(){

	WE.top.search.init();
	WE.top.notice.init();
}

WE.top.search = {


	init: function(){

		var box = $('#search-box');

		this.ui = {
			box: box,
			input: box.find('.search-input'),
			resultBox: box.find('.result-box'),
			results: box.find('.results'),
			loading: box.find('.loading'),
			searchForm: $('#search-form')
		};

		this.regEvent();
	},

	value:null,
	isSearch:false,
	inputGrap:null,
	regEvent: function(){

		var _this = this;

		

		_this.ui.input.keyup(function( e ){

			if( e.keyCode == 38 || e.keyCode == 40 ){

				return false;
			}

			if( e.keyCode == 13 ){

				if( _this.datas != null && _this.index != -1 &&
						_this.index != ( _this.maxIndex -1 )
					){
					window.location.href = '/t/' + ( _this.datas[_this.index].name || _this.datas[_this.index].id );
					
				}else{

					window.location.href = '/search?key=' + _this.value;
				}

				e.preventDefault();
				e.stopPropagation();
				return false;
				
			}

			var value = $.trim( _this.ui.input.val() );

			_this.ui.results.html('');
			_this.ui.results.append( WE.kit.tmpl(_this.searchTmpl,{key:value} ) );

			

			clearTimeout(_this.inputGrap);

			if( value != "" ){

				_this.ui.resultBox.removeClass('hidden');
				_this.ui.loading.show();
				_this.value = value;

				_this.inputGrap = setTimeout(function(){

					_this.search(value);

				},350);
				

			}else if( value == "" ){
				_this.ui.resultBox.addClass('hidden');
			}
		});

		_this.ui.input.keydown(function( e ){

			var keyCode = e.keyCode;

			if( keyCode == 13 ){

				e.preventDefault();
			}

			if( keyCode == 38 || keyCode == 40 ){
				e.preventDefault();

				_this.select( keyCode == 38 ? -1 : 1 );
			}
		});

		_this.ui.input.blur(function( e ){
	
			_this.ui.resultBox.addClass('hidden');
		});


		_this.ui.resultBox.mousedown(function( e ){

			_this.ui.resultBox.removeClass('hidden');

			e.stopPropagation();

			return false;
		});

		_this.ui.results.keydown(function(e){

			_this.ui.resultBox.removeClass('hidden');

			e.stopPropagation();

			return false;

		})
	},

	search: function( key ){

		var _this = this;
			_this.isSearch = true;
		var model = new WE.api.RoomModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			var data = e.data;

			if( data.code == 0 ){

				_this.setResult( key, data.result );
				_this.isSearch = false;
			}
			//console.log('data',data);
		}
		ctrl.error = function(){
			_this.isSearch = false;
		};
		model.addObserver( ctrl );
		model.search( key );
	},

	resultTmpl:'<a href="/t/<%=name || id %>"><i class="icon-chat"></i><%=topic %></a>',
	searchTmpl:'<a class="key" href="/search?key=<%=encodeURIComponent(key) %>">Search Topics for "<%=encodeURIComponent(key) %>"</a>',
	setResult: function( key, datas ){

		var tmpl = '';
		var len = datas.length;



		if( datas.length > 0 ){

			for(var i=0; i<len; i++){
				tmpl += WE.kit.tmpl(this.resultTmpl,datas[i]);
			}
		}

		tmpl += WE.kit.tmpl(this.searchTmpl,{key:key});

		
		this.ui.loading.hide();

		this.ui.results.empty().addClass('hidden');
		this.ui.results.html( tmpl );


		this.index = -1;
		this.maxIndex = len+1;
		this.datas = datas;


		this.ui.results.removeClass('hidden');
		
		
	},

	index:-1,
	maxIndex:0,
	datas:null,
	// direct [ -1 : down, 1 : up ]
	select: function( direct ){


		var index = this.index;
		var maxIndex = this.maxIndex;
		var a = this.ui.results.find('a');

		a.eq(index == -1 ? maxIndex-1 : index).removeClass('select');

		index += direct;
		index = index > maxIndex ? 0 : index;
		index = index < 0 ? maxIndex : index;
		
		index != -1 && a.eq(index).addClass('select');

		index != -1 && this.ui.input.val( a.eq(index).text() == "" ? this.value : a.eq(index).text() );

		this.index = index;
	}
};




WE.top.notice = {
	hasNotices:false,
	noticeTmpl:'<li>\
					<a href="/user/<%=from._id %>"><%=from.name %></a> 在 <a href="/d/<%=response %>?noticeid=<%=_id %>"><%=where.topic %></a> 回复了你\
					<span class="know" data-nid="<%=_id %>">Do not reminde</span>\
				</li>',

	noResultTmpl: '<p class="no-notice">No recent new notice...</p>',

	init: function(){

		var wall = $('#notice-box');

		this.ui = {

			wall: wall,
			bell: wall.find('.bell'),
			list: wall.find('.notice-list')
		}

		this.getStatus();
		//this.poll();
		this.regEvent();

	},

	pollPoint:null,
	poll: function(){

	},

	regEvent: function(){

		var _this = this;


		$('body').click(function(){

			_this.ui.list.hide();
			//_this.poll();
		});

		this.ui.wall.click(function( e ){

			e.stopPropagation();

			_this.ui.list.show();
		});

		this.ui.bell.click(function( e ){

			clearInterval(_this.pollPoint);

			_this.hasNotices = false;
			_this.setBellStatus(0);
			_this.getNotices();
			_this.ui.list.removeClass('hidden');

			

			e.preventDefault();
			
		});


		this.ui.list.delegate('.know','click',function(){

			var $this = $(this);
			var nid = $this.attr('data-nid');

			var model = new WE.api.NoticeModel();
			var ctrl = new WE.Controller();
			ctrl.update = function( e ){

				var data = e.data;
				if( data.code == 0 ){

					$this.animate({'height':'0px'},800,function(){
						$this.remove();
					})
					
					_this.getNotices();
					//_this.poll();

				}
			}
			model.addObserver(ctrl);
			model.noticeStatus( nid );


		});
	},	

	getStatus: function(){

		var _this = this;

		var model = new WE.api.NoticeModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			var data = e.data;

			if( data.code == 0 ){

				if( data.result == 0 ){
					_this.hasNotices = false;
					return false;
				}
				_this.hasNotices = true;
				_this.setBellStatus(1);

			}
		}
		model.addObserver(ctrl);
		model.noticeCount();
	},

	/*
		type : 1(has) 0(no)
	 */
	setBellStatus: function( type ){

		type ? this.ui.bell.find('i')
					.removeClass('icon-noticedefault')
					.addClass('icon-noticeaction') :
			   this.ui.bell.find('i')
			   		.removeClass('icon-noticeaction')
			   		.addClass('icon-noticedefault');
	},

	appends: function( datas ){

		var len = datas.length;
		var i = 0;
		var html = '<ul class="notices">';

		for(; i<len; i++){

			html += WE.kit.tmpl(this.noticeTmpl,datas[i]);
		}

		html += '</ul>';

		this.ui.list.find('.content').empty().append( html );
	},


	setNoResult: function(){

		this.ui.list.find('.content').empty().append( this.noResultTmpl );
	},

	getNotices: function(){

		var _this = this;

		var model = new WE.api.NoticeModel();
		var ctrl = new WE.Controller();
		ctrl.update = function( e ){

			var data = e.data;
			
			if( data.code == 0 ){

				if( data.result.count ){

					
					_this.appends( data.result.list );
				}else{

					_this.setNoResult();
				}
			}
		}
		model.addObserver(ctrl);
		model.noticeList();
	}


};