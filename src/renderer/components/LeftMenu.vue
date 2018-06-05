<template>
  <div class="left-menu">
    <router-link to="/record-list"><div class="menu-item">{{$lang.leftMenu.records}}</div></router-link>
    <router-link to="/proxy-rule"><div class="menu-item">{{$lang.leftMenu.rules}}</div></router-link>
    <div class="bottom">
      <img :src="githubIcon" alt="" @click="handleClickGithub">
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { shell } from 'electron'
import githubIcon from '../assets/github-logo.png'
export default {
  name: 'LeftMenu',
  data () {
    this.githubIcon = githubIcon
    return {

    }
  },
  methods: {
    handleClickGithub () {
      shell.openExternal(this.$lang.common.githubReadme)
    }
  },
  computed: {
    ...mapState({
      isProxyServerStart: state => state.ProxySetting.isProxyServerStart,
      localIP: state => state.ProxySetting.localIP,
      proxyPort: state => state.ProxySetting.proxySetting.port
    }),
    ...mapGetters({
      sizeOfRecords: 'sizeOfRecords'
    })
  }
}
</script>

<style lang="less" scoped>
  .left-menu{
    display: flex;
    flex-direction: column;
    height: 100%;
    .menu-item{
      color: #fff;
      height: 65px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      &:hover{
        background: #303133;
      }
    }
    .bottom{
      margin-top: auto;
      height: 50px;
      display: flex;
      font-size: 18px;
      color: #fff;
      justify-content: center;
      align-items: center;
      img{
        cursor: pointer;
      }
    }
    .router-link-active{
      .menu-item{
        background: #303133;
        border-left: 5px solid #67C23A;
      }
    }
  }
</style>

