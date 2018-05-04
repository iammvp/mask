const path = require('path')
const url = require('url')
const fs = require('fs')
const mimeTypes = require('mime-types')
const request = require('request')
const Proxy = require('./lib/proxy')
const { dialog } = require('electron')
const downloadCA = 'http://getca.mask/' // url to download CA
let proxy = Proxy()
/* proxy server */
const proxyServer = {
  start () {
    const selectedRule = global.state.ProxyRule.ruleLists.filter(r => r.isSelected)
    const proxyPort = global.state.ProxySetting.proxySetting.port
    proxy.onError(function (ctx, err, errorKind) {
      // ctx may be null
      global.commit('SERVER_ERROR')
      if (err.code === 'EADDRINUSE') {
        dialog.showErrorBox('开启服务器失败', `端口${proxyPort}已被占用`)
      } else {
        console.log(err)
      }
    })
    proxy.onRequest(function (ctx, callback) {
      ctx.use(Proxy.gunzip)
      const protocol = ctx.clientToProxyRequest.connection.encrypted === true ? 'https:' : 'http:'
      const host = ctx.clientToProxyRequest.headers.host
      const urlPath = ctx.clientToProxyRequest.url
      const fullUrl = `${protocol}//${host}${urlPath}`
      const queryParams = getQueryParams(fullUrl)
      const requestHeader = ctx.clientToProxyRequest.headers
      const method = ctx.clientToProxyRequest.method
      const currentdate = new Date()
      const start = currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds()
      const requestInfo = {
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
      if (fullUrl === downloadCA) {
        ctx.proxyToClientResponse.setHeader('Content-Type', 'application/x-x509-ca-cert')
        ctx.proxyToClientResponse.setHeader('Content-Disposition', 'attachment; filename="rootCA.crt"')
        ctx.proxyToClientResponse.end(fs.readFileSync(path.join(global.rootPath, '../.mask-ca/certs/ca.pem'), { encoding: null }))
      } else if (mactchResult !== false) {
        replaceMatch(mactchResult, ctx, requestInfo)
      } else {
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
      }
    })

    proxy.listen({port: proxyPort, silent: true, sslCaDir: './.mask-ca'}, () => {
      global.commit('START_SERVER')
      console.log('server started')
    })
  },
  close () {
    if (proxy !== null) {
      proxy.close()
      proxy = null
    }
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
      copyInfo.responseBody = e
      const Readable = require('stream').Readable
      var s = new Readable()
      s.push('file is not exist')
      s.push(null)
      s.pipe(ctx.proxyToClientResponse)
    }
    global.commit('ADD_RECORDS', copyInfo)
  } else { // http or https request
    request({method: copyInfo.method, uri: mactchResult}, (err, response, body) => {
      if (err) throw err
      copyInfo.responseHeader = response.headers
      copyInfo.statusCode = response.statusCode
      copyInfo.mime = mimeTypes.lookup(mactchResult) || (response.headers['content-type'] === undefined ? '' : response.headers['content-type'].split(';')[0])
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
