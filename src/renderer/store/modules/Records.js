const sizeof = require('object-sizeof')
const state = {
  selectedRecord: {},
  filter: '',
  records: []
}
const getters = {
  filteredRecords: state => state.records.filter(r => r.url.indexOf(state.filter) !== -1),
  sizeOfRecords: state => (sizeof(state.records) / 1024 / 1024).toFixed(2)
}
const mutations = {
  CLEAR_RECORDS (state) {
    state.records = []
  },
  ADD_RECORDS (state, newRecord) {
    state.records.push(newRecord)
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
