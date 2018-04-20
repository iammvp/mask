import { ipcRenderer } from 'electron'
const {proxyRuleDB} = require('../../../utils/localDatabase')
const state = {
  ruleLists: []
}
const mutations = {
  LOAD_RULE_LIST (state, ruleLists) {
    const sortedRuleList = ruleLists.sort((x, y) => ((x.time < y.time) ? -1 : ((x.time > y.time) ? 1 : 0)))
    state.ruleLists = [...sortedRuleList]
    if (process.type === 'renderer') {
      ipcRenderer.send('loadProxyRuleReady')
    }
  },
  ADD_RULE_LIST (state, rule) {
    state.ruleLists.push(rule)
  },
  DELETE_RULE_LIST (state, id) {
    state.ruleLists = state.ruleLists.filter(list => list._id !== id)
  },
  UPDATE_RULE_LIST (state, {id, list}) {
    state.ruleLists.forEach(l => {
      if (l._id === id) {
        l = Object.assign(l, list)
      }
    })
  },
  TOGGLE_RULE_SELECTION (state, list) {
    state.ruleLists.forEach(l => {
      if (l._id === list._id) {
        l.isSelected = !l.isSelected
      }
    })
  }
}

const actions = {
  loadRuleList ({commit}) {
    proxyRuleDB.find({}, function (err, docs) {
      if (err) throw err
      commit('LOAD_RULE_LIST', docs)
    })
  },
  addRuleList ({commit}, rule) {
    proxyRuleDB.insert(rule, (err, newDocs) => {
      if (err) throw err
      commit('ADD_RULE_LIST', newDocs)
    })
  },
  deleteRuleList ({commit}, id) {
    proxyRuleDB.remove({_id: id}, function (err, numRemoved) {
      if (err) throw err
      commit('DELETE_RULE_LIST', id)
    })
  },
  updateRuleList ({ commit }, {id, list}) {
    proxyRuleDB.update({_id: id}, list, function (err, numReplaced) {
      if (err) throw err
      commit('UPDATE_RULE_LIST', {id, list})
    })
  },
  toggleRuleSelection ({ commit }, list) {
    proxyRuleDB.update({_id: list._id}, { $set: { isSelected: !list.isSelected } }, function (err, numReplaced) {
      if (err) throw err
      commit('TOGGLE_RULE_SELECTION', list)
    })
  }
}

export default {
  state,
  mutations,
  actions
}
