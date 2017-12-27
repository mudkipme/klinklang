import fs from "mz/fs";
import path from "path";

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "../../config.json")));
export default config;