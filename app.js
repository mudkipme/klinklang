
/**
 * Module dependencies.
 */

var express = require('express');
var path = require('path');
var compress = require('compression');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var sassMiddleware = require('node-sass-middleware');

var app = express();

// all environments
app.set('port', process.env.PORT || 3393);
app.use(compress());
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('your secret here'));
app.use(session({secret: 'keyboard cat', resave: true, saveUninitialized: true}));

// development only
if ('development' == app.get('env')) {
  app.use(sassMiddleware({ src: __dirname + '/public', outputStyle: 'nested' }));
  app.use(express.static(path.join(__dirname, 'public')));
}

if ('production' == app.get('env')) {
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
  res.sendFile(__dirname + '/public/index.html');
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({
      error: err.message,
      detail: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({ error: err.message });
});

module.exports = app;