const {proxyRuleDB} = require('../../../utils/localDatabase')
const state = {
    ruleLists:[]
  }
  
  const mutations = {
    LOAD_RULE_LIST (state, ruleLists) {
        state.ruleLists = [...ruleLists]
      },
    ADD_RULE_LIST (state,rule) {
      state.ruleLists.push(rule)
    },
    DELETE_RULE_LIST (state, id) {
        state.ruleLists = state.ruleLists.filter(list => list._id !== id)
      },
  }
  
  const actions = {
    loaRuleList({commit}){
        proxyRuleDB.find({}, function (err, docs) {
            if (err) throw err
            commit('LOAD_RULE_LIST', docs)
          })
    },
    addRuleList({commit}, rule){
        proxyRuleDB.insert(rule,(err,newDocs)=>{
            if(err) throw err
            commit('ADD_RULE_LIST',rule)
        })
    },
    deleteRuleList({commit},id){
        proxyRuleDB.remove({_id: id}, function (err, numRemoved) {
            if (err) throw err
            commit('DELETE_RULE_LIST', id)
        })
    },
    updateRuleList({ commit }, {id, list}) {
        proxyRuleDB.update({_id: id}, list, function (err, numReplaced) {
          if (err) throw err
          commit('UPDATE_RULE_LIST', {id, list})
        })
    }
  }
  
  export default {
    state,
    mutations,
    actions
  }