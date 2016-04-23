import Koa from 'koa';
import path from 'path';
import compress from 'koa-compress';
import favicon from 'koa-favicon';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import error from 'koa-json-error';

const app = new Koa();

app.use(compress());
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(bodyParser());
app.use(serve(path.join(__dirname, 'public')));
app.use(error());

const server = app.listen(process.env.PORT || 3393, function() {
  console.log('Paradise server listening on port ' + server.address().port);
});