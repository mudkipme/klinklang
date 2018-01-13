import tasks from "../tasks";
import { getUser } from "./user";

export function makeTask(taskInfo) {
  const Task = tasks[taskInfo.task];
  if (!Task) {
    throw new Error("Invalid task name");
  }
  const user = getUser(taskInfo.username);
  if (!user) {
    throw new Error("Invalid user");
  }
  return new Task(user, taskInfo.options);
}

export function taskInfo(task, username, options) {
  const Task = tasks[task];
  if (!Task) {
    throw new Error("Invalid task name");
  }
  return {
    task,
    username,
    priority: Task.priority,
    ttl: Task.ttl,
    options
  };
}

export function taskInfoFromTrigger(trigger, data) {
  const Task = tasks[trigger.task];
  if (!Task) {
    throw new Error("Invalid task name");
  }
  const options = Task.optionsFromTrigger(trigger, data);
  return taskInfo(trigger.task, trigger.username, options);
}