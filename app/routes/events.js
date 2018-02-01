import path from "path";
import Router from "koa-router";
import winston from "winston";
import ipaddr from "ipaddr.js";
import nconf from "../lib/config";
import handleEvent from "../lib/events";

const router = new Router();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, "../../logs/events.log") })
  ]
});

router.post("/v1/events", async (ctx) => {
  const allowIps = nconf.get("events:ip");
  let authorized = allowIps.some(cidr => ipaddr.process(ctx.request.ip).match(ipaddr.parseCIDR(cidr)));
  if (ctx.get("x-real-ip")) {
    authorized = authorized
      && allowIps.some(cidr => ipaddr.process(ctx.get("x-real-ip")).match(ipaddr.parseCIDR(cidr)));
  }
  if (!authorized) {
    ctx.throw(403, "Not authorized.");
  }
  const events = ctx.request.body;
  for (let event of events) {
    handleEvent(event);
  }

  logger.info("Received event", { events });
  ctx.status = 201;
  ctx.body = "Received event.";
});

export default router;