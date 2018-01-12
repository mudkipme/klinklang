import { promisify } from "util";
import sass from "node-sass";

const scssTask = {
  taskName: "scss",
  requireLogin: true,
  async process({wiki, event, options}) {
    let content = wiki.getContent(event.data.title);
    const match = content.match(/<pre>(.*)<\/pre>/);
    if (match) {
      content = match[1];
    }

    let result = await promisify(sass.render.bind(sass))({
      data: content,
      outputStyle: "compact"
    });
    result = `/* Automatically generated from ${event.data.title}. Please don't modify this page. If you want to make change to this CSS page, please edit ${event.data.title} instead */
${result}`;

    await wiki.edit(options.target, result, {
      summary: `Automatically generated from ${event.data.title}`
    });
  }
};

export default scssTask;