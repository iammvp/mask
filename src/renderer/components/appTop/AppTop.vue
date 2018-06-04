<template>
  <div class="app-top">
    <i class="el-icon-delete clear" @click="clearRecords"></i>
    <i class="el-icon-refresh refresh" @click="refreshPage"></i>
    <el-input class="filter"
    v-show="this.$route.path === '/record-list/sequence-view'"
    v-model="recordFilter"
    :placeholder="$lang.appTop.filterPlaceholder"
    prefix-icon="el-icon-search">
    </el-input>

    <i class="el-icon-setting setting" v-popover:proxySettingPopover></i>
    <!-- proxySettingPopover -->
    <el-popover
      ref="proxySettingPopover"
      placement="bottom"
      width="300"
      v-model="showProxySettingPopover"
      trigger="click">
      <proxy-setting-popover @closeProxySettingPopover="closeProxySettingPopover"></proxy-setting-popover>
    </el-popover>
    <!-- proxySettingPopover -->

    <i class="el-icon-info info" v-popover:proxyInfoPopover></i>
    <!-- proxyInfoPopover -->
    <el-popover
      ref="proxyInfoPopover"
      placement="bottom"
      width="150"
      v-model="proxyInfoPopover"
      trigger="click">
      <proxy-info-popover></proxy-info-popover>
    </el-popover>
    <!-- proxyInfoPopover -->

    <!-- proxyCaPopover -->
    <i class="el-icon-document cert" v-popover:proxyCaPopover></i>
    <el-popover
      ref="proxyCaPopover"
      placement="bottom"
      width="200"
      v-model="proxyCaPopover"
      trigger="click">
      <proxy-ca-popover></proxy-ca-popover>
    </el-popover>
    <!-- proxyCaPopover -->
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import ProxySettingPopover from './ProxySettingPopover'
import ProxyInfoPopover from './ProxyInfoPopover'
import ProxyCaPopover from './ProxyCaPopover'
export default {
  name: 'appTop',
  components: {
    ProxySettingPopover,
    ProxyInfoPopover,
    ProxyCaPopover
  },
  data () {
    return {
      showProxySettingPopover: false,
      proxyInfoPopover: false,
      proxyCaPopover: false
    }
  },
  methods: {
    ...mapMutations({
      clearRecords: 'CLEAR_RECORDS',
      changeFilter: 'CHANGE_FILTER',
      refreshPage: 'REFRESH_PAGE'
    }),
    closeProxySettingPopover () {
      this.showProxySettingPopover = false
    }
  },
  computed: {
    ...mapState({
      filter: state => state.Records.filter
    }),
    recordFilter: {
      get () {
        return this.filter
      },
      set (value) {
        this.changeFilter(value)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.app-top{
  display: flex;
  flex: 1;
  align-items: center;
  .filter{
    width: 200px;
  }
  .clear,.refresh,.setting,.info,.cert{
    width: 38px;
    border-radius: 5px;
    margin-right: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  .refresh{
    height: 40px;
    width: 40px;
    background: #F56C6C;
    color: #fff;
  }
  .clear{
    height: 40px;
    width: 40px;
    background: #E6A23C;
    color: #fff;
  }
  .setting,.info,.cert{
    height: 38px;
    border: 1px solid #909399;
  }
  .setting{
    margin-left: auto;
  }
  .cert{
    margin-right: 0;
  }
}
</style>

