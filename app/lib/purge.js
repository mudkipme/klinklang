import rp from "request-promise-native";
import nconf from "./config";
import logger from "./logger";
import Queue from "bull";
import { uniqWith, isEqual } from "lodash";

const purgeQueue = new Queue("purge", {
  redis: nconf.get("redis"),
  prefix: "klinklang_purge",
  limiter: nconf.get("purgeLimit:limiter")
});

async function handlePurge({ host, url }) {
  try {
    const purgeConfig = nconf.get("purge");
    let requestOptions = [];

    const queries = url.split("&");
    const lastQuery = queries.length > 0 ? queries[queries.length - 1] : "";
    const pathComponents = url.split("/");
    const firstPath = pathComponents.length > 1 ? pathComponents[1] : "";

    for (let config of purgeConfig) {
      if (config.host !== host) {
        continue;
      }
      const uriList = Array.isArray(config.uri) ? config.uri : [config.uri];
      const variants = config.variants || [];
      variants.unshift("");

      for (let uri of uriList) {
        for (let variant of variants) {
          if (variant && (variants.indexOf(lastQuery) > 0 || variants.indexOf(firstPath) > 0)) {
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
              uri: uri.split("#url#").join(url).split("#variants#").join("").split("/wiki/").join(`/${variant}/`),
              timeout: 1000,
              headers: config.headers
            });
          }
        }
      }
    }

    requestOptions = uniqWith(requestOptions, isEqual);

    await Promise.all(requestOptions.map(options => processRequest(options)));
    logger.info("Purge finished.", { host, url });
  } catch (e) {
    logger.error(e.message);
    throw e;
  }
}

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

purgeQueue.process(async (job) => {
  const { host, url, scheduledTime } = job.data;
  const expires = nconf.get("purgeLimit:expires");
  if (expires && Date.now() - scheduledTime >= expires) {
    logger.info("Skip purge.", job.data);
    return;
  }
  await handlePurge({ host, url });
});

export function addPurge({ host, url }) {
  const jobId = host + url;
  logger.info("Prepare purge.", { host, url });
  purgeQueue.add({ host, url, scheduledTime: Date.now() }, {
    jobId,
    timeout: 20000,
    removeOnComplete: true,
    removeOnFail: true
  });
}