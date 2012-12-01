var http = require('http');
var url = require('url');
var jsdom = require('jsdom');

http.createServer(function(request, response) {

  var pu = url.parse(request.url, true);

  if (pu.pathname === '/') {
    if (!pu.query.url || !pu.query.url.match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)) {
      response.writeHead(500, {'Content-Type': 'text/html'});  
      response.write('<h1>500</h1>');
      response.end();
    }
    else {
      jsdom.env({
        html: "https://plusone.google.com/_/+1/fastbutton?url=" + pu.query.url,
        done: function (err, window) {
          var m = window.document.getElementsByTagName("script")[2].innerHTML.match(/window.__SSR = \{c: ([0-9]*)\.0/);
          var body = JSON.stringify({
            count: m ? parseInt(m[1]) : 0,
            url: pu.query.url
          });

          if (pu.query.callback) {
            body = pu.query.callback + '(' + body + ');';
          }

          response.writeHead(200, {'Content-Type': 'text/javascript'});  
          response.write(body);
          response.end();
        }
      });
    }
  }
  else {
    response.writeHead(404, {'Content-Type': 'text/html'});  
    response.write('<h1>404</h1>');
    response.end();
  }

}).listen(51441, function() {
  console.log('Proxy server started and listening on port 51441');
});