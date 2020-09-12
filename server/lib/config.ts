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
    },
    port: {
      doc: 'Server port',
      format: 'int',
      default: 3000
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
  },
  kafka: {
    'metadata.broker.list': {
      doc: 'Kafka broker list',
      format: String,
      default: 'kafka:9092'
    },
    'group.id': {
      doc: 'Kafka consumer group id',
      format: String,
      default: 'klinklang'
    }
  }
})

config.loadFile('./config.json')

export default config