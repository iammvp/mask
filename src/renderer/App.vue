<template>
  <div id="app">
    <el-container class="main-container">
      <el-aside class="app-left">
        <left-menu></left-menu>
      </el-aside>
      <el-container class="app-right">
        <el-header class="app-top-container">
          <app-top></app-top>
        </el-header>
        <el-main class="app-main-container">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { remote } from 'electron'
import LeftMenu from './components/LeftMenu.vue'
import AppTop from './components/appTop/AppTop.vue'
import { mapActions, mapState, mapMutations } from 'vuex'
const prompt = require('electron-prompt')
export default {
  name: 'maskApp',
  components: {
    LeftMenu,
    AppTop
  },
  methods: {
    ...mapMutations({
      setPassword: 'SET_PASSWORD'
    }),
    ...mapActions({
      loadProxySetting: 'loadProxySetting',
      loadRuleList: 'loadRuleList',
      loadUserInfo: 'loadUserInfo'
    })
  },
  computed: {
    ...mapState({
      privilegeState: state => state.Privilege.privilegeState
    })
  },
  mounted () {
    this.loadUserInfo()
    this.$store.watch(
      (state) => {
        return state.Privilege.privilegeState
      },
      (val) => {
        console.log(val)
        // watch proxySetting.autoBind set system proxy
        if (val === true) {
          this.loadProxySetting()
          this.loadRuleList()
        } else {
          prompt({
            title: '管理员密码',
            label: 'Mask设置本地代理需要管理员权限',
            inputAttrs: {
              type: 'password'
            }
          }, remote.getCurrentWindow())
            .then((r) => {
              this.setPassword(r)
            })
            .catch(console.error)
        }
      },
      {
        deep: false
      }
    )
  }
}
</script>

<style lang="less">
*{
  padding: 0;
  margin: 0;
}
a{
  text-decoration: none;
}
html,body{
  height: 100%;
  // max-width: 100%;
  overflow: hidden;
  #app{
    height: 100%;
    position: relative;
    .main-container{
      height: 100%;
      .app-left{
        background: #606266;
        flex:2;
      }
      .app-right{
        flex: 8;
        .app-top-container{
          flex:1;
          display: flex;
          align-items: center;
        }
        .app-main-container{
          flex:9;
        }
      }
    }
  }
}
</style>

