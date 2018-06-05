<template>
  <div class="proxy-info-popover">
    <div class="server-status">{{$lang.appTop.proxyInfoPopover.status}}<span :class="{red:!isProxyServerStart}">{{serverStatus}}</span></div>
    <template v-if="isProxyServerStart === true">
      <div class="server-address">{{$lang.appTop.proxyInfoPopover.address}}<span>{{`${localIP}:${proxyPort}`}}</span></div>
      <div class="ram-size">{{$lang.appTop.proxyInfoPopover.ram}}<span class="red">{{sizeOfRecords}}</span></div>
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
      return this.isProxyServerStart ? this.$lang.appTop.proxyInfoPopover.started : this.$lang.appTop.proxyInfoPopover.notStarted
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

