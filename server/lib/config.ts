import convict from 'convict'

const config = convict({
  app: {
    secret: {
      doc: 'Secret of Klinklang app',
      format: String,
      default: ''
    },
    prefix: {
      doc: 'Prefix for sessions',
      format: String,
      default: 'klinklang'
    }
  },
  mediawiki: {
    scriptPath: {
      doc: 'Script path of your MediaWiki installation',
      format: String,
      default: 'https://en.wikipedia.org/w/'
    },
    oauthKey: {
      doc: 'OAuth consumer key',
      format: String,
      default: ''
    },
    oauthSecret: {
      doc: 'OAuth consumer secret',
      format: String,
      default: ''
    },
    oauthCallback: {
      doc: 'OAuth callback url',
      format: String,
      default: 'oob'
    }
  },
  db: {
    host: {
      doc: 'Database hostname or IP address',
      format: String,
      default: 'postgresql'
    },
    database: {
      doc: 'Database name',
      format: String,
      default: 'klinklang'
    },
    username: {
      doc: 'Database user name',
      format: String,
      default: ''
    },
    password: {
      doc: 'Database password',
      format: String,
      default: ''
    }
  },
  redis: {
    host: {
      doc: 'Redis host',
      format: String,
      default: 'redis'
    },
    port: {
      doc: 'Redis port',
      format: 'int',
      default: 6379
    }
  }
})

config.loadFile('./config.json')

export default config
