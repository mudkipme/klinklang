import logger from "../lib/logger";

export default class Task {
  constructor(user, options) {
    this.user = user;
    this.options = options;
  }

  async run(job) {
    try {
      return await this.process(job);
    } catch (e) {
      // login and redo the task
      if (["readapidenied", "writeapidenied", "permissiondenied"].indexOf(e.name) !== -1) {
        const whoami = await this.user.wiki.whoami();
        if (whoami.id === 0) {
          logger.warn(`${this.user.username} is not logged in. Try to re-login.`);
          await this.user.login();
          return await this.process(job);
        }
      }
      throw e;
    }
  }
  
  async process() {
    throw new Error("Not implemented.");
  }

  static optionsFromTrigger({ trigger }) {
    return trigger.options;
  }
}
