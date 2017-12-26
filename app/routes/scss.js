import Router from "koa-router";
import sass from "node-sass";
import {promisify} from "util";

const router = new Router();

router.post("/api/scss", async function (ctx) {
  if (!ctx.req.isXHub || !ctx.req.isXHubValid()) {
    ctx.throw(403, "Invalid X-Hub Request.");
  }
  const { css } = await promisify(sass.render.bind(sass))({
    data: ctx.request.body.text || "",
    outputStyle: "compressed"
  });
  ctx.body = { text: css.toString().split("}").join("}\n") };
});

export default router;