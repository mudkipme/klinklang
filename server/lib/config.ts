import convict from 'convict'

const config = convict({
  mediawiki: {
    apiRoot: {
      doc: 'api.php of your MediaWiki installation',
      format: String,
      default: 'https://en.wikipedia.org/w/api.php'
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
  }
})

config.loadFile('./config.json')

export default config
