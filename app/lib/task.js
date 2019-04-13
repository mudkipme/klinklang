import tasks from "../tasks";
import { getUser } from "./user";
import logger from "./logger";

async function addTask(task, username, options) {
  const Task = tasks[task];
  logger.info("Started task.", { task });
  const user = getUser(username);
  if (!user) {
    throw new Error("Invalid user");
  }
  const taskRunner = new Task(user, options);
  const result = await taskRunner.run({ task, username, options });
  logger.info("Processed task", { task, result });
}

export async function addTaskFromTrigger(trigger, data) {
  const Task = tasks[trigger.task];
  if (!Task) {
    throw new Error("Invalid task name");
  }
  const options = Task.optionsFromTrigger(trigger, data);
  addTask(trigger.task, trigger.username, options);
}
