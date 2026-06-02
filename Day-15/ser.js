let http = require('http');
http.createServer(function (req, res) {
    res.end('Welcome to SOCET');
}).listen(8080);