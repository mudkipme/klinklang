import { test as jsonTest } from "json-predicate";
import { KafkaConsumer } from "node-rdkafka";
import { promisify } from "util";
import nconf from "./config";
import { addTaskFromTrigger } from "./task";
import logger from "./logger";

const triggers = [];

const config = nconf.get("events:triggers") || [];
for (let item of config) {
  triggers.push({
    username: nconf.get("wiki:username"),
    ...item
  });
}

export default async function handleEvent(event) {
  const topic = event.meta && event.meta.topic;
  for (let trigger of triggers) {
    if (topic === trigger.topic && jsonTest(event, trigger.predicate)) {
      await addTaskFromTrigger(trigger, event);
    }
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export function start() {
  const consumer = new KafkaConsumer(nconf.get("kafka:config"));
  consumer.connect();
  consumer.on("ready", async () => {
    consumer.subscribe([nconf.get("kafka:topic")]);
    let msgs;
    do {
      try {
        msgs = await promisify(consumer.consume.bind(consumer))(1);
        if (msgs.length === 0) {
          continue;
        }
        const event = JSON.parse(msgs[0].value.toString());
        await handleEvent(event);
      } catch (e) {
        logger.error(e.message);
        await delay(1000);
      }
    } while (msgs);
  });
}
