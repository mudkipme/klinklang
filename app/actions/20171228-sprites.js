import path from "path";
import fs from "mz/fs";
import values from "lodash/values";
import request from "request";
import MWClient from "../lib/mwclient";

const downloadDir = path.join(__dirname, "../../database/download");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function (program) {
  program
    .command("download-sprites")
    .description("Download Pokémon Sprites Icons")
    .action(async () => {
      try {        
        const bulbapedia = new MWClient({api: "https://archives.bulbagarden.net/w/api.php"});
        const categories = ["Generation VII menu sprites", "Generation VI menu sprites"];
        const fileSet = new Set();

        for (let category of categories) {
          let response = null;
          let next = null;
          do {
            await delay(100);
            response = await bulbapedia.categorymembers(category, next);
            const files = response.categorymembers
              .map(member => member.title.replace(/^File:/, ""))
              .filter(file => !fileSet.has(file));

            next = response.next;
            if (files.length === 0) {
              continue;
            }

            files.forEach(file => fileSet.add(file));
            const images = await bulbapedia.imageinfo(files);
            const urls = values(images).map(image => image.url.replace(/^https?:\/\/archives/, "https://cdn"));

            await Promise.all(urls.map(url => downloadImage(url)));
            
          } while (response && response.categorymembers.length > 0 && next && Object.keys(next).length > 0);
        }
      } catch (e) {
        console.log(e);
      }
    });
}

async function downloadImage(url) {
  if (!(await fs.exists(downloadDir))) {
    await fs.mkdir(downloadDir);
  }
  const filename = path.join(downloadDir, path.basename(url).replace(/MS\./, "."));
  if (await fs.exists(filename)) {
    return;
  }

  await new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filename);
    stream.on("error", reject);
    stream.on("finish", () => {
      console.log(`Downloaded ${url}`);
      resolve();
    });
    request(url).pipe(stream);
  });
}