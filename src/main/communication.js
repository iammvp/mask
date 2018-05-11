const { ipcMain } = require('electron')
const proxyServer = require('../utils/proxy/')
const systemProxyMgr = require('../utils/proxy/lib/systemProxyMgr')
/* communication between main and render */

function communication () {
  const loadStatus = [] // status of load proxySetting and proxyRule
  ipcMain.on('loadProxySettingReady', (event) => {
    // if autoBind === true set system proxy
    if (global.state.ProxySetting.proxySetting.autoBind === true) {
      systemProxyMgr.enableGlobalProxy(global.state.ProxySetting.proxySetting.port)
    }
    loadStatus.push('loadProxySettingReady')
    // tell render proxySetting is loaded
    event.sender.send('readyForAssignProxySetting')
    if (loadStatus.length === 2) {
      // all loaded we can start server
      proxyServer.start()
    }
  })
  ipcMain.on('loadProxyRuleReady', (event) => {
    loadStatus.push('loadProxyRuleReady')
    if (loadStatus.length === 2) {
      // all loaded we can start server
      proxyServer.start()
    }
  })
  /* proxy rule or setting change restart server */
  ipcMain.on('needRestartProxyServer', (event) => {
    if (global.state.ProxySetting.isProxyServerStart || global.state.ProxySetting.isServerError) {
      proxyServer.restart()
    }
  })
}

module.exports = communication
