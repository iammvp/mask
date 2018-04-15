const mimeTypes = require('mime-types')
const request = require('request').defaults({ encoding: null })
const Proxy = require('./lib/proxy')
const proxy = Proxy()
/* proxy server */
const proxyServer = {
  start () {
    proxy.onRequest(function (ctx, callback) {
      // console.log(ctx.clientToProxyRequest.url)
      const protocol = ctx.clientToProxyRequest.connection.encrypted === true ? 'https:' : 'http:'
      const host = ctx.clientToProxyRequest.headers.host
      const urlPath = ctx.clientToProxyRequest.url
      const url = `${protocol}//${host}${urlPath}`
      const requestHeader = ctx.clientToProxyRequest.headers
      const method = ctx.clientToProxyRequest.method
      const currentdate = new Date()
      const start = currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds()
      ctx.onResponseEnd((ctx, callback) => {
        request({method,uri:url}, (err, response, body)=>{
          let responseBody = ''
          if(err) throw err
          const statusCode = ctx.serverToProxyResponse.statusCode
          const mime = mimeTypes.lookup(url) || (ctx.serverToProxyResponse.headers['content-type'] === undefined ? '' : ctx.serverToProxyResponse.headers['content-type'].split(';')[0])
          if(mime.indexOf('image') !== -1){
            responseBody = "data:" + response.headers["content-type"] + ";base64," +  new Buffer(body).toString('base64')
          }else if(mime.indexOf('text') !== -1 || mime === 'application/json' || mime === 'application/javascript'){
            responseBody = body.toString('utf8')
          }
          const responseHeader = ctx.serverToProxyResponse.headers
          const record = {
            protocol,
            host,
            urlPath,
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
          return callback()
        })
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
