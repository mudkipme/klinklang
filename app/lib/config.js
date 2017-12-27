import fs from "mz/fs";
import path from "path";

let config = {
  wiki: {
    api: "https://en.wikipedia.org/w/api.php",
    username: "",
    password: ""
  },
  secret: ""
};

const configFile = path.join(__dirname, "../../config.json");
if (fs.existsSync(configFile)) {
  config = JSON.parse(fs.readFileSync(configFile));
}

export default config;