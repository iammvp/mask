const mimeTypes = require('mime-types')
const Proxy = require('./lib/proxy')
const proxy = Proxy()
console.log(global.commit)
/* proxy server */
const proxyServer = {
  start () {
    proxy.onRequest(function (ctx, callback) {
      // console.log(ctx.clientToProxyRequest.url)
      const protocol = ctx.clientToProxyRequest.connection.encrypted === true ? 'https:' : 'http:'
      const url = `${protocol}//${ctx.clientToProxyRequest.headers.host}${ctx.clientToProxyRequest.url}`
      const requestHeader = ctx.clientToProxyRequest.headers
      const method = ctx.clientToProxyRequest.method
      const currentdate = new Date()
      const start = currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds()
      let chunks = []
      ctx.onResponseData(function (ctx, chunk, callback) {
        chunks.push(chunk)
        return callback(null, null) // don't write chunks to client response
      })
      ctx.onResponseEnd((ctx, callback) => {
        const responseBody = Buffer.concat(chunks).toString()
        console.log(responseBody)
        const statusCode = ctx.serverToProxyResponse.statusCode
        // const mime = ctx.serverToProxyResponse.headers['content-type'] === undefined ? mimeTypes(url) : ctx.serverToProxyResponse.headers['content-type'].split(';')[0]
        const mime = mimeTypes.lookup(url) || (ctx.serverToProxyResponse.headers['content-type'] === undefined ? '' : ctx.serverToProxyResponse.headers['content-type'].split(';')[0])
        const responseHeader = ctx.serverToProxyResponse.headers
        const record = {
          url,
          start,
          method,
          statusCode,
          mime,
          requestHeader,
          responseHeader,
          responseBody
        }
        global.commit('ADD_RECORDS', record)
        ctx.proxyToClientResponse.write(responseBody)
        return callback()
      })

      callback()
    })

    proxy.listen({port: 8888, silent: true}, _ => {
      console.log('server started')
    })
  }
}
/* proxy server */

module.exports = proxyServer
