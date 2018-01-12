import program from "commander";
import cookieStore from "tough-cookie-file-store";
import request from "request";
import fs from "mz/fs";
import path from "path";
import nconf from "nconf";
import MWClient from "./app/lib/mwclient";
import initConfig from "./app/lib/config";

// actions for temporary tasks
import action20161118Replace from "./app/actions/20161118-replace";
import action20170628Antispam from "./app/actions/20170628-antispam";
import action20171228Sprites from "./app/actions/20171228-sprites";

initConfig();

const version = require("./package.json").version;
const jar = request.jar(new cookieStore("./database/cookie.json"));
const wiki = new MWClient({
  api: nconf.get("wiki:api"),
  userAgent: `MudkipRadar v${version}`,
  jar: jar
});

program
  .command("login [username] [password]")
  .description("Login into the wiki.")
  .action(async (username, password) => {
    try {
      const result = await wiki.login(username || nconf.get("wiki:username"), password || nconf.get("wiki:password"));
      console.log("User " + result.username + " logined.");
    } catch (e) {
      console.log(e);
    }
  });

program
  .command("whoami")
  .description("Get the information of current user.")
  .action(async () => {
    try {
      const result = await wiki.whoami();
      console.log(result);
    } catch (e) {
      console.log(e);
    }
  });

program
  .command("allpages")
  .description("Save the titles of all pages in 52Poké Wiki.")
  .action(async () => {
    try {
      let pages = [], result = null, next = {};
      for (let namespace of [0, 4, 6, 10, 14]) {
        do {
          result = await wiki.allpages({
            ...next,
            aplimit: 5000,
            apfilterredir: "nonredirects",
            apnamespace: namespace });
          pages = pages.concat(result.pages);
          next = result.next;
          console.log(`Fetched ${pages.length} results in namespace ${namespace}.`);
        } while (next && next.apcontinue);
      }

      await fs.writeFile(path.join(__dirname, "./database/allpages.json"), JSON.stringify(pages));
      console.log("Saved all pages.");
    } catch(e) {
      console.log(e);
    }
  });

action20161118Replace(program, wiki);
action20170628Antispam(program, wiki);
action20171228Sprites(program, wiki);

program.version(version);

if (program.parse(process.argv).args.length === 0) {
  program.help();
}