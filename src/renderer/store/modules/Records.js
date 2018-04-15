const sizeof = require('object-sizeof')
const state = {
  selectedRecord:{},
  records: []
}

const mutations = {
  CLEAR_RECORDS (state) {
    state.records = []
  },
  ADD_RECORDS (state, newRecord) {
    state.records.push(newRecord)
    // console.log(sizeof(state.records))
  },
  SELECT_RECORD(state,record){
    state.selectedRecord = record
    console.log(state.selectedRecord)
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
  mutations,
  actions
}
