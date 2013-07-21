
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , sass = require('./middlewares/sass-middleware');

var app = express();

// all environments
app.set('port', process.env.PORT || 3393);
app.use(express.compress());
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(sass({ src: __dirname + '/public', style: 'compact' }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.errorHandler());
}

if ('production' == app.get('env')) {
  app.use(sass({ src: __dirname + '/dist', style: 'compressed' }));
  app.use(express.static(path.join(__dirname, 'dist')));
}

// routes
var translate = require('./routes/translate');
var replace = require('./routes/replace');
var scss = require('./routes/scss');
app.post('/api/replace', replace);
app.post('/api/translate', translate);
app.post('/api/scss', scss);
app.get(/^\/(replacer|translator|card|scss)\/?$/, function(req, res){
  res.sendfile(__dirname + '/public/index.html');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});