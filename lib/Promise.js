/**

	Promise

		.resolve()
		.reject()

	add 不依赖队列直接执行
	then 依赖以前的队列 当前一个队列 .ok() 后开始执行。并接收 ok 传递的参数


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

      if( this.query[ length ] == undefined ){
        this.query[ length ] = [stepFunction];
      }else if(  this.query[ length ] instanceof  Function){
        this.query[ length ] = [this.query[ length ],stepFunction];//.unshift( this.query[ length ] );
      }else{
        this.query[ length ].push( stepFunction );
      }

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
  //成功
  ok:function(){
  
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

  },
  out:function(){} 	

};