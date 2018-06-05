const path = require('path')
const qs = require('querystring')
const url = require('url')
const fs = require('fs')
const mimeTypes = require('mime-types')
const request = require('request')
const {app} = require('electron')
const Proxy = require('./lib/proxy')
const { dialog } = require('electron')
const downloadCA = 'http://getca.mask/' // url to download CA
let proxy = Proxy()
let timer
/* proxy server */
const proxyServer = {
  start () {
    proxy.use(Proxy.gunzip)
    proxy.use(Proxy.wildcard)
    const selectedRule = global.state.ProxyRule.ruleLists.filter(r => r.isSelected)
    const proxyPort = global.state.ProxySetting.proxySetting.port
    proxy.onError(function (ctx, err, errorKind) {
      // ctx may be null
      global.commit('SERVER_ERROR')
      if (err.code === 'EADDRINUSE') {
        dialog.showErrorBox(global.lang.proxyLib.portErrorTitle, `${proxyPort} ${global.lang.proxyLib.portErrorReason}`)
      }
    })
    proxy.onRequest(function (ctx, callback) {
      ctx.proxyToServerRequestOptions.rejectUnauthorized = false
      let requestInfo = {}
      requestInfo.protocol = ctx.clientToProxyRequest.connection.encrypted === true ? 'https:' : 'http:'
      requestInfo.host = ctx.clientToProxyRequest.headers.host
      requestInfo.urlPath = ctx.clientToProxyRequest.url
      requestInfo.fullUrl = `${requestInfo.protocol}//${requestInfo.host}${requestInfo.urlPath}`
      if (requestInfo.fullUrl === downloadCA) {
        ctx.proxyToClientResponse.setHeader('Content-Type', 'application/x-x509-ca-cert')
        ctx.proxyToClientResponse.setHeader('Content-Disposition', 'attachment; filename="maskCA.crt"')
        ctx.proxyToClientResponse.end(fs.readFileSync(path.join(app.getPath('userData'), './.mask-ca/certs/ca.pem'), { encoding: null }))
      }
      requestInfo.requestHeader = ctx.clientToProxyRequest.headers
      requestInfo.method = ctx.clientToProxyRequest.method
      requestInfo.currentdate = new Date()
      requestInfo.start = requestInfo.currentdate.getHours() + ':' + requestInfo.currentdate.getMinutes() + ':' + requestInfo.currentdate.getSeconds()
      let requestBody = []
      ctx.onRequestData((ctx, chunk, callback) => {
        requestBody.push(chunk)
        return callback()
      })
      ctx.onRequestEnd((ctx, callback) => {
        if (requestInfo.method === 'POST') {
          requestInfo.queryParams = Buffer.concat(requestBody).toString()
        } else {
          requestInfo.queryParams = getQueryParams(requestInfo.fullUrl)
        }
        requestBody = null
        const mactchResult = mactchUrl(requestInfo.fullUrl, selectedRule)
        if (mactchResult !== false) {
          replaceMatch(mactchResult, ctx, requestInfo)
        } else {
          return callback()
        }
      })
      let body = []
      ctx.onResponseData((ctx, chunk, callback) => {
        body.push(chunk)
        return callback(null, null)
      })
      ctx.onResponseEnd((ctx, callback) => {
        requestInfo.statusCode = ctx.serverToProxyResponse.statusCode
        requestInfo.mime = mimeTypes.lookup(requestInfo.fullUrl) || (ctx.serverToProxyResponse.headers['content-type'] === undefined ? '' : ctx.serverToProxyResponse.headers['content-type'].split(';')[0])
        requestInfo.responseHeader = ctx.serverToProxyResponse.headers
        if (requestInfo.mime.indexOf('image') !== -1) {
          requestInfo.responseBody = 'data:' + requestInfo.responseHeader['content-type'] + ';base64,' + Buffer.concat(body).toString('base64')
        } else if (requestInfo.mime.indexOf('text') !== -1 || requestInfo.mime === 'application/javascript') {
          requestInfo.responseBody = body.toString()
        } else if (requestInfo.mime === 'application/json') {
          try {
            requestInfo.responseBody = JSON.parse(Buffer.concat(body).toString())
          } catch (error) {
            requestInfo.responseBody = ''
          }
        } else {
          requestInfo.responseBody = ''
        }
        requestInfo.isMatched = false
        ctx.proxyToClientResponse.write(Buffer.concat(body))
        global.dispatch('addRecords', requestInfo)
        requestInfo = null
        return callback()
      })
      callback()
    })

    proxy.listen({
      port: proxyPort,
      silent: true,
      forceSNI: true,
      forceChunkedRequest: true,
      sslCaDir: path.join(app.getPath('userData'), './.mask-ca')
    }, () => {
      global.commit('START_SERVER')
      console.log('server started')
    })
  },
  close () {
    if (proxy !== null && global.state.ProxySetting.isProxyServerStart) {
      proxy.close()
      proxy = null
      global.commit('STOP_SERVER')
    }
  },
  restart () {
    this.close()
    clearTimeout(timer)
    timer = setTimeout(() => {
      proxy = Proxy()
      this.start()
    }, 1500)
  }
}
/* proxy server */

/* getQueryParams */
function getQueryParams (fullUrl) {
  const { query } = url.parse(fullUrl)
  if (query === null) {
    return null
  }
  const queryArray = query.split('&')
  const tmp = {}
  queryArray.forEach(v => {
    const tempArray = v.split('=')
    tmp[tempArray[0]] = tempArray[1] || ''
  })
  return tmp
}
/* getQueryParams */
/* find match */
function mactchUrl (fullUrl, selectedRule) {
  const len = selectedRule.length
  if (len === 0) {
    return false
  }
  for (let i = 0; i < len; i++) {
    if (selectedRule[i].match.substr(-1) === '*') { // fullUrl fuzzy match
      const fuzzy = selectedRule[i].match.slice(0, -1)
      if (fullUrl.indexOf(fuzzy) !== -1) {
        if (selectedRule[i].replace.substr(-1) === '*') { // replace fullUrl is as well
          return selectedRule[i].replace.slice(0, -1) + fullUrl.slice(fuzzy.length)
        } else {
          return selectedRule[i].replace
        }
      }
    } else { // absolute match
      if (fullUrl === selectedRule[i].match) {
        return selectedRule[i].replace
      }
    }
  }
  return false
}

/* replace match */
function replaceMatch (mactchResult, ctx, requestInfo) {
  const urlObj = url.parse(mactchResult)
  ctx.proxyToClientResponse.setHeader('Access-Control-Allow-Origin', ctx.clientToProxyRequest.headers['origin'] || '*')
  ctx.proxyToClientResponse.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
  ctx.proxyToClientResponse.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  ctx.proxyToClientResponse.setHeader('Access-Control-Allow-Credentials', 'true')
  requestInfo.isMatched = true
  if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') { // is a localfile replacement
    requestInfo.mime = mimeTypes.lookup(mactchResult)
    requestInfo.statusCode = 200
    requestInfo.responseHeader = ''
    try {
      requestInfo.responseBody = fs.readFileSync(mactchResult, 'utf8')
      fs.createReadStream(mactchResult).pipe(ctx.proxyToClientResponse)
    } catch (e) {
      requestInfo.statusCode = 404
      requestInfo.responseBody = 'file not exist'
      ctx.proxyToClientResponse.writeHead(404)
      global.dispatch('addRecords', requestInfo)
      requestInfo = null
      ctx.proxyToClientResponse.end('file not exist')
    }
    global.dispatch('addRecords', requestInfo)
    requestInfo = null
  } else { // http or https request
    const newReq = request({method: requestInfo.method, uri: mactchResult}, (err, response, body) => {
      if (err) {
        requestInfo.statusCode = 500
        requestInfo.responseBody = 'server error'
        ctx.proxyToClientResponse.writeHead(500)
        global.dispatch('addRecords', requestInfo)
        requestInfo = null
        ctx.proxyToClientResponse.end('server error')
      } else {
        requestInfo.responseHeader = response.headers
        requestInfo.statusCode = response.statusCode
        requestInfo.mime = mimeTypes.lookup(mactchResult) || (response.headers['content-type'] === undefined ? '' : response.headers['content-type'].split(';')[0])
        if (requestInfo.mime.indexOf('image') !== -1) {
          requestInfo.responseBody = 'data:' + response.headers['content-type'] + ';base64,' + Buffer.from(body).toString('base64')
        } else if (requestInfo.mime.indexOf('text') !== -1 || requestInfo.mime === 'application/json' || requestInfo.mime === 'application/javascript') {
          requestInfo.responseBody = body.toString('utf8')
        }
        global.dispatch('addRecords', requestInfo)
        requestInfo = null
      }
    })
    ctx.clientToProxyRequest.pipe(newReq).on('response', (res) => {
      res.headers['Access-Control-Allow-Origin'] = ctx.clientToProxyRequest.headers['origin'] || '*'
    }).pipe(ctx.proxyToClientResponse)
  }
}
module.exports = proxyServer
