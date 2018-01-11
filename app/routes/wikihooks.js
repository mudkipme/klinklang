import Router from "koa-router";

const router = new Router();

router.post("/api/wikihooks", async (ctx) => {
  if (!ctx.request.isXHub || !ctx.request.isXHubValid()) {
    ctx.throw(403, "Invalid X-Hub Request");
  }
  ctx.body = null;
});

export default router;