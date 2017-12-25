import Koa from 'koa';
import path from 'path';
import compress from 'koa-compress';
import favicon from 'koa-favicon';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import error from 'koa-json-error';
import c2k from 'koa-connect';
import xhub from 'express-x-hub';

// routers
import replaceRouter from './app/routes/replace';
import scssRouter from './app/routes/scss';

const app = new Koa();
const config = require('./config.json');

app.use(compress());
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(c2k(xhub({ secret: config.secret })));
app.use(bodyParser());
app.use(serve(path.join(__dirname, 'public')));
app.use(error());

app.use(replaceRouter.routes());
app.use(scssRouter.routes());

const server = app.listen(process.env.PORT || 3001, function() {
  console.log('Klinklang server listening on port ' + server.address().port);
});