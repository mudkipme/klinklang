import kue from "kue";
import nconf from "./config";
import logger from "./logger";

const queue = kue.createQueue({
  redis: nconf.get("redis")
});

process.once("SIGTERM", () => {
  queue.shutdown(5000, function (err) {
    logger.info("Queue shutdown: ", err || "");
    process.exit(0);
  });
});

export default queue;