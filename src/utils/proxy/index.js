const fs = require('fs')
const url = require('url')
const mimeTypes = require('mime-types')
const request = require('request')
const Proxy = require('./lib/proxy')
let proxy = Proxy()
/* proxy server */
const proxyServer = {
  start () {
    const selectedRule = global.state.ProxyRule.ruleLists.filter(r => r.isSelected)
    const proxyPort = global.state.ProxySetting.proxySetting.port
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
      const requestInfo = {
        protocol,
        host,
        urlPath,
        url,
        start,
        method,
        requestHeader
      }
      const mactchResult = mactchUrl(url, selectedRule)
      if (mactchResult !== false) {
        replaceMatch(mactchResult, ctx, requestInfo)
      } else {
        let body = []
        ctx.onResponseData((ctx,chunk,callback)=>{
          body.push(chunk)
          return callback(null, null)
        })
        ctx.onResponseEnd((ctx, callback) => {
          let responseBody = ''
          const statusCode = ctx.serverToProxyResponse.statusCode
          const mime = mimeTypes.lookup(url) || (ctx.serverToProxyResponse.headers['content-type'] === undefined ? '' : ctx.serverToProxyResponse.headers['content-type'].split(';')[0])
          const responseHeader = ctx.serverToProxyResponse.headers
          if (mime.indexOf('image') !== -1) {
            responseBody = 'data:' + responseHeader['content-type'] + ';base64,' + Buffer.concat(body).toString('base64')
          } else if (mime.indexOf('text') !== -1 || mime === 'application/json' || mime === 'application/javascript') {
            responseBody = body.toString()
          }
          const record = {
              protocol,
              host,
              urlPath,
              url,
              start,
              method,
              statusCode,
              mime,
              isMatched: false,
              requestHeader,
              responseHeader,
              responseBody
            }
            ctx.proxyToClientResponse.write(Buffer.concat(body))
            global.commit('ADD_RECORDS', record)
            return callback()
          // request({method, uri: url}, (err, response, body) => {
          //   let responseBody = ''
          //   if (err) throw err
          //   const statusCode = ctx.serverToProxyResponse.statusCode
          //   const mime = mimeTypes.lookup(url) || (ctx.serverToProxyResponse.headers['content-type'] === undefined ? '' : ctx.serverToProxyResponse.headers['content-type'].split(';')[0])
          //   if (mime.indexOf('image') !== -1) {
          //     responseBody = 'data:' + response.headers['content-type'] + ';base64,' + Buffer.from(body).toString('base64')
          //   } else if (mime.indexOf('text') !== -1 || mime === 'application/json' || mime === 'application/javascript') {
          //     responseBody = body.toString('utf8')
          //   }
          //   const responseHeader = ctx.serverToProxyResponse.headers
          //   const record = {
          //     protocol,
          //     host,
          //     urlPath,
          //     url,
          //     start,
          //     method,
          //     statusCode,
          //     mime,
          //     isMatched: false,
          //     requestHeader,
          //     responseHeader,
          //     responseBody
          //   }
          //   global.commit('ADD_RECORDS', record)
          //   return callback()
          // })
        })
        callback()
      }
    })

    proxy.listen({port: proxyPort, silent: true}, () => {
      global.commit('START_SERVER')
      console.log('server started')
    })
  },
  close () {
    proxy.close()
    proxy = null
    global.commit('STOP_SERVER')
  },
  restart () {
    this.close()
    setTimeout(() => {
      proxy = Proxy()
      this.start()
    }, 1000)
  }
}
/* proxy server */

/* find match */
function mactchUrl (url, selectedRule) {
  const len = selectedRule.length
  if (len === 0) {
    return false
  }
  for (let i = 0; i < len; i++) {
    if (selectedRule[i].match.substr(-1) === '*') { // url fuzzy match
      const fuzzy = selectedRule[i].match.slice(0, -1)
      if (url.indexOf(fuzzy) !== -1) {
        if (selectedRule[i].replace.substr(-1) === '*') { // replace url is as well
          return selectedRule[i].replace.slice(0, -1) + url.slice(fuzzy.length)
        } else {
          return selectedRule[i].replace
        }
      }
    } else { // absolute same
      if (url === selectedRule[i].match) {
        return selectedRule[i].replace
      }
    }
  }
  return false
}

/* replace match */
function replaceMatch (mactchResult, ctx, requestInfo) {
  const urlObj = url.parse(mactchResult)

  const copyInfo = Object.assign({}, requestInfo)
  copyInfo.isMatched = true
  if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') { // is a localfile replacement
    copyInfo.mime = mimeTypes.lookup(mactchResult)
    copyInfo.statusCode = 200
    copyInfo.responseHeader = ''
    try {
      copyInfo.responseBody = fs.readFileSync(mactchResult, 'utf8')
    } catch (e) {
      copyInfo.statusCode = 404
      copyInfo.responseBody = e
    }
    global.commit('ADD_RECORDS', copyInfo)
    fs.createReadStream(mactchResult).pipe(ctx.proxyToClientResponse)
  } else { // http or https request
    request({method: copyInfo.method, uri: mactchResult}, (err, response, body) => {
      if (err) throw err
      copyInfo.responseHeader = response.headers
      copyInfo.statusCode = response.statusCode
      copyInfo.mime = mimeTypes.lookup(url) || (response.headers['content-type'] === undefined ? '' : response.headers['content-type'].split(';')[0])
      if (copyInfo.mime.indexOf('image') !== -1) {
        copyInfo.responseBody = 'data:' + response.headers['content-type'] + ';base64,' + Buffer.from(body).toString('base64')
      } else if (copyInfo.mime.indexOf('text') !== -1 || copyInfo.mime === 'application/json' || copyInfo.mime === 'application/javascript') {
        copyInfo.responseBody = body.toString('utf8')
      }
      global.commit('ADD_RECORDS', copyInfo)
    }).pipe(ctx.proxyToClientResponse)
  }
}
module.exports = proxyServer
