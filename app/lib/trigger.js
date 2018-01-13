import { test as jsonTest } from "json-predicate";
import nconf from "./config";
import { taskInfoFromTrigger } from "./task";
import { addTask } from "./queue";

const triggers = [];

const config = nconf.get("wikihooks:triggers") || [];
for (let item of config) {
  triggers.push({
    username: nconf.get("wiki:username"),
    ...item
  });
}

export function runHook(action, data) {
  for (let trigger of triggers) {
    if (action === trigger.action && jsonTest(data, trigger.predicate)) {
      addTask(taskInfoFromTrigger(trigger, data));
    }
  }
}