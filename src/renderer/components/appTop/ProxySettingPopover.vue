<template>
  <div class="proxy-setting-popover">
    <el-form ref="proxySettingForm" label-width="130px" :rules="rules" :model="newProxySetting" >
        <el-form-item label="端口" prop="port">
          <el-input v-model.number="newProxySetting.port"></el-input>
        </el-form-item>
        <el-form-item label="代理本机">
          <el-switch v-model="newProxySetting.autoBind"></el-switch>
        </el-form-item>
        <el-form-item label="占用内存(mb)" prop="ramSize">
          <el-input v-model.number="newProxySetting.ramSize"></el-input>
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
          { required: true, message: '请输入端口号', trigger: 'blur' },
          { type: 'integer', min: 1000, max: 9999, message: '端口是1000~9999之间的整数', trigger: 'blur' }
        ],
        ramSize: [
          { required: true, message: '请输入可占用内存大小', trigger: 'blur' },
          { type: 'number', min: 100, message: '可占用内存最小100mb', trigger: 'blur' }
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
    ipcRenderer.on('readyForAssignProxySetting', (event) => {
      this.resetNewProxySetting()
    })
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
