import { app, BrowserWindow } from 'electron'
import '../utils/store'
const path = require('path')
const systemProxyMgr = require('../utils/proxy/lib/systemProxyMgr')
const lang = require('../utils/detectLang')
const communication = require('./communication')
const setMenu = require('./setMenu')
const updater = require('./updater')
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
/* global variables  */
global.rootPath = path.resolve(__dirname, '../')
global.lang = lang()
/* global variables  */

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })
  /* set menu */
  setMenu()
  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
// disable system proxy when quit
app.on('before-quit', () => {
  systemProxyMgr.disableGlobalProxy()
})
/* communication between main and render */
communication()
/* auto updater */
updater(mainWindow)
