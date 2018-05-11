<template>
  <div class="proxy-ca-popover">
    <p class="desc" >下载证书:</p>
    <el-button type="success" round @click="handleClickDownload">点击下载</el-button>
    <p class="or">OR</p>
    <div class="qrcode">
      <img :src="qraddress" alt="" srcset="">
    </div>
    <div class="urlOr">OR</div>
    <div class="url" @click="handleClickUrl">访问http://getca.mask</div>
  </div>
</template>

<script>
import { shell, remote } from 'electron'
import fs from 'fs'
import path from 'path'
import QRCode from 'qrcode'
export default {
  data () {
    return {
      qraddress: ''
    }
  },
  methods: {
    handleClickDownload () {
      const options = {
        defaultPath: '~/maskCA.crt'
      }
      remote.dialog.showSaveDialog(remote.getCurrentWindow(), options, (filename) => {
        if (filename === undefined) {
          return
        }
        const caPath = path.join(remote.app.getPath('userData'), './.mask-ca/certs/ca.pem')
        fs.readFile(caPath, 'utf8', (err, file) => {
          if (err) throw err
          fs.writeFile(filename, file, (err) => {
            if (err) throw err
            this.$notify.success({message: '下载CA成功', duration: 1200})
          })
        })
      })
    },
    handleClickUrl () {
      shell.openExternal('http://getca.mask')
    }
  },
  mounted () {
    QRCode.toDataURL('http://getca.mask', (err, url) => {
      if (err) throw err
      this.qraddress = url
    })
  }
}
</script>

<style lang="less" scoped>
.proxy-ca-popover{
  display: flex;
  flex-direction: column;
  align-items:  center;
  .desc{
    align-self: flex-start;
    margin-bottom: 10px;
  }
  .or{
    margin-top: 10px;
  }
  .urlOr{
    margin-bottom: 10px;
  }
  .url{
    cursor: pointer;
  }
}
</style>

