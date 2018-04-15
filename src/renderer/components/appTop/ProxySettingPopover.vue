<template>
  <div class="proxy-setting-popover">
    <el-form ref="form" :model="proxySettingCopy" label-width="80px">
        <el-form-item label="端口">
          <el-input v-model="proxySettingCopy.port"></el-input>
        </el-form-item>
          <el-form-item label="即时配送">
            <el-switch v-model="proxySettingCopy.ignoreCache"></el-switch>
          </el-form-item>
        <el-form-item label="占用内存">
          <el-input v-model="proxySettingCopy.ramSize"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleConfirmClick()">确定</el-button>
          <el-button @click="handleCancelClick()">取消</el-button>
        </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapState,mapActions } from 'vuex'
export default {
  name: 'proxySettingPopover',
  methods: {
    ...mapActions({
      changeProxySetting:'changeProxySetting'
    }),
    handleConfirmClick(){
      this.changeProxySetting(this.proxySettingCopy)
      this.$emit('closeProxyPopover')
    },
    handleCancelClick(){
      this.$emit('closeProxyPopover')
    }
  },
  computed: mapState({
    proxySetting: state => state.ProxySetting.proxySetting,
    proxySettingCopy(){
      return {...this.proxySetting}
    }
  })
}
</script>

<style>

</style>
