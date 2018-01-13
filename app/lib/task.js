import tasks from "../tasks";
import { getUser } from "./user";
import logger from "./logger";
import queue from "./queue";

queue.process("task", async (job, done) => {
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
    logger.info(`Processed task ${job.data.task}.`, result);
    done();
  } catch (e) {
    logger.error(e.message);
    done(e);
  }
});

export function addTask(task, username, options) {
  const Task = tasks[task];
  if (!Task) {
    throw new Error("Invalid task name");
  }
  logger.info(`Added task ${task}.`);
  queue
    .create("task", {
      task,
      username,
      options
    })
    .priority(Task.priority)
    .ttl(Task.ttl)
    .save();
}

export function addTaskFromTrigger(trigger, data) {
  const Task = tasks[trigger.task];
  if (!Task) {
    throw new Error("Invalid task name");
  }
  const options = Task.optionsFromTrigger(trigger, data);
  addTask(trigger.task, trigger.username, options);
}