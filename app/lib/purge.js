import rp from "request-promise-native";
import nconf from "./config";
import logger from "./logger";
import queue from "./queue";

queue.process("purge", async (job, done) => {
  try {
    const purgeConfig = nconf.get("purge");
    const { host, url } = job.data;
    const requestOptions = [];

    for (let config of purgeConfig) {
      if (config.host !== host) {
        continue;
      }
      const uriList = Array.isArray(config.uri) ? config.uri : [config.uri];
      const variants = config.variants || [];
      variants.unshift("");

      for (let uri of uriList) {
        for (let variant of variants) {
          requestOptions.push({
            method: config.method || "PURGE",
            uri: uri.split("#url#").join(url).split("#variants#").join(variant)
          });
          if (url.indexOf("/wiki/") !== -1 && variant) {
            requestOptions.push({
              method: config.method || "PURGE",
              uri: uri.split("#url#").join(url).split("#variants#").join("").split("/wiki/").join(`/${variant}/`)
            });
          }
        }
      }
    }
    
    await Promise.all(requestOptions.map(options => processRequest(options)));
    done();
  } catch (e) {
    logger.error(e.message);
    done(e);
  }
});

async function processRequest(options) {
  try {
    await rp(options);
    logger.info("Purge success.", options);
  } catch (e) {
    if (e.statusCode !== 404) {
      logger.error("Error sending purge request.", options);
      throw e;
    }
  }
}

export default function purger({ host, url, href }) {
  logger.info(`Prepare purge ${href}.`);
  queue
    .create("purge", { host, url })
    .ttl(20000)
    .removeOnComplete(true)
    .save();
}