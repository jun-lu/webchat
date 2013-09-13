var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
  res.write('Hello\n vchat.co 正在升级...大约还需要3小时', 'utf-8');
  res.end();
}).listen(80);
console.log('Server running at http://127.0.0.1:80/');