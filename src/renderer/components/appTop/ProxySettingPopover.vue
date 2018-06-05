<template>
  <div class="proxy-setting-popover">
    <el-form ref="proxySettingForm" label-width="130px" :rules="rules" :model="newProxySetting" >
        <el-form-item :label="$lang.appTop.proxySettingPopover.label.port" prop="port">
          <el-input v-model.number="newProxySetting.port"></el-input>
        </el-form-item>
        <el-form-item :label="$lang.appTop.proxySettingPopover.label.autoBind">
          <el-switch v-model="newProxySetting.autoBind"></el-switch>
        </el-form-item>
        <el-form-item :label="$lang.appTop.proxySettingPopover.label.ramSize" prop="ramSize">
          <el-input v-model.number="newProxySetting.ramSize"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleConfirmClick()">{{$lang.common.confirm}}</el-button>
          <el-button @click="handleCancelClick()">{{$lang.common.cancel}}</el-button>
        </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { ipcRenderer } from 'electron'
const systemProxyMgr = require('../../../utils/proxy/lib/systemProxyMgr')
export default {
  name: 'proxySettingPopover',
  data () {
    return {
      newProxySetting: {
        port: '',
        ignoreCache: '',
        autoBind: '',
        ramSize: ''
      },
      rules: {
        port: [
          { required: true, message: this.$lang.appTop.proxySettingPopover.validation.portRule1, trigger: 'blur' },
          { type: 'integer', min: 1000, max: 9999, message: this.$lang.appTop.proxySettingPopover.validation.portRule2, trigger: 'blur' }
        ],
        ramSize: [
          { required: true, message: this.$lang.appTop.proxySettingPopover.validation.ramRule1, trigger: 'blur' },
          { type: 'number', min: 50, message: this.$lang.appTop.proxySettingPopover.validation.ramRule2, trigger: 'blur' }
        ]
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
      this.$refs.proxySettingForm.validate((valid) => {
        if (valid) {
          this.saveProxySetting(this.newProxySetting)
          this.$emit('closeProxySettingPopover')
        } else {
          return false
        }
      })
    },
    handleCancelClick () {
      this.$emit('closeProxySettingPopover')
      this.resetNewProxySetting()
    }
  },
  computed: {
    ...mapState({
      proxySetting: state => state.ProxySetting.proxySetting
    })
  },
  mounted () {
    // if proxy setting loaded, we assign it, otherwise listen for readyForAssignProxySetting event
    if (this.proxySetting.hasOwnProperty('port')) {
      this.resetNewProxySetting()
    } else {
      ipcRenderer.on('readyForAssignProxySetting', (event) => {
        this.resetNewProxySetting()
      })
    }
    // watch for proxy setting change
    this.$store.watch(
      (state) => {
        return this.proxySetting.port
      },
      (val) => {
        // watch proxySetting.port change an auto restart proxy server
        ipcRenderer.send('needRestartProxyServer')
        if (this.proxySetting.autoBind) {
          systemProxyMgr.enableGlobalProxy(val)
        }
      },
      {
        deep: false
      }
    )
    this.$store.watch(
      (state) => {
        return this.proxySetting.autoBind
      },
      (val) => {
        // watch proxySetting.autoBind set system proxy
        if (val) {
          systemProxyMgr.enableGlobalProxy(this.proxySetting.port)
        } else {
          systemProxyMgr.disableGlobalProxy()
        }
      },
      {
        deep: false
      }
    )
  }
}
</script>

<style>

</style>
