const { remote } = require('electron')
const sizeof = require('object-sizeof')
const _ = require('lodash')
const state = {
  selectedRecord: {},
  filter: '',
  records: [],
  tempRecordsObject: {},
  tempRecordsArray: [], //
  recordsTree: {},
  showRecordDetail: false
}
let timer = null
function refreshPage (state) { // clear all records and reload page to release ram
  state.records = []
  state.recordsTree = {}
  state.showRecordDetail = false
  if (process.type === 'renderer') {
    remote.getCurrentWindow().webContents.reloadIgnoringCache()
  }
}
function parseUrlToTree (record) {
  const domain = `${record.protocol}//${record.host}`
  const pathArray = record.urlPath.split('/')
  const len = pathArray.length
  pathArray[0] = domain
  let res = {
    [pathArray[len - 1]]: {
      isLast: true,
      isShow: false,
      record
    }
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
  sizeOfRecords: state => ((sizeof(state.records) + sizeof(state.recordsTree)) / 1024 / 1024).toFixed(2)
}
const mutations = {
  CLEAR_RECORDS (state) { // clear all record and reload page
    state.records = []
    state.recordsTree = {}
    state.showRecordDetail = false
    if (process.type === 'renderer') {
      remote.getCurrentWindow().webContents.session.clearCache()
    }
  },
  REFRESH_PAGE (state) { // clear all record and reload page, for clear cache and save ram purpose
    refreshPage(state)
  },
  OUT_OF_SIZE_LIMITATION (state) { // proxy data out of size limitation
    refreshPage(state)
  },
  TEMP_SAVE_RECORDS (state, newRecord) {
    state.tempRecordsArray.push(newRecord)
    state.tempRecordsObject = _.defaultsDeep({}, state.tempRecordsObject, parseUrlToTree(newRecord))
  },
  ADD_RECORDS (state, newRecord) {
    state.records.push(...state.tempRecordsArray)
    state.recordsTree = _.defaultsDeep({}, state.recordsTree, state.tempRecordsObject)
    state.tempRecordsArray = []
    state.tempRecordsObject = {}
    if (process.type === 'renderer') {
      remote.getCurrentWindow().webContents.session.clearCache(function () {
      })
    }
    // state.recordsTree = _.defaultsDeep({}, state.recordsTree, parseUrlToTree(newRecord))
  },
  SELECT_RECORD (state, record) {
    state.selectedRecord = record
  },
  CHANGE_FILTER (state, value) {
    state.filter = value
  },
  CLICK_LAST_TREE_NODE (state, value) {
    state.selectedRecord = value
  },
  OPEN_RECORD_DETAIL (state) {
    state.showRecordDetail = true
  },
  CLOSE_RECORD_DETAIL (state) {
    state.showRecordDetail = false
  }

}

const actions = {
  addRecords ({commit}, newRecord) {
    commit('TEMP_SAVE_RECORDS', newRecord)
    clearTimeout(timer)
    timer = setTimeout(() => {
      commit('ADD_RECORDS')
    }, 500)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
