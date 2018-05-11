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
        dialog.showErrorBox('开启服务器失败', `端口${proxyPort}已被占用`)
      }
    })
    proxy.onRequest(function (ctx, callback) {
      ctx.proxyToServerRequestOptions.rejectUnauthorized = false
      const protocol = ctx.clientToProxyRequest.connection.encrypted === true ? 'https:' : 'http:'
      const host = ctx.clientToProxyRequest.headers.host
      const urlPath = ctx.clientToProxyRequest.url
      const fullUrl = `${protocol}//${host}${urlPath}`
      if (fullUrl === downloadCA) {
        ctx.proxyToClientResponse.setHeader('Content-Type', 'application/x-x509-ca-cert')
        ctx.proxyToClientResponse.setHeader('Content-Disposition', 'attachment; filename="maskCA.crt"')
        ctx.proxyToClientResponse.end(fs.readFileSync(path.join(app.getPath('userData'), './.mask-ca/certs/ca.pem'), { encoding: null }))
      }
      const requestHeader = ctx.clientToProxyRequest.headers
      const method = ctx.clientToProxyRequest.method
      const currentdate = new Date()
      const start = currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds()
      let requestBody = []
      let queryParams
      let requestInfo
      ctx.onRequestData((ctx, chunk, callback) => {
        requestBody.push(chunk)
        return callback()
      })
      ctx.onRequestEnd((ctx, callback) => {
        if (method === 'POST') {
          try {
            queryParams = JSON.parse(Buffer.concat(requestBody).toString())
          } catch (error) {
            queryParams = ''
          }
        } else {
          queryParams = getQueryParams(fullUrl)
        }
        requestInfo = {
          protocol,
          host,
          urlPath,
          queryParams,
          fullUrl,
          start,
          method,
          requestHeader
        }
        const mactchResult = mactchUrl(fullUrl, selectedRule)
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
        let responseBody = ''
        const statusCode = ctx.serverToProxyResponse.statusCode
        const mime = mimeTypes.lookup(fullUrl) || (ctx.serverToProxyResponse.headers['content-type'] === undefined ? '' : ctx.serverToProxyResponse.headers['content-type'].split(';')[0])
        const responseHeader = ctx.serverToProxyResponse.headers
        if (mime.indexOf('image') !== -1) {
          responseBody = 'data:' + responseHeader['content-type'] + ';base64,' + Buffer.concat(body).toString('base64')
        } else if (mime.indexOf('text') !== -1 || mime === 'application/json' || mime === 'application/javascript') {
          responseBody = body.toString()
        } else {

        }
        const record = Object.assign(requestInfo, {statusCode, mime, isMatched: false, responseHeader, responseBody})
        ctx.proxyToClientResponse.write(Buffer.concat(body))
        global.commit('ADD_RECORDS', record)
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
    console.log(proxy)
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
  const copyInfo = Object.assign({}, requestInfo)
  copyInfo.isMatched = true
  if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') { // is a localfile replacement
    copyInfo.mime = mimeTypes.lookup(mactchResult)
    copyInfo.statusCode = 200
    copyInfo.responseHeader = ''
    try {
      copyInfo.responseBody = fs.readFileSync(mactchResult, 'utf8')
      fs.createReadStream(mactchResult).pipe(ctx.proxyToClientResponse)
    } catch (e) {
      copyInfo.statusCode = 404
      copyInfo.responseBody = 'file not exist'
      ctx.proxyToClientResponse.writeHead(404)
      global.commit('ADD_RECORDS', copyInfo)
      ctx.proxyToClientResponse.end('file not exist')
    }
    global.commit('ADD_RECORDS', copyInfo)
  } else { // http or https request
    const newReq = request({method: copyInfo.method, uri: mactchResult}, (err, response, body) => {
      if (err) {
        copyInfo.statusCode = 500
        copyInfo.responseBody = 'server error'
        ctx.proxyToClientResponse.writeHead(500)
        global.commit('ADD_RECORDS', copyInfo)
        ctx.proxyToClientResponse.end('server error')
      } else {
        copyInfo.responseHeader = response.headers
        copyInfo.statusCode = response.statusCode
        copyInfo.mime = mimeTypes.lookup(mactchResult) || (response.headers['content-type'] === undefined ? '' : response.headers['content-type'].split(';')[0])
        if (copyInfo.mime.indexOf('image') !== -1) {
          copyInfo.responseBody = 'data:' + response.headers['content-type'] + ';base64,' + Buffer.from(body).toString('base64')
        } else if (copyInfo.mime.indexOf('text') !== -1 || copyInfo.mime === 'application/json' || copyInfo.mime === 'application/javascript') {
          copyInfo.responseBody = body.toString('utf8')
        }
        global.commit('ADD_RECORDS', copyInfo)
      }
    })
    ctx.clientToProxyRequest.pipe(newReq).on('response', (res) => {
      res.headers['Access-Control-Allow-Origin'] = ctx.clientToProxyRequest.headers['origin'] || '*'
    }).pipe(ctx.proxyToClientResponse)
  }
}
module.exports = proxyServer
