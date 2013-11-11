/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , crypto = require('crypto')
  , xml2js = require('xml2js')
  , Js2Xml = require('js2xml').Js2Xml
  , parseString = xml2js.parseString;

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

app.post('/weixintest', function(req, res){
  // if not valid, return
  if (!isValidWeixinRequest(req.query.signature, req.query.timestamp, req.query.nonce)){
    return;
  }

  var body = '';

  req.on('data', function (data) {
    body = body+data;
  });

  req.on('end', function(){
    parseString(body, function(err, result){
      var xml = result.xml;
      
      var temp = xml.ToUserName[0];
      xml.ToUserName = xml.FromUserName[0];
      xml.FromUserName = temp;
      xml.Content = 'hello back'; // for now, naively return a message of "hello back"
      xml.CreateTime = xml.CreateTime[0];
      xml.MsgType = xml.MsgType[0];
      delete xml.MsgId;
      console.log(xml);
      var result = new Js2Xml('xml', xml);
      res.send( result.toString() );
    });
  });
});

//开发者验证流程详见微信开放平台文档
var isValidWeixinRequest = function(signature, timestamp, nonce){
  var arr = ['dxhackers', timestamp, nonce];
  arr.sort();

  return crypto.createHash('sha1').update(arr.join('')).digest('hex') === signature;
}

//通过开发者验证
app.get('/weixintest', function(req, res){
  if ( isValidWeixinRequest(req.query.signature, req.query.timestamp, req.query.nonce)){
    res.send(req.query.echostr);
  }
});

app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
