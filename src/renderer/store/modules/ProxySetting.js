import { ipcRenderer } from 'electron'
import { networkInterfaces } from 'os'
const {proxySettingDB} = require('../../../utils/localDatabase')
const state = {
  proxySetting: {},
  isProxyServerStart: false,
  localIP: networkInterfaces()['en0'][1].address
}

const mutations = {
  LOAD_PROXY_SETTING (state, doc) {
    if (doc) {
      state.proxySetting = doc
    } else {
      state.proxySetting = {
        port: 8888,
        ramSize: 200,
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
    state.isProxyServerStart = true
  },
  STOP_SERVER (state) {
    state.isProxyServerStart = false
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
