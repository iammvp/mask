import { ipcRenderer } from 'electron'
const {proxySettingDB} = require('../../../utils/localDatabase')
const state = {
  proxySetting: {},
  isProxyServerStart: false,
  isServerError: false,
  localIP: getIPAdress()
}
function getIPAdress () {
  var interfaces = require('os').networkInterfaces()
  for (var devName in interfaces) {
    var iface = interfaces[devName]
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i]
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address
      }
    }
  }
}
const mutations = {
  LOAD_PROXY_SETTING (state, doc) {
    if (doc) {
      state.proxySetting = doc
    } else { // default value
      state.proxySetting = {
        port: 8888,
        ramSize: 200,
        autoBind: false,
        ignoreCache: true
      }
    }
    if (process.type === 'renderer') {
      ipcRenderer.send('loadProxySettingReady')
    }
  },
  SAVE_SETTING (state, settings) {
    state.proxySetting = settings
  },
  UPDATE_PTOXY_SETTING_MODEL (state, {value, key}) {
    state.proxySetting[key] = value
  },
  START_SERVER (state) {
    state.isServerError = false
    state.isProxyServerStart = true
  },
  STOP_SERVER (state) {
    state.isProxyServerStart = false
  },
  SERVER_ERROR (state) {
    state.isServerError = true
  }
}

const actions = {
  loadProxySetting ({ commit }) {
    proxySettingDB.findOne({}, (err, doc) => {
      if (err) throw err
      commit('LOAD_PROXY_SETTING', doc)
    })
  },
  saveProxySetting ({commit}, settings) {
    proxySettingDB.findOne({}, (err, doc) => {
      if (err) throw err
      if (doc) {
        proxySettingDB.update({}, settings, (err, numReplaced) => {
          if (err) throw err
          commit('SAVE_SETTING', settings)
        })
      } else {
        proxySettingDB.insert(settings, (err, newDocs) => {
          if (err) throw err
          commit('SAVE_SETTING', settings)
        })
      }
    })
  }
}

export default {
  state,
  mutations,
  actions
}
