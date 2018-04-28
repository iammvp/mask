const sizeof = require('object-sizeof')
const _ = require('lodash')
const state = {
  selectedRecord: {},
  filter: '',
  records: [],
  recordsTree: {}
}
function parseUrlToTree (record) {
  const domain = `${record.protocol}//${record.host}`
  const pathArray = record.urlPath.split('/')
  const len = pathArray.length
  pathArray[0] = domain
  let res = {
    [pathArray[len - 1]]: record
  }
  for (let i = len - 2; i >= 0; i--) {
    res = {
      [pathArray[i]]: Object.assign({}, res)
    }
  }
  return res
}
const getters = {
  filteredRecords: state => state.records.filter(r => r.fullUrl.indexOf(state.filter) !== -1),
  sizeOfRecords: state => (sizeof(state.records) / 1024 / 1024).toFixed(2)
}
const mutations = {
  CLEAR_RECORDS (state) {
    state.records = []
  },
  SLICE_RECORDS (state) {
    state.records = state.records.slice(1)
  },
  ADD_RECORDS (state, newRecord) {
    state.records.push(newRecord)
    state.recordsTree = _.defaultsDeep(state.recordsTree, parseUrlToTree(newRecord))
  },
  SELECT_RECORD (state, record) {
    state.selectedRecord = record
  },
  CHANGE_FILTER (state, value) {
    state.filter = value
  }
}

const actions = {
  someAsyncTask ({ commit }) {
    // do something async
    commit('INCREMENT_MAIN_COUNTER')
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
