
/**
	number:19
	action: 获取前端js所需要的模版
	logic：从 /views/tmpl/ 下获取 path 文件并返回内容
	
	
	url:/sys/tmpl
	method:get
	param:
		path: string
	
	return string
	
*/
var fs = require("fs");

module.exports = function(req, res){
	var file = req.query.path;
	if(file){
		fs.readFile(__dirname+"/../../views/tmpl/"+file, "utf-8", function(err, data){
			res.setHeader("Content-Type" ,"text/ejs; charset=utf-8");
			res.end(data);
		});
	}else{
		res.write( file + "not defined");
		res.end();
	}
}