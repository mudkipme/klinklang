import nconf from "nconf";

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
  },
  "redis": {
    "host": "localhost"
  },
  "purge": [],
  "purgeLimit": {
    "expires": 86400000,
    "limiter": {
      "max": 5,
      "duration": 10000
    }
  },
  "events": {
    "ip": ["172.18.0.0/16", "127.0.0.0/8"]
  }
});

export default nconf;