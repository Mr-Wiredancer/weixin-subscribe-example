var crypto = require('crypto')
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/weixintest', function(req, res){
  console.log(req.query)
  arr = ['dxhackers', req.query.timestamp, req.query.nonce];
  arr.sort();
  console.log(arr.join(''));
  var result = crypto.createHash('sha1').update(arr.join('')).digest('hex');
  console.log(result+'');
  console.log( req.query.signature);
  if (result === req.query.signature){
    res.send(req.query.echostr);
  }

});
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
