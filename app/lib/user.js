import request from "request";
import nconf from "nconf";
import MWClient from "./mwclient";

const userMap = new Map();

export default class User {
  constructor(options) {
    this.username = options.username;
    this._password = options.password;
    this.wiki = new MWClient({
      api: options.api || nconf.get("wiki:api"),
      jar: options.jar || request.jar()
    });
  }

  async login() {
    return await this.wiki.login(this.username, this._password);
  }
}

export function getUser(username) {
  return userMap.get(username);
}

userMap.set(nconf.get("wiki:username"), new User({
  username: nconf.get("wiki:username"),
  password: nconf.get("wiki:password")
}));