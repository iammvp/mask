<template>
  <div class="proxy-setting-popover">
    <el-form ref="form" :model="proxySettingData" label-width="80px">
        <el-form-item label="端口">
          <el-input v-model="proxySettingData.proxyPort"></el-input>
        </el-form-item>
          <el-form-item label="即时配送">
            <el-switch v-model="proxySettingData.ignoreCache"></el-switch>
          </el-form-item>
        <el-form-item label="即时配送">
          <el-switch v-model="proxySettingData.proxyHttps"></el-switch>
        </el-form-item>
        <el-form-item label="端口">
          <el-input v-model="proxySettingData.ramSize"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">确定</el-button>
          <el-button>取消</el-button>
        </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'proxySettingPopover',
  data () {
    return {
      proxySettingData: {
        proxyPort: 8888,
        ignoreCache: true,
        proxyHttps: false,
        ramSize: ''
      }
    }
  }
}
</script>

<style>

</style>
