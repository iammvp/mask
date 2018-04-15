const {proxySettingDB} = require('../../../utils/localDatabase')
const state = {
    proxySetting : {}
}

const mutations = {
    LOAD_PROXY_SETTING(state,doc){
        if(doc){
            state.proxySetting = doc
        }else{
            state.proxySetting = {
                port:8888,
                ramSize:200,
                ignoreCache:true
            }
        }
    },
  CHANGR_SETTING (state,settings) {
    state.localStorage =  settings
  }
}

const actions = {
    loadProxySetting ({ commit }) {
      proxySettingDB.findOne({},(err, doc) => {
          if(err) throw err
          console.log(1)
          commit('LOAD_PROXY_SETTING',doc)
      })  
    },
    changeProxySetting({commit}, settings){
        proxySettingDB.findOne({},(err, doc) => {
            if(err) throw err
            if(doc){
                proxySettingDB.update({},settings, (err,numReplaced)=>{
                    if(err) throw err
                    commit('CHANGR_SETTING',settings)
                })
            }else{
                proxySettingDB.insert(settings,(err,newDocs)=>{
                    if(err) throw err
                    commit('CHANGR_SETTING',settings)
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