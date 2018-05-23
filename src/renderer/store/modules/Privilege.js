// save user adminstrator password
const { privilegeDB } = require('../../../utils/localDatabase')
const systemProxyMgr = require('../../../utils/proxy/lib/systemProxyMgr')
const state = {
  privilegeState: '', // whether app has privilegeState
  isLoad: false, // is userinfo load from database
  hasError: false, // is password has error
  user: {
    username: getUser(),
    password: ''
  }
}
function getUser () {
  return require('os').userInfo().username
}
function swithNoPrivilegeState (state) {
  if (state.privilegeState === '') {
    state.privilegeState = false
  } else {
    state.privilegeState = ''
  }
}
const mutations = {
  LOAD_USER_INFO (state, info) {
    if (info) {
      state.isLoad = true
      state.user.password = info.password
      // let's try if password correct
      if (process.type !== 'renderer') {
        systemProxyMgr.getPrivilegeState()
      }
    } else {
      swithNoPrivilegeState(state)
      // no adminstrator info
    }
  },
  SET_PASSWORD (state, p) {
    state.user.password = p
    // let's try if password correct
    if (process.type !== 'renderer') {
      systemProxyMgr.getPrivilegeState()
    }
  },
  NOT_GRANT_PRIVILEGE (state) {
    state.hasError = true
    swithNoPrivilegeState(state)
  },
  GRANTED_PRIVILEGE (state) {
    state.privilegeState = true
  }
}

const actions = {
  loadUserInfo ({ commit, state }) {
    privilegeDB.findOne({username: state.user.username}, function (err, docs) {
      if (err) throw err
      commit('LOAD_USER_INFO', docs)
    })
  },
  insertUserInfo ({commit}, userInfo) {
    privilegeDB.insert(userInfo, (err, newDocs) => {
      if (err) throw err
    })
  },
  updateUserInfo ({commit, state}, userInfo) {
    privilegeDB.update({username: userInfo.username}, {password: state.user.password}, (err, newDocs) => {
      if (err) throw err
    })
  }
}

export default {
  state,
  mutations,
  actions
}
