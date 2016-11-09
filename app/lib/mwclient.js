import rp from 'request-promise-native';

export default class MWClient {
  constructor(options = {}) {
    this.api = options.api;
    this.userAgent = options.userAgent || 'Node.js MediaWiki Client';
    this.jar = options.jar;
  }

  async request(parameters) {
    const response = await rp.post({
      url: this.api,
      jar: this.jar,
      headers: {
        'User-Agent': this.userAgent
      },
      form: {
        ...parameters,
        format: 'json'
      },
      json: true,
      gzip: true
    });

    if (response.error) {
      throw new Error(response.error.info);
    }

    return {
      data: response && response[parameters.action],
      next: response && response.continue
    };
  }

  async getToken(type = 'csrf') {
    const response = await this.request({
      action: 'query',
      meta: 'tokens',
      type: type
    });
    const token = response.data.tokens[`${type}token`];
    if (!token) {
      throw new Error('Failed to get token.');
    }
    return token;
  }

  async login(username, password) {
    const response = await this.request({
      action: 'clientlogin',
      username: username,
      password: password,
      logintoken: await this.getToken('login'),
      loginreturnurl: 'http://example.com'
    });

    if (!response.data.username) {
      throw new Error(`Logging in failed: ${response.data.result} ${response.data.reason || ''}`);
    }
    
    return response.data;
  }

  async whoami() {
    const response = await this.request({
      action: 'query',
      meta: 'userinfo',
      uiprop: [
        'groups',
        'rights',
        'ratelimits',
        'editcount' ,
        'realname',
        'email',
      ].join('|')
    });

    if (!response.data.userinfo) {
      throw new Error('Get userinfo failed.');
    }

    return response.data.userinfo;
  }

  async allpages(options = {}) {
    const response = await this.request({
      ...options,
      action: 'query',
      list: 'allpages'
    });

    return { pages: response.data.allpages, next: response.next };
  }

  async move(from, to, options = {}) {
    const response = await this.request({
      ...options,
      action: 'move',
      from: from,
      to: to,
      movetalk: true,
      token: await this.getToken()
    });

    return response.data;
  }
}