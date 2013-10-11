WE.top = {


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
}