import rp from "request-promise-native";
import nconf from "./config";
import logger from "./logger";
import queue from "./queue";
import { uniqWith, isEqual } from "lodash";

queue.process("purge", async (job, done) => {
  try {
    const purgeConfig = nconf.get("purge");
    const { host, url } = job.data;
    let requestOptions = [];

    const queries = url.split('&');
    const lastQuery = queries.length > 0 ? queries[queries.length - 1] : '';
    const pathComponents = url.split('/');
    const firstPath = pathComponents.length > 1 ? pathComponents[1] : '';

    for (let config of purgeConfig) {
      if (config.host !== host) {
        continue;
      }
      const uriList = Array.isArray(config.uri) ? config.uri : [config.uri];
      const variants = config.variants || [];
      variants.unshift("");

      for (let uri of uriList) {
        for (let variant of variants) {
          if (variant && (variants.indexOf(lastQuery) > -1 || variants.indexOf(firstPath) > -1)) {
            continue;
          }
          requestOptions.push({
            method: config.method || "PURGE",
            uri: uri.split("#url#").join(url).split("#variants#").join(variant),
            timeout: 1000,
            headers: config.headers
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

    requestOptions = uniqWith(requestOptions, isEqual);
    
    await Promise.all(requestOptions.map(options => processRequest(options)));
    logger.info(`Purge finished ${url}.`);
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
