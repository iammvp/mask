<template>
  <div class="proxy-info-popover">
    <div class="server-status">状态:<span :class="{red:!isProxyServerStart}">{{serverStatus}}</span></div>
    <template v-if="isProxyServerStart === true">
      <div class="server-address">地址:<span>{{`${localIP}:${proxyPort}`}}</span></div>
      <div class="ram-size">占用内存:<span class="red">{{sizeOfRecords}}</span></div>
    </template>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  name: 'proxyInfoPopover',
  data () {
    return {
    }
  },
  methods: {

  },
  computed: {
    ...mapState({
      isProxyServerStart: state => state.ProxySetting.isProxyServerStart,
      localIP: state => state.ProxySetting.localIP,
      proxyPort: state => state.ProxySetting.proxySetting.port
    }),
    serverStatus () {
      return this.isProxyServerStart ? '已开启' : '未开启'
    },
    ...mapGetters({
      sizeOfRecords: 'sizeOfRecords'
    })
  }
}
</script>

<style lang="less" scoped>
.proxy-info-popover{
  div{
    margin-bottom: 5px;
  }
  span{
    color: #67C23A;
  }
  span.red{
    color: #F56C6C;
  }

}
</style>

