import purger from "../lib/purge";

export default async function (ctx, next) {
  if (ctx.request.method !== "PURGE") {
    return await next();
  }

  purger(ctx.request);
  ctx.body = "Purge task added.";
}