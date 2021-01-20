const httpProxy = require('http-proxy')
const proxy = httpProxy.createServer({ target: 'http://localhost:3001' })

module.exports = {
  mount: {
    public: '/',
    src: '/_dist_'
  },
  plugins: [
    ['@snowpack/plugin-optimize', {}]
  ],
  routes: [
    {
      src: '/(api|oauth)/.*',
      dest: (req, res) => proxy.web(req, res)
    },
    {
      match: 'routes',
      src: '.*',
      dest: '/index.html'
    }
  ]
}
