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
    sendStatusToWindow(window, global.lang.updater.updateAvailable)
  })
  autoUpdater.on('error', (err) => {
    sendStatusToWindow(err)
  })
  autoUpdater.on('update-downloaded', () => {
    sendStatusToWindow(window, global.lang.updater.updateDownloaded)
    updateReady = true
  })
}
module.exports = updater
