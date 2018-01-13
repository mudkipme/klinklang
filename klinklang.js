import Koa from "koa";
import path from "path";
import compress from "koa-compress";
import favicon from "koa-favicon";
import bodyParser from "koa-bodyparser";
import serve from "koa-static";
import error from "koa-json-error";
import xHub from "koa-x-hub";
import nconf from "./app/lib/config";
import purge from "./app/routes/purge";
import renderRouter from "./app/routes/render";
import replaceRouter from "./app/routes/replace";
import wikihooksRouter from "./app/routes/wikihooks";

const app = new Koa();

app.use(compress());
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));
app.use(bodyParser());
app.use(xHub({secret: nconf.get("wikihooks:secret")}));
app.use(serve(path.join(__dirname, "public")));
app.use(error());

app.use(renderRouter.routes());
app.use(replaceRouter.routes());
app.use(wikihooksRouter.routes());
app.use(purge);

const server = app.listen(process.env.PORT || 3000, function() {
  console.log("Klinklang server listening on port " + server.address().port);
});

export default app;
