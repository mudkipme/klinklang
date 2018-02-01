import tasks from "../tasks";
import { getUser } from "./user";
import logger from "./logger";
import Queue from "bull";
import nconf from "./config";

const queue = new Queue("task", {
  redis: nconf.get("redis"),
  prefix: "klinklang_task"
});

queue.process(async (job) => {
  try {
    const Task = tasks[job.data.task];
    if (!Task) {
      throw new Error("Invalid task name");
    }
    const user = getUser(job.data.username);
    if (!user) {
      throw new Error("Invalid user");
    }
    const task = new Task(user, job.data.options);
    const result = await task.run(job);
    logger.info("Processed task", { task: job.data.task, result });
  } catch (e) {
    logger.error(e.message);
    throw e;
  }
});

export function addTask(task, username, options) {
  const Task = tasks[task];
  if (!Task) {
    throw new Error("Invalid task name");
  }
  logger.info("Added task.", { task });
  queue.add({
    task,
    username,
    options
  }, {
    priority: Task.priority,
    timeout: Task.ttl
  });
}

export function addTaskFromTrigger(trigger, data) {
  const Task = tasks[trigger.task];
  if (!Task) {
    throw new Error("Invalid task name");
  }
  const options = Task.optionsFromTrigger(trigger, data);
  addTask(trigger.task, trigger.username, options);
}