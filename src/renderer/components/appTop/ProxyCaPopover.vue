<template>
  <div class="proxy-ca-popover">
    <p class="desc" >{{$lang.appTop.proxyCaPopover.desc}}</p>
    <el-button type="success" round @click="handleClickDownload">{{$lang.appTop.proxyCaPopover.clickDownload}}</el-button>
    <p class="or">{{$lang.appTop.proxyCaPopover.or}}</p>
    <div class="qrcode">
      <img :src="qraddress" alt="" srcset="">
    </div>
    <div class="urlOr">{{$lang.appTop.proxyCaPopover.or}}</div>
    <div class="url" @click="handleClickUrl">{{$lang.appTop.proxyCaPopover.visit}}</div>
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
            this.$notify.success({message: this.$lang.appTop.proxyCaPopover.downloadSuccess, duration: 1200})
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

