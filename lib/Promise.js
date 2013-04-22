/**

	Promise

		.resolve()
		.reject()

	when 当
	then 然后


*/


var Promise = module.exports = function(req, res){

  this.req = req;
  this.res = res;

  this.index = 0;
  this.stepIndex = 0;
  this.itemCount = 0;
  this.query = [];
};


Promise.prototype = {

  constructor:Promise,
  
  then:function( stepFunction ){

    this.query.push( stepFunction );

  },
  add:function( stepFunction ){
    var length = this.query.length;
    if( length > 0 ){
      length -= 1;
      this.query[ length ] = this.query[ length ] instanceof Function ? [stepFunction].concat( this.query[ length ] ) : [stepFunction];

    }else{
      this.query = [ stepFunction ];
    }
  },
  //成功
  resolve:function(){
  
    this.stepIndex++;

    //console.log(this.stepIndex, this.itemCount);
    if(this.stepIndex == this.itemCount){
      this.index++;
      this.stepIndex = this.itemCount = 0;

      this.start.apply(this,arguments);
    }

  },

  start:function(){

    var item = this.query[this.index];
    if( item ){
      if( item instanceof Array){
        this.itemCount = item.length;
        for(var i=0; i<item.length; i++){

          
          item[i].apply(this, arguments);

        }
      }else{
        this.itemCount = 1;
        item.apply(this, arguments);
      }
    }

  }


};

/**
	var promise = new Promise(req, res);

	promise.when(function( index ){

		if( index == 1 ){

			this.resolve( ++index );

		}else{

			console.log( hello world );

		}

	});

	promise.add(function(){


	});

	promise.when(function(){


	});

	promise.then(function(){


	});




Promise


	p = new Promise();

	var x = function(a){ a++ ; p.resolve(a);};
	var y = function(a){ a++; p.resolve(a);}




	p.xxx(function(a){

		a++;
		p.resolve( a );
	});

	p.xxx(function( a){
 		a//2
		p.resolve();
	});


	p.start(1);
*/