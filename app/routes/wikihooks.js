import Router from "koa-router";
import { runHook } from "../lib/trigger";

const router = new Router();

router.post("/api/wikihooks", async (ctx) => {
  if (!ctx.request.isXHub || !ctx.request.isXHubValid()) {
    ctx.throw(403, "Invalid X-Hub Request");
  }
  const { action, data } = ctx.request.body;
  runHook(action, data);
  ctx.body = null;
});

export default router;