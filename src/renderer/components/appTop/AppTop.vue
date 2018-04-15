<template>
  <div class="app-top">
    <el-tooltip class="item" effect="light" placement="bottom">
      <div slot="content">{{ showProxySettingPopover }}</div>
      <i class="el-icon-delete clear" @click="clearRecords"></i>
    </el-tooltip>

    <el-input class="filter"
    :placeholder="$lang.appTop.filterPlaceholder"
    prefix-icon="el-icon-search">
    </el-input>
    <i class="el-icon-setting setting" v-popover:proxySettingPopover></i>
    <!-- proxySettingPopover -->
    <el-popover
      ref="proxySettingPopover"
      placement="bottom"
      width="400"
      v-model="showProxySettingPopover"
      trigger="click">
      <proxy-setting-popover @closeProxyPopover="closeProxyPopover"></proxy-setting-popover>
    </el-popover>
    <!-- proxySettingPopover -->
    <el-tooltip class="item" effect="light" placement="bottom">
      <div slot="content">{{ $lang.appTop.tips.proxyInfo }}</div>
      <i class="el-icon-info info"></i>
    </el-tooltip>

    <el-tooltip class="item" effect="light" placement="bottom">
      <div slot="content">{{ $lang.appTop.tips.rootCA }}</div>
      <i class="el-icon-document cert"></i>
    </el-tooltip>

  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import ProxySettingPopover from './ProxySettingPopover'
export default {
  name: 'appTop',
  components: {
    ProxySettingPopover
  },
  data(){
    return{
      showProxySettingPopover:false
    }
  },
  methods: {
    ...mapMutations({
      clearRecords: 'CLEAR_RECORDS'
    }),
    closeProxyPopover(){
      this.showProxySettingPopover = false
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
  .clear,.setting,.info,.cert{
    width: 38px;
    border-radius: 5px;
    margin-right: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  .clear{
    height: 40px;
    width: 40px;
    background: #F56C6C;
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

