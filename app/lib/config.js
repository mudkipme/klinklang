import nconf from "nconf";

export default function initConfig() {
  nconf.argv()
    .env();

  if (nconf.get("config")) {
    nconf.file({
      file: nconf.get("config")
    });
  } else {
    nconf.file({
      file: "config.json"
    });
  }

  nconf.defaults({
    "wiki": {
      "api": "https://en.wikipedia.org/w/api.php",
      "username": "",
      "password": ""
    },
    "wikihooks": {
      "secret": "my_little_secret",
      "triggers": []
    }
  });
}