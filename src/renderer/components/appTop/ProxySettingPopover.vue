<template>
  <div class="proxy-setting-popover">
    <el-form ref="form" label-width="80px" :model="newProxySetting" >
        <el-form-item label="端口">
          <el-input v-model="newProxySetting.port"></el-input>
        </el-form-item>
          <el-form-item label="即时配送">
            <el-switch v-model="newProxySetting.ignoreCache"></el-switch>
          </el-form-item>
        <el-form-item label="占用内存">
          <el-input v-model="newProxySetting.ramSize"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleConfirmClick()">确定</el-button>
          <el-button @click="handleCancelClick()">取消</el-button>
        </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { ipcRenderer } from 'electron'
export default {
  name: 'proxySettingPopover',
  data () {
    return {
      newProxySetting: {
        port: '',
        ignoreCache: '',
        ramSize: ''
      }
    }
  },
  methods: {
    ...mapActions({
      saveProxySetting: 'saveProxySetting'
    }),
    resetNewProxySetting () {
      this.newProxySetting = {...this.proxySetting}
      delete this.newProxySetting._id
    },
    handleConfirmClick () {
      this.saveProxySetting(this.newProxySetting)
      this.$emit('closeProxyPopover')
    },
    handleCancelClick () {
      this.$emit('closeProxyPopover')
      this.resetNewProxySetting()
    }
  },
  computed: {
    ...mapState({
      proxySetting: state => state.ProxySetting.proxySetting
    })
  },
  mounted () {
    ipcRenderer.on('readyForAssignProxySetting', (event) => {
      this.resetNewProxySetting()
    })
    this.$store.watch(
      (state) => {
        return this.proxySetting
      },
      (val) => {
        // watch proxySetting change an auto restart proxy server
        ipcRenderer.send('needRestartProxyServer')
      },
      {
        deep: true
      })
  }
}
</script>

<style>

</style>
