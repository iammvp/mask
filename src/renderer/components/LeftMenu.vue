<template>
  <div class="left-menu">
    <router-link to="/"><div class="menu-item">{{$lang.leftMenu.records}}</div></router-link>
    <router-link to="/proxy-rule"><div class="menu-item">{{$lang.leftMenu.rules}}</div></router-link>
    <div class="proxy-address">
      {{ sizeOfRecords}}
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  name: 'LeftMenu',
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
    .proxy-address{
      margin-top: auto;
      height: 50px;
      display: flex;
      font-size: 18px;
      color: #409EFF;
      justify-content: center;
      align-items: center;
    }
    .router-link-exact-active{
      .menu-item{
        background: #303133;
        border-left: 5px solid #67C23A;
      }
    }
  }
</style>

