import rp from "request-promise-native";
import mapValues from "lodash/mapValues";
import pickBy from "lodash/pickBy";

export default class MWClient {
  constructor(options = {}) {
    this.api = options.api;
    this.userAgent = options.userAgent || "Node.js MediaWiki Client";
    this.jar = options.jar;
  }

  async request(parameters) {
    const response = await rp.post({
      url: this.api,
      jar: this.jar,
      headers: {
        "User-Agent": this.userAgent
      },
      form: {
        ...parameters,
        format: "json"
      },
      json: true,
      gzip: true
    });

    if (response.error) {
      const error = new Error(response.error.info);
      error.name = response.error.code;
      throw error;
    }

    return {
      data: response && response[parameters.action],
      next: response && response.continue
    };
  }

  async getToken(type = "csrf") {
    const response = await this.request({
      action: "query",
      meta: "tokens",
      type: type
    });
    const token = response.data.tokens[`${type}token`];
    if (!token) {
      throw new Error("Failed to get token.");
    }
    return token;
  }

  async login(username, password) {
    const response = await this.request({
      action: "clientlogin",
      username: username,
      password: password,
      logintoken: await this.getToken("login"),
      loginreturnurl: "http://example.com"
    });

    if (!response.data.username) {
      throw new Error(`Logging in failed: ${response.data.status} ${response.data.message || ""}`);
    }
    
    return response.data;
  }

  async whoami() {
    const response = await this.request({
      action: "query",
      meta: "userinfo",
      uiprop: [
        "groups",
        "rights",
        "ratelimits",
        "editcount" ,
        "realname",
        "email",
      ].join("|")
    });

    if (!response.data.userinfo) {
      throw new Error("Get userinfo failed.");
    }

    return response.data.userinfo;
  }

  async allpages(options = {}) {
    const response = await this.request({
      ...options,
      action: "query",
      list: "allpages"
    });

    return { pages: response.data.allpages, next: response.next };
  }

  async move(from, to, options = {}) {
    const response = await this.request({
      ...options,
      action: "move",
      from: from,
      to: to,
      movetalk: true,
      token: await this.getToken()
    });

    return response.data;
  }

  async getContent(title, options) {
    const response = await this.request({
      ...options,
      action: "query",
      prop: "revisions",
      rvprop: "content",
      titles: title
    });

    if (Object.keys(response.data.pages).length === 0) {
      throw new Error("Page not found.");
    }

    const page = response.data.pages[Object.keys(response.data.pages)[0]];
    const revision = page.revisions && page.revisions.shift();
    const content = revision && revision["*"];

    return content || "";
  }

  async edit(title, content, options) {
    const response = await this.request({
      ...options,
      action: "edit",
      bot: true,
      text: content,
      title: title,
      token: await this.getToken()
    });

    return response.data;
  }

  async remove(title, options) {
    const response = await this.request({
      ...options,
      action: "delete",
      bot: true,
      title: title,
      token: await this.getToken()
    });

    return response.data;
  }

  async revisiondelete(ids, options) {
    const response = await this.request({
      ...options,
      action: "revisiondelete",
      type: "revision",
      bot: true,
      ids: ids,
      hide: "content|comment|user",
      token: await this.getToken()
    });

    return response.data;
  }

  async imageinfo(filename, options) {
    if (!Array.isArray(filename)) {
      filename = [filename];
    }
    const iiprop = (options && options.iiprop) || ["url", "timestamp", "user", "metadata", "size"];
    const response = await this.request({
      ...options,
      action: "query",
      titles: filename.map(file => `File:${file}`).join("|"),
      prop: "imageinfo",
      iiprop: iiprop.join("|")
    });

    let result = mapValues(response.data.pages, page => {
      if (!page.imageinfo || !page.imageinfo.length) {
        return null;
      }
      const imageinfo = page.imageinfo[0];
      const metadata = {};
      let currentMetadata = imageinfo.metadata;
      while (currentMetadata) {
        currentMetadata.forEach(item => {
          metadata[item.name] = item.value;
        });
        currentMetadata = metadata.metadata;
        if (currentMetadata) {
          delete metadata.metadata;
        }
      }
      imageinfo.metadata = metadata;
      return {
        pageid: page.pageid,
        title: page.title,
        ...imageinfo
      };
    });
    result = pickBy(result);
    return result;
  }

  async categorymembers(category, options) {
    const response = await this.request({
      ...options,
      action: "query",
      list: "categorymembers",
      cmtitle: `Category:${category}`
    });

    return {
      categorymembers: response.data.categorymembers,
      next: response.next
    };
  }
}