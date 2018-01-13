import kue from "kue";
import nconf from "./config";
import { makeTask } from "./task";
import logger from "./logger";

const queue = kue.createQueue({
  redis: nconf.get("redis")
});

queue.process("task", async (job, done) => {
  try {
    const task = makeTask(job.data);
    const result = await task.run(job);
    logger.info(`Processed task ${job.data.task}.`, result);
    done();
  } catch (e) {
    logger.error(e.message);
    done(e);
  }
});

process.once("SIGTERM", () => {
  queue.shutdown(5000, function (err) {
    logger.info("Queue shutdown: ", err || "");
    process.exit(0);
  });
});

export function addTask(taskInfo) {
  if (!queue) {
    throw new Error("Queue uninitialized.");
  }
  logger.info(`Added task ${taskInfo.task}.`);
  queue.create("task", taskInfo)
    .priority(taskInfo.priority)
    .ttl(taskInfo.ttl)
    .save();
}