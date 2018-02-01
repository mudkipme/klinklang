import { URL } from "url";
import { test as jsonTest } from "json-predicate";
import nconf from "./config";
import { addPurge } from "../lib/purge";
import { addTaskFromTrigger } from "./task";

const triggers = [];

const config = nconf.get("events:triggers") || [];
for (let item of config) {
  triggers.push({
    username: nconf.get("wiki:username"),
    ...item
  });
}

function handlePurge(event) {
  const url = new URL(event.meta.uri);
  addPurge({ host: url.hostname, url: url.pathname + url.search });
}

export function runHook(topic, data) {
  for (let trigger of triggers) {
    if (topic === trigger.topic && jsonTest(data, trigger.predicate)) {
      addTaskFromTrigger(trigger, data);
    }
  }
}

export default function handleEvent(event) {
  const topic = event.meta && event.meta.topic;
  switch (topic) {
    case "cdn-url-purges":
      handlePurge(event);
      break;
    default:
      runHook(topic, event);
      break;
  }
}