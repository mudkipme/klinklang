import { promisify } from "util";
import sass from "node-sass";
import Task from "./base";
import logger from "../lib/logger";

export default class ScssTask extends Task {
  async process() {
    let content = await this.user.wiki.getContent(this.options.source);

    // If there's a `<pre>` block, use the content of `<pre>` as scss source
    const match = content.match(/<pre>([\s\S]*)<\/pre>/);
    if (match) {
      content = match[1];
    }

    const targets = Array.isArray(this.options.target) ? this.options.target : [this.options.target];

    for (let target of targets) {
      const result = await promisify(sass.render.bind(sass))({
        data: `$pageName: "${target.replace(/^\w+:/, "")}";\n` + content,
        outputStyle: "compact"
      });
      let css = result.css.toString("utf8");

      css = `/* Automatically generated from ${this.options.source}. Please don't modify this page. If you want to make change to this CSS page, please edit ${this.options.source} instead */
${css.replace(/\n+/g, "\n")}`;

      await this.user.wiki.edit(target, css, {
        summary: `Automatically generated from ${this.options.source}`
      });

      logger.info(`Processed ${target}`);
    }

    return {
      status: 0,
      message: `Processed SCSS from ${this.options.source}`
    };
  }

  static priority = 9;

  static optionsFromTrigger(trigger, data) {
    return {
      source: data.page_title,
      ...trigger.options
    };
  }
}