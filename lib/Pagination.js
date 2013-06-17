
/**
	
	Pagination
		分页插件
	UI
	http://twitter.github.io/bootstrap/components.html#thumbnails
	
	currentPage
	totalPage


	HTML
	<ul>
	    <li><a href="#">«</a></li>
	    <li><a href="#">1</a></li>
	    <li><a href="#">2</a></li>
	    <li><a href="#">3</a></li>
	    <li><a href="#">4</a></li>
	    <li><a href="#">5</a></li>
	    <li><a href="#">»</a></li>
	  </ul>

		
*/

var Pagination = module.exports = function( currentPage , totalPage, baseURL, max){
	
	this.html = "<ul>";
	this.max = max || 10;
	this.currentPage = parseInt(currentPage);
	this.totalPage = parseInt(totalPage);
	this.baseURL = baseURL;

};


Pagination.prototype = {
	construcotr:Pagination,
	createItem:function( text, index, disabled ){

		if( disabled ){

			return '<li class="disabled"><span>'+ text +'</span></li>'
		}

		return '<li><a href="'+this.baseURL+'page/'+index+'">'+ text +'</a></li>';

	},
	getHTML:function(){
		var html = this.html;

		for(var i=1; i<=this.totalPage; i++){

			//上一页
			if(i == 1 && this.totalPage > 2 && this.currentPage > 1){

				html += this.createItem("«", this.currentPage-1);

			}

			//上一段
			if(i == 1 && this.currentPage > this.max/2){
				html += this.createItem("...", parseInt(this.currentPage - this.max/2) );
			}

			if( Math.abs(i - this.currentPage) < this.max/2 ){
				html += this.createItem(i, i, i == this.currentPage);
			}

			//下一段
			if(i == this.totalPage && i >= this.currentPage + this.max/2){
				html += this.createItem("...", parseInt(this.currentPage + this.max/2) );
			}

			//下一页
			if(i == this.totalPage && this.totalPage > 2 && this.currentPage != this.totalPage){
				html += this.createItem("»", this.currentPage+1);
			}

		}

		html += "</ul>";
		this.html = html;
		return this.html;

	}
}