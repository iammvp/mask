const sizeof = require('object-sizeof')
const state = {
  records: []
}

const mutations = {
  CLEAR_RECORDS (state) {
    state.records = []
  },
  ADD_RECORDS (state, newRecord) {
    state.records.push(newRecord)
    // console.log(sizeof(state.records))
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
