const { autoUpdater } = require('electron-updater')
const { app } = require('electron')
function sendStatusToWindow (window, text) {
  window.webContents.send('updateStatus', text)
}
function updater (window) {
  let updateReady = false
  app.on('ready', () => {
    if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
  })
  app.on('before-quit', () => {
    if (updateReady) {
      autoUpdater.quitAndInstall()
    }
  })
  autoUpdater.on('update-available', (info) => {
    sendStatusToWindow(window, '检测到新版本,后台自动下载,下载完成会提示')
  })
  autoUpdater.on('error', (err) => {
    sendStatusToWindow(err)
  })
  autoUpdater.on('update-downloaded', () => {
    sendStatusToWindow(window, '下载成功,关闭程序会自动安装')
    updateReady = true
  })
}
module.exports = updater
